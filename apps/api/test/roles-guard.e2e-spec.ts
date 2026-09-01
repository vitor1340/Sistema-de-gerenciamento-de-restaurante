import 'dotenv/config';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CargoUsuario } from './../generated/prisma/client';
import type { AuthenticatedUser } from './../src/auth/jwt.types';
import { Roles } from './../src/auth/roles.decorator';
import { RolesGuard } from './../src/auth/roles.guard';

/**
 * Testa só o mecanismo do RolesGuard/@Roles em isolamento (sem subir a
 * aplicação nem bater no banco) — a estrutura foi criada sem aplicar
 * nenhuma restrição real ainda (nenhuma rota usa @Roles hoje), então não
 * há regra de negócio pra testar de ponta a ponta, só o comportamento do
 * guard em si.
 */
describe('RolesGuard (mecanismo, sem rota real)', () => {
  const guard = new RolesGuard(new Reflector());

  class ControllerFake {
    @Roles(CargoUsuario.DONO)
    rotaSoDono(this: void) {}

    rotaSemRestricao(this: void) {}
  }

  function criarContexto(
    handler: () => void,
    usuario: AuthenticatedUser | undefined,
  ): ExecutionContext {
    return {
      getHandler: () => handler,
      getClass: () => ControllerFake,
      switchToHttp: () => ({ getRequest: () => ({ user: usuario }) }),
    } as unknown as ExecutionContext;
  }

  it('rota sem @Roles deixa passar mesmo sem usuário autenticado (fail-open)', () => {
    const contexto = criarContexto(
      ControllerFake.prototype.rotaSemRestricao,
      undefined,
    );
    expect(guard.canActivate(contexto)).toBe(true);
  });

  it('rota com @Roles(DONO) permite usuário DONO', () => {
    const usuario: AuthenticatedUser = {
      userId: 'usuario-fake',
      email: 'dono@teste.comandai.dev',
      restauranteId: 'restaurante-fake',
      cargo: CargoUsuario.DONO,
    };
    const contexto = criarContexto(
      ControllerFake.prototype.rotaSoDono,
      usuario,
    );
    expect(guard.canActivate(contexto)).toBe(true);
  });

  it('rota com @Roles(DONO) bloqueia usuário com cargo diferente', () => {
    const usuario: AuthenticatedUser = {
      userId: 'usuario-fake',
      email: 'atendente@teste.comandai.dev',
      restauranteId: 'restaurante-fake',
      cargo: CargoUsuario.ATENDENTE,
    };
    const contexto = criarContexto(
      ControllerFake.prototype.rotaSoDono,
      usuario,
    );
    expect(() => guard.canActivate(contexto)).toThrow(ForbiddenException);
  });

  it('rota com @Roles(DONO) bloqueia quando não há usuário autenticado', () => {
    const contexto = criarContexto(
      ControllerFake.prototype.rotaSoDono,
      undefined,
    );
    expect(() => guard.canActivate(contexto)).toThrow(ForbiddenException);
  });
});
