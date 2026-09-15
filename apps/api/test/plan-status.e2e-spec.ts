import { StatusAssinatura } from '../generated/prisma/client';
import {
  calcularDiasRestantesTeste,
  calcularStatusPlano,
  statusPlanoBloqueiaAcesso,
} from '../src/restaurantes/plan-status.util';

/**
 * Função pura, sem dependência de banco/app — roda como teste unitário,
 * só está na pasta test/ (com sufixo .e2e-spec.ts) pra caber no testRegex
 * já configurado em test/jest-e2e.json.
 */
describe('calcularStatusPlano (unit)', () => {
  it('dentro do teste: retorna TRIALING', () => {
    const trialEndsAt = new Date('2026-01-08T00:00:00Z');
    const agora = new Date('2026-01-05T12:00:00Z');

    expect(
      calcularStatusPlano(
        { statusAssinatura: StatusAssinatura.TRIALING, trialEndsAt },
        agora,
      ),
    ).toBe('TRIALING');
  });

  it('no último instante antes do fim do teste: ainda TRIALING', () => {
    const trialEndsAt = new Date('2026-01-08T00:00:00Z');
    const agora = new Date(trialEndsAt.getTime() - 1);

    expect(
      calcularStatusPlano(
        { statusAssinatura: StatusAssinatura.TRIALING, trialEndsAt },
        agora,
      ),
    ).toBe('TRIALING');
  });

  it('no dia seguinte ao fim do teste: EXPIRED', () => {
    const trialEndsAt = new Date('2026-01-08T00:00:00Z');
    const agora = new Date('2026-01-09T00:00:00Z');

    expect(
      calcularStatusPlano(
        { statusAssinatura: StatusAssinatura.TRIALING, trialEndsAt },
        agora,
      ),
    ).toBe('EXPIRED');
  });

  it('com assinatura ativa, ignora trialEndsAt mesmo vencido no passado', () => {
    const trialEndsAt = new Date('2020-01-01T00:00:00Z');

    expect(
      calcularStatusPlano({
        statusAssinatura: StatusAssinatura.ACTIVE,
        trialEndsAt,
      }),
    ).toBe('ACTIVE');
  });

  it('past_due e canceled são retornados como estão, sem checar a data', () => {
    const trialEndsAt = new Date('2020-01-01T00:00:00Z');

    expect(
      calcularStatusPlano({
        statusAssinatura: StatusAssinatura.PAST_DUE,
        trialEndsAt,
      }),
    ).toBe('PAST_DUE');
    expect(
      calcularStatusPlano({
        statusAssinatura: StatusAssinatura.CANCELED,
        trialEndsAt,
      }),
    ).toBe('CANCELED');
  });
});

describe('statusPlanoBloqueiaAcesso (unit)', () => {
  it('EXPIRED e CANCELED bloqueiam', () => {
    expect(statusPlanoBloqueiaAcesso('EXPIRED')).toBe(true);
    expect(statusPlanoBloqueiaAcesso('CANCELED')).toBe(true);
  });

  it('TRIALING, ACTIVE e PAST_DUE não bloqueiam', () => {
    expect(statusPlanoBloqueiaAcesso('TRIALING')).toBe(false);
    expect(statusPlanoBloqueiaAcesso('ACTIVE')).toBe(false);
    expect(statusPlanoBloqueiaAcesso('PAST_DUE')).toBe(false);
  });
});

describe('calcularDiasRestantesTeste (unit)', () => {
  it('arredonda pra cima e nunca fica negativo', () => {
    const agora = new Date('2026-01-05T00:00:00Z');

    expect(
      calcularDiasRestantesTeste(new Date('2026-01-08T00:00:00Z'), agora),
    ).toBe(3);
    expect(
      calcularDiasRestantesTeste(new Date('2026-01-05T12:00:00Z'), agora),
    ).toBe(1);
    expect(
      calcularDiasRestantesTeste(new Date('2026-01-01T00:00:00Z'), agora),
    ).toBe(0);
  });
});
