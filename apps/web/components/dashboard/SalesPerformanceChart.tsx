'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  type TooltipProps,
} from 'recharts';
import type { SalesPerformanceDTO } from '@comandai/shared-types';
import { formatCentavos, formatVariacao } from '@/lib/format';

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-md">
      <p className="mb-0.5 font-medium text-ink-primary">{label}</p>
      <p className="text-ink-secondary">{formatCentavos(payload[0].value as number)}</p>
    </div>
  );
}

export function SalesPerformanceChart({ data }: { data: SalesPerformanceDTO }) {
  const chartData = data.serie.map((item) => ({
    dia: item.diaSemana,
    valor: item.valorCentavos / 100,
  }));

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-sm font-semibold text-ink-primary">Desempenho de vendas</p>
          <p className="text-xs text-ink-secondary">Faturamento dos últimos 7 dias</p>
        </div>
        <div className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-secondary">
          7 dias
        </div>
      </div>

      <div className="mb-4 flex items-baseline gap-2">
        <p className="text-2xl font-bold text-ink-primary">
          {formatCentavos(data.totalPeriodoCentavos)}
        </p>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            data.variacaoPercentual >= 0
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-red-50 text-danger'
          }`}
        >
          {formatVariacao(data.variacaoPercentual)} no período
        </span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <XAxis
            dataKey="dia"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--color-ink-muted)', fontSize: 12 }}
          />
          <Tooltip cursor={{ fill: 'var(--color-page)' }} content={<ChartTooltip />} />
          <Bar dataKey="valor" fill="var(--color-brand)" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
