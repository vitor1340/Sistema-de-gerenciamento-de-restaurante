import { SetMetadata } from '@nestjs/common';
import type { CargoUsuario } from '../../generated/prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Marca uma rota como restrita a determinados cargos (`CargoUsuario`).
 * Só tem efeito combinado com `@UseGuards(JwtAuthGuard, RolesGuard)` na
 * mesma rota/controller (ver roles.guard.ts pro motivo de precisar dos
 * dois guards explícitos, nessa ordem).
 *
 * Ainda não usado em nenhuma rota: hoje só existe usuário DONO na
 * aplicação (sem fluxo de convite de equipe), então não há regra de
 * negócio definida ainda pro que GERENTE/ATENDENTE podem fazer.
 */
export const Roles = (...cargos: CargoUsuario[]) =>
  SetMetadata(ROLES_KEY, cargos);
