import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { gerarTokenAleatorio, hashToken } from '../common/token.util';
import { PrismaService } from '../prisma/prisma.service';

const DIAS_TTL_REFRESH_TOKEN = Number(process.env.REFRESH_TOKEN_TTL_DIAS ?? 30);
const DIAS_RETENCAO_LIMPEZA = 30;

export interface RefreshTokenMeta {
  userAgent?: string;
  ip?: string;
}

function calcularExpiracao(): Date {
  return new Date(Date.now() + DIAS_TTL_REFRESH_TOKEN * 24 * 60 * 60 * 1000);
}

@Injectable()
export class RefreshTokenService {
  private readonly logger = new Logger(RefreshTokenService.name);

  constructor(private readonly prisma: PrismaService) {}

  async emitir(
    usuarioId: string,
    meta: RefreshTokenMeta = {},
  ): Promise<string> {
    const token = gerarTokenAleatorio();
    await this.prisma.refreshToken.create({
      data: {
        usuarioId,
        tokenHash: hashToken(token),
        expiraEm: calcularExpiracao(),
        userAgent: meta.userAgent,
        ip: meta.ip,
      },
    });
    return token;
  }

  /**
   * Rotaciona o refresh token: revoga o apresentado e emite um sucessor.
   * Reapresentar um token já revogado é sinal de roubo/replay — nesse caso
   * revoga todas as sessões do usuário em vez de só rejeitar essa tentativa.
   */
  async rotacionar(
    tokenBruto: string,
    meta: RefreshTokenMeta = {},
  ): Promise<{ usuarioId: string; refreshToken: string }> {
    const registro = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(tokenBruto) },
    });

    if (!registro) {
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }

    if (registro.revogadoEm) {
      this.logger.warn(
        `Reuso de refresh token detectado para o usuário ${registro.usuarioId} — revogando todas as sessões`,
      );
      await this.revogarTodosDoUsuario(registro.usuarioId);
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }

    if (registro.expiraEm < new Date()) {
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }

    const novoToken = gerarTokenAleatorio();
    const novoTokenHash = hashToken(novoToken);

    await this.prisma.$transaction([
      this.prisma.refreshToken.update({
        where: { id: registro.id },
        data: {
          revogadoEm: new Date(),
          substituidoPorTokenHash: novoTokenHash,
        },
      }),
      this.prisma.refreshToken.create({
        data: {
          usuarioId: registro.usuarioId,
          tokenHash: novoTokenHash,
          expiraEm: calcularExpiracao(),
          userAgent: meta.userAgent,
          ip: meta.ip,
        },
      }),
    ]);

    return { usuarioId: registro.usuarioId, refreshToken: novoToken };
  }

  async revogar(tokenBruto: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(tokenBruto), revogadoEm: null },
      data: { revogadoEm: new Date() },
    });
  }

  async revogarTodosDoUsuario(usuarioId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { usuarioId, revogadoEm: null },
      data: { revogadoEm: new Date() },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async limparTokensAntigos(): Promise<void> {
    const limite = new Date(
      Date.now() - DIAS_RETENCAO_LIMPEZA * 24 * 60 * 60 * 1000,
    );
    await this.prisma.refreshToken.deleteMany({
      where: {
        OR: [{ expiraEm: { lt: limite } }, { revogadoEm: { lt: limite } }],
      },
    });
  }
}
