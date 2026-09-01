import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { CargoUsuario } from '../../generated/prisma/client';
import { ROLES_KEY } from './roles.decorator';
import type { AuthenticatedUser } from './jwt.types';

/**
 * NÃO é global — precisa ser adicionado explicitamente junto com o
 * JwtAuthGuard: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(...)` no
 * controller/rota que quiser restringir. A ordem importa: JwtAuthGuard
 * precisa rodar primeiro pra popular `request.user` antes deste guard ler
 * `usuario.cargo` (por isso não registrei como APP_GUARD global — um guard
 * global roda ANTES dos guards de controller/rota, e `request.user` ainda
 * não existiria nesse ponto).
 *
 * Sem `@Roles(...)` numa rota, este guard deixa passar (fail-open) — hoje
 * nenhuma rota usa isso ainda: só existe usuário DONO na aplicação (sem
 * fluxo de convite de equipe), então não há regra de negócio definida
 * ainda pro que GERENTE/ATENDENTE podem fazer.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const cargosPermitidos = this.reflector.getAllAndOverride<CargoUsuario[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!cargosPermitidos || cargosPermitidos.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
    const usuario = request.user;

    if (!usuario || !cargosPermitidos.includes(usuario.cargo)) {
      throw new ForbiddenException(
        'Seu cargo não tem permissão para esta ação',
      );
    }

    return true;
  }
}
