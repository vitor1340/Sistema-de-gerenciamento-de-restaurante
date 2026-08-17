'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import type { SalesChannelsDTO } from '@comandai/shared-types';
import { CANAL_COLOR, CANAL_LABEL } from '@/lib/labels';

export function SalesChannelsDonut({ data }: { data: SalesChannelsDTO }) {
  const chartData = data.canais.map((item) => ({
    canal: item.canal,
    quantidade: item.quantidade,
    percentual: item.percentual,
  }));

  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4">
        <p className="text-sm font-semibold text-ink-primary">Canais de venda</p>
        <p className="text-xs text-ink-secondary">{data.totalPedidos} pedidos hoje</p>
      </div>

      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="quantidade"
              nameKey="canal"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={2}
              stroke="var(--color-surface)"
              strokeWidth={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.canal} fill={CANAL_COLOR[entry.canal]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-ink-primary">{data.totalPedidos}</p>
          <p className="text-xs text-ink-secondary">pedidos</p>
        </div>
      </div>

      <ul className="mt-2 space-y-2">
        {chartData.map((item) => (
          <li key={item.canal} className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-ink-secondary">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: CANAL_COLOR[item.canal] }}
              />
              {CANAL_LABEL[item.canal]}
            </span>
            <span className="font-semibold text-ink-primary">{item.percentual}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
