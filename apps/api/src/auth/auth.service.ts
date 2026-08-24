import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { CargoUsuario, PlanoRestaurante } from '../../generated/prisma/client';
import { gerarSlugUnico } from '../common/slugify.util';
import { PrismaService } from '../prisma/prisma.service';
import { RegistrarDto } from './dto/registrar.dto';
import { UsuarioGoogle } from './google.types';
import { JwtPayload } from './jwt.types';

export interface UsuarioResumo {
  id: string;
  nome: string;
  email: string;
  cargo: CargoUsuario;
}

interface CodigoTrocaGoogle {
  accessToken: string;
  usuario: UsuarioResumo;
  expiraEm: number;
}

const TTL_CODIGO_TROCA_MS = 60_000;

@Injectable()
export class AuthService {
  private readonly codigosTrocaGoogle = new Map<string, CodigoTrocaGoogle>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, senha: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    if (!usuario.senhaHash) {
      throw new UnauthorizedException(
        'Esta conta usa login com Google. Use o botão "Continuar com Google".',
      );
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      restauranteId: usuario.restauranteId,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
      },
    };
  }

  async registrar(dto: RegistrarDto) {
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

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      restauranteId: usuario.restauranteId,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
      },
    };
  }

  async loginOuRegistrarComGoogle(dados: UsuarioGoogle) {
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

    const payload: JwtPayload = {
      sub: usuario.id,
      email: usuario.email,
      restauranteId: usuario.restauranteId,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        cargo: usuario.cargo,
      },
    };
  }

  criarCodigoTrocaTemporario(
    accessToken: string,
    usuario: UsuarioResumo,
  ): string {
    const codigo = randomUUID();
    this.codigosTrocaGoogle.set(codigo, {
      accessToken,
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

    return { accessToken: registro.accessToken, usuario: registro.usuario };
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
    };
  }
}
