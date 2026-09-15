import Link from 'next/link';
import { AlertTriangle, Clock } from 'lucide-react';
import type { StatusPlano } from '@comandai/shared-types';

// Cobre todos os status de plano num único banner no topo do painel —
// diferente do antigo TrialBanner (só TRIALING), aqui o usuário SEMPRE
// consegue entrar no painel (ver métricas, pedidos, cardápio), mesmo sem
// plano ativo; quem barra de verdade as ações de escrita é o PlanoAtivoGuard
// no backend. Este banner só deixa claro o motivo e o que fazer.
export function PlanoStatusBanner({
  statusPlano,
  diasRestantesTeste,
}: {
  statusPlano: StatusPlano;
  diasRestantesTeste: number;
}) {
  if (statusPlano === 'TRIALING') {
    const texto = diasRestantesTeste === 1 ? 'Falta 1 dia' : `Faltam ${diasRestantesTeste} dias`;
    return (
      <div className="px-4 pt-3 md:px-6">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-brand/20 bg-brand-soft px-4 py-2.5 text-sm text-ink-primary">
          <Clock size={15} className="shrink-0 text-brand" />
          <span>{texto} no seu teste grátis.</span>
          <Link href="/planos" className="ml-auto font-semibold text-brand hover:underline">
            Ver planos
          </Link>
        </div>
      </div>
    );
  }

  if (statusPlano === 'EXPIRED' || statusPlano === 'CANCELED') {
    const texto =
      statusPlano === 'EXPIRED'
        ? 'Seu teste grátis acabou.'
        : 'Sua assinatura foi cancelada.';
    const motivo = statusPlano === 'EXPIRED' ? 'teste-expirado' : 'assinatura-cancelada';
    return (
      <div className="px-4 pt-3 md:px-6">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-danger/25 bg-danger/5 px-4 py-2.5 text-sm text-danger">
          <AlertTriangle size={15} className="shrink-0" />
          <span>
            {texto} Você pode navegar no painel, mas ações como salvar ou criar algo novo ficam
            bloqueadas até assinar um plano.
          </span>
          <Link
            href={`/planos?motivo=${motivo}`}
            className="ml-auto shrink-0 font-semibold underline underline-offset-2"
          >
            Assinar agora
          </Link>
        </div>
      </div>
    );
  }

  if (statusPlano === 'PAST_DUE') {
    return (
      <div className="px-4 pt-3 md:px-6">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-danger/25 bg-danger/5 px-4 py-2.5 text-sm text-danger">
          <AlertTriangle size={15} className="shrink-0" />
          <span>Não conseguimos confirmar seu último pagamento da assinatura Comandaí.</span>
          <Link
            href="/configuracoes"
            className="ml-auto shrink-0 font-semibold underline underline-offset-2"
          >
            Verificar assinatura
          </Link>
        </div>
      </div>
    );
  }

  return null;
}
