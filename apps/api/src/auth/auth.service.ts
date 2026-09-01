import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { CargoUsuario, PlanoRestaurante } from '../../generated/prisma/client';
import { exigirVariavelAmbiente } from '../common/env.util';
import { gerarSlugUnico } from '../common/slugify.util';
import { gerarTokenAleatorio, hashToken } from '../common/token.util';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrarDto } from './dto/registrar.dto';
import { EmailService } from './email.service';
import { UsuarioGoogle } from './google.types';
import { JwtPayload, JwtPayloadParcial2fa } from './jwt.types';
import { RefreshTokenMeta, RefreshTokenService } from './refresh-token.service';
import { TwoFactorService } from './two-factor.service';

const TTL_TOKEN_PARCIAL_2FA = '5m';

// Hash bcrypt de um valor fixo qualquer — nunca corresponde a senha
// nenhuma. Usado só pra `bcrypt.compare` sempre rodar o mesmo trabalho
// computacional, mesmo quando o e-mail não existe (ver login() — evita que
// a diferença de tempo de resposta revele quais e-mails têm conta).
const HASH_DUMMY_TEMPO_CONSTANTE =
  '$2b$10$4cBsK3eeqcZ2sYeBHxyUKeLlj2ApwxgbZlNu6oMXMrATDOYkpMCdO';

const JANELA_LOCKOUT_LOGIN_MS = 15 * 60_000;
const LIMITE_TENTATIVAS_FALHAS_POR_EMAIL = 10;
const DIAS_RETENCAO_TENTATIVAS_LOGIN = 1;

export interface UsuarioResumo {
  id: string;
  nome: string;
  email: string;
  cargo: CargoUsuario;
}

interface CodigoTrocaGoogle {
  accessToken: string;
  refreshToken: string;
  usuario: UsuarioResumo;
  expiraEm: number;
}

const TTL_CODIGO_TROCA_MS = 60_000;
const TTL_TOKEN_REDEFINICAO_MS = 30 * 60_000;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly codigosTrocaGoogle = new Map<string, CodigoTrocaGoogle>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly refreshTokenService: RefreshTokenService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  private async emitirTokenParcial2fa(usuarioId: string): Promise<string> {
    const payload: JwtPayloadParcial2fa = {
      sub: usuarioId,
      tipo: 'PARCIAL_2FA',
    };
    return this.jwtService.signAsync(payload, {
      expiresIn: TTL_TOKEN_PARCIAL_2FA,
    });
  }

  private async emitirTokens(
    usuario: {
      id: string;
      nome: string;
      email: string;
      cargo: CargoUsuario;
      restauranteId: string;
    },
    meta?: RefreshTokenMeta,
  ) {
    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      restauranteId: usuario.restauranteId,
      cargo: usuario.cargo,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.refreshTokenService.emitir(usuario.id, meta),
    ]);

    return {
      accessToken,
      refreshToken,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
      },
    };
  }

  async login(email: string, senha: string, meta?: RefreshTokenMeta) {
    await this.verificarLockoutPorEmail(email);

    const usuario = await this.prisma.usuario.findUnique({ where: { email } });

    // Roda o bcrypt.compare SEMPRE, mesmo quando o e-mail não existe (contra
    // um hash dummy fixo) — senão o tempo de resposta denunciaria quais
    // e-mails têm conta (bcrypt.compare custa ~100ms; um retorno imediato
    // sem rodá-lo é visivelmente mais rápido e vira um oráculo de timing).
    const senhaValida = await bcrypt.compare(
      senha,
      usuario?.senhaHash ?? HASH_DUMMY_TEMPO_CONSTANTE,
    );

    if (!usuario || !usuario.senhaHash || !senhaValida) {
      await this.registrarTentativaFalha(email);

      if (usuario && !usuario.senhaHash) {
        throw new UnauthorizedException(
          'Esta conta usa login com Google. Use o botão "Continuar com Google".',
        );
      }
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (usuario.doisFatoresAtivo) {
      return {
        requiresTwoFactor: true as const,
        tempToken: await this.emitirTokenParcial2fa(usuario.id),
      };
    }

    return this.emitirTokens(usuario, meta);
  }

  /**
   * Complementa o rate limit por IP (que já existe via @Throttle na rota):
   * um atacante distribuído (credential stuffing via botnet/proxies) faz
   * poucas tentativas por IP, mas ainda concentra muitas tentativas na
   * mesma CONTA — essa trava pega esse caso.
   */
  private async verificarLockoutPorEmail(email: string): Promise<void> {
    const desde = new Date(Date.now() - JANELA_LOCKOUT_LOGIN_MS);
    const tentativas = await this.prisma.tentativaLoginFalha.count({
      where: { email, criadoEm: { gte: desde } },
    });

    if (tentativas >= LIMITE_TENTATIVAS_FALHAS_POR_EMAIL) {
      throw new HttpException(
        'Muitas tentativas de login para esta conta. Tente novamente em alguns minutos.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private async registrarTentativaFalha(email: string): Promise<void> {
    await this.prisma.tentativaLoginFalha.create({ data: { email } });
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async limparTentativasLoginAntigas(): Promise<void> {
    try {
      const limite = new Date(
        Date.now() - DIAS_RETENCAO_TENTATIVAS_LOGIN * 24 * 60 * 60 * 1000,
      );
      await this.prisma.tentativaLoginFalha.deleteMany({
        where: { criadoEm: { lt: limite } },
      });
    } catch (erro) {
      this.logger.error('Falha ao limpar tentativas de login antigas', erro);
    }
  }

  async verificarDoisFatores(
    tempToken: string,
    codigo: string,
    meta?: RefreshTokenMeta,
  ) {
    let payload: JwtPayloadParcial2fa;
    try {
      payload =
        await this.jwtService.verifyAsync<JwtPayloadParcial2fa>(tempToken);
    } catch {
      throw new UnauthorizedException('Sessão de verificação expirada');
    }

    if (payload.tipo !== 'PARCIAL_2FA') {
      throw new UnauthorizedException('Token inválido para esta operação');
    }

    await this.twoFactorService.verificarCodigo(payload.sub, codigo);

    const usuario = await this.prisma.usuario.findUniqueOrThrow({
      where: { id: payload.sub },
    });

    return this.emitirTokens(usuario, meta);
  }

  async registrar(dto: RegistrarDto, meta?: RefreshTokenMeta) {
    const emailEmUso = await this.prisma.usuario.findUnique({
      where: { email: dto.email },
    });
    if (emailEmUso) {
      throw new ConflictException('Já existe uma conta com este e-mail');
    }

    const slug = await gerarSlugUnico(
      dto.nomeRestaurante,
      async (candidato) => {
        const existente = await this.prisma.restaurante.findUnique({
          where: { slug: candidato },
        });
        return existente !== null;
      },
    );

    const senhaHash = await bcrypt.hash(dto.senha, 10);

    const usuario = await this.prisma.$transaction(async (tx) => {
      const restaurante = await tx.restaurante.create({
        data: {
          nome: dto.nomeRestaurante,
          slug,
          plano: PlanoRestaurante.FREE,
        },
      });

      return tx.usuario.create({
        data: {
          nome: dto.nomeDono,
          email: dto.email,
          senhaHash,
          cargo: CargoUsuario.DONO,
          restauranteId: restaurante.id,
        },
      });
    });

    return this.emitirTokens(usuario, meta);
  }

  async loginOuRegistrarComGoogle(
    dados: UsuarioGoogle,
    meta?: RefreshTokenMeta,
  ) {
    let usuario = await this.prisma.usuario.findUnique({
      where: { googleId: dados.googleId },
    });

    if (!usuario) {
      const porEmail = await this.prisma.usuario.findUnique({
        where: { email: dados.email },
      });
      if (porEmail) {
        usuario = await this.prisma.usuario.update({
          where: { id: porEmail.id },
          data: { googleId: dados.googleId },
        });
      }
    }

    if (!usuario) {
      const nomeRestaurante = `Restaurante de ${dados.nome}`;
      const slug = await gerarSlugUnico(nomeRestaurante, async (candidato) => {
        const existente = await this.prisma.restaurante.findUnique({
          where: { slug: candidato },
        });
        return existente !== null;
      });

      usuario = await this.prisma.$transaction(async (tx) => {
        const restaurante = await tx.restaurante.create({
          data: {
            nome: nomeRestaurante,
            slug,
            plano: PlanoRestaurante.FREE,
          },
        });

        return tx.usuario.create({
          data: {
            nome: dados.nome,
            email: dados.email,
            googleId: dados.googleId,
            cargo: CargoUsuario.DONO,
            restauranteId: restaurante.id,
          },
        });
      });
    }

    if (usuario.doisFatoresAtivo) {
      return {
        requiresTwoFactor: true as const,
        tempToken: await this.emitirTokenParcial2fa(usuario.id),
      };
    }

    return this.emitirTokens(usuario, meta);
  }

  criarCodigoTrocaTemporario(
    accessToken: string,
    refreshToken: string,
    usuario: UsuarioResumo,
  ): string {
    const codigo = randomUUID();
    this.codigosTrocaGoogle.set(codigo, {
      accessToken,
      refreshToken,
      usuario,
      expiraEm: Date.now() + TTL_CODIGO_TROCA_MS,
    });
    return codigo;
  }

  trocarCodigoTemporario(codigo: string) {
    const registro = this.codigosTrocaGoogle.get(codigo);
    this.codigosTrocaGoogle.delete(codigo);

    if (!registro || registro.expiraEm < Date.now()) {
      throw new UnauthorizedException('Código de login inválido ou expirado');
    }

    return {
      accessToken: registro.accessToken,
      refreshToken: registro.refreshToken,
      usuario: registro.usuario,
    };
  }

  async refresh(refreshTokenBruto: string, meta?: RefreshTokenMeta) {
    const { usuarioId, refreshToken } =
      await this.refreshTokenService.rotacionar(refreshTokenBruto, meta);

    const usuario = await this.prisma.usuario.findUniqueOrThrow({
      where: { id: usuarioId },
    });

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      restauranteId: usuario.restauranteId,
      cargo: usuario.cargo,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      refreshToken,
    };
  }

  async logout(refreshTokenBruto: string): Promise<void> {
    await this.refreshTokenService.revogar(refreshTokenBruto);
  }

  async logoutTodasSessoes(usuarioId: string): Promise<void> {
    await this.refreshTokenService.revogarTodosDoUsuario(usuarioId);
  }

  async criarTokenRedefinicao(usuarioId: string): Promise<string> {
    await this.prisma.tokenRedefinicaoSenha.deleteMany({
      where: { usuarioId },
    });

    const token = gerarTokenAleatorio();
    await this.prisma.tokenRedefinicaoSenha.create({
      data: {
        usuarioId,
        tokenHash: hashToken(token),
        expiraEm: new Date(Date.now() + TTL_TOKEN_REDEFINICAO_MS),
      },
    });

    return token;
  }

  async solicitarRedefinicaoSenha(email: string): Promise<void> {
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return;
    }

    const token = await this.criarTokenRedefinicao(usuario.id);
    const origemFrontend = exigirVariavelAmbiente('CORS_ORIGIN');
    const link = `${origemFrontend}/redefinir-senha?token=${token}`;

    try {
      await this.emailService.enviarEmailRedefinicaoSenha(usuario.email, link);
    } catch (erro) {
      this.logger.error(
        `Falha ao enviar e-mail de redefinição para ${usuario.email}`,
        erro instanceof Error ? erro.stack : erro,
      );
    }
  }

  async redefinirSenha(token: string, novaSenha: string): Promise<void> {
    const registro = await this.prisma.tokenRedefinicaoSenha.findUnique({
      where: { tokenHash: hashToken(token) },
    });

    if (!registro || registro.expiraEm < new Date()) {
      throw new UnauthorizedException(
        'Token de redefinição inválido ou expirado',
      );
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await this.prisma.$transaction([
      this.prisma.usuario.update({
        where: { id: registro.usuarioId },
        data: { senhaHash },
      }),
      this.prisma.tokenRedefinicaoSenha.delete({ where: { id: registro.id } }),
    ]);

    await this.refreshTokenService.revogarTodosDoUsuario(registro.usuarioId);
  }

  async me(userId: string) {
    const usuario = await this.prisma.usuario.findUniqueOrThrow({
      where: { id: userId },
    });
    return {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      cargo: usuario.cargo,
      restauranteId: usuario.restauranteId,
      doisFatoresAtivo: usuario.doisFatoresAtivo,
    };
  }
}
