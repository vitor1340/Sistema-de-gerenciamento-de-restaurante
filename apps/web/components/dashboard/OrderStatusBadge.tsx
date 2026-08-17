import type { StatusPedido } from '@comandai/shared-types';
import { STATUS_COLOR, STATUS_LABEL } from '@/lib/labels';

export function OrderStatusBadge({ status }: { status: StatusPedido }) {
  const color = STATUS_COLOR[status];

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, white)`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {STATUS_LABEL[status]}
    </span>
  );
}
