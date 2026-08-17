import { DollarSign, Monitor, TrendingUp, Clock } from 'lucide-react';
import type { DashboardSummaryDTO } from '@comandai/shared-types';
import { formatCentavos, formatVariacao } from '@/lib/format';
import { MetricCard } from './MetricCard';

export function MetricsGrid({ summary }: { summary: DashboardSummaryDTO }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        icon={DollarSign}
        iconBgClass="bg-brand-soft"
        iconColorClass="text-brand"
        label="Vendas hoje"
        value={formatCentavos(summary.vendasHoje.valorCentavos)}
        variacaoLabel={`${formatVariacao(summary.vendasHoje.variacaoPercentual)} vs ontem`}
        variacaoPositiva={summary.vendasHoje.variacaoPercentual >= 0}
      />
      <MetricCard
        icon={Monitor}
        iconBgClass="bg-blue-50"
        iconColorClass="text-blue-600"
        label="Pedidos"
        value={String(summary.pedidosHoje.quantidade)}
        variacaoLabel={`${formatVariacao(summary.pedidosHoje.variacaoAbsoluta, '')} hoje vs ontem`}
        variacaoPositiva={summary.pedidosHoje.variacaoAbsoluta >= 0}
      />
      <MetricCard
        icon={TrendingUp}
        iconBgClass="bg-emerald-50"
        iconColorClass="text-emerald-600"
        label="Ticket médio"
        value={formatCentavos(summary.ticketMedio.valorCentavos)}
        variacaoLabel={`${formatVariacao(summary.ticketMedio.variacaoPercentual)} vs ontem`}
        variacaoPositiva={summary.ticketMedio.variacaoPercentual >= 0}
      />
      <MetricCard
        icon={Clock}
        iconBgClass="bg-violet-50"
        iconColorClass="text-violet-600"
        label="Tempo médio"
        value={`${summary.tempoMedioPreparo.minutos} min`}
        variacaoLabel={`${formatVariacao(summary.tempoMedioPreparo.variacaoMinutos, ' min')} vs ontem`}
        variacaoPositiva={summary.tempoMedioPreparo.variacaoMinutos <= 0}
      />
    </div>
  );
}
