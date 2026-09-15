import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from '../auth/jwt.types';
import {
  calcularStatusPlano,
  statusPlanoBloqueiaAcesso,
} from './plan-status.util';

/**
 * Não é global — precisa ser adicionado explicitamente junto com o
 * JwtAuthGuard: `@UseGuards(JwtAuthGuard, PlanoAtivoGuard)`, mesma razão do
 * RolesGuard (precisa de `request.user` já populado). Bloqueia quando o
 * teste grátis acabou sem assinatura ativa (EXPIRED) ou quando a assinatura
 * foi cancelada (CANCELED) — PAST_DUE continua liberado, ver
 * `statusPlanoBloqueiaAcesso`.
 */
@Injectable()
export class PlanoAtivoGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
    const usuario = request.user;

    if (!usuario) {
      return true;
    }

    const restaurante = await this.prisma.restaurante.findUniqueOrThrow({
      where: { id: usuario.restauranteId },
      select: { statusAssinatura: true, trialEndsAt: true },
    });

    const status = calcularStatusPlano(restaurante);
    if (statusPlanoBloqueiaAcesso(status)) {
      const mensagem =
        status === 'CANCELED'
          ? 'Sua assinatura do Comandaí foi cancelada. Escolha um plano para continuar usando o Comandaí.'
          : 'Seu teste grátis acabou. Escolha um plano para continuar usando o Comandaí.';
      throw new HttpException(mensagem, HttpStatus.PAYMENT_REQUIRED);
    }

    return true;
  }
}
