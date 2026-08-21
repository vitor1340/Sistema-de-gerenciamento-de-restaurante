import { apiFetch } from '@/lib/api-client';
import { getSessionToken } from '@/lib/session.server';
import type {
  DashboardSummaryDTO,
  SalesPerformanceDTO,
  SalesChannelsDTO,
  PedidoResumoDTO,
} from '@comandai/shared-types';
import { NewOrderBanner } from '@/components/dashboard/NewOrderBanner';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { SalesPerformanceChart } from '@/components/dashboard/SalesPerformanceChart';
import { SalesChannelsDonut } from '@/components/dashboard/SalesChannelsDonut';
import { RecentOrdersList } from '@/components/dashboard/RecentOrdersList';

export default async function DashboardPage() {
  const token = await getSessionToken();

  const [summary, salesPerformance, salesChannels, pedidosRecentes] = await Promise.all([
    apiFetch<DashboardSummaryDTO>('/dashboard/summary', token),
    apiFetch<SalesPerformanceDTO>('/dashboard/sales-performance?dias=7', token),
    apiFetch<SalesChannelsDTO>('/dashboard/sales-channels', token),
    apiFetch<PedidoResumoDTO[]>('/pedidos?recent=true&limit=5', token),
  ]);

  return (
    <div>
      <p className="text-xs font-semibold tracking-wide text-ink-muted">
        {summary.dataFormatada}
      </p>
      <h1 className="mb-6 text-2xl font-bold text-ink-primary">{summary.saudacao}</h1>

      {summary.ultimoPedidoNovo && <NewOrderBanner pedido={summary.ultimoPedidoNovo} />}

      <div className="mb-6">
        <MetricsGrid summary={summary} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SalesPerformanceChart data={salesPerformance} />
        </div>
        <SalesChannelsDonut data={salesChannels} />
      </div>

      <RecentOrdersList pedidos={pedidosRecentes} />
    </div>
  );
}
