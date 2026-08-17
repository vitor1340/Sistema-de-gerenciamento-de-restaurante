import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  iconBgClass: string;
  iconColorClass: string;
  label: string;
  value: string;
  variacaoLabel: string;
  variacaoPositiva: boolean;
}

export function MetricCard({
  icon: Icon,
  iconBgClass,
  iconColorClass,
  label,
  value,
  variacaoLabel,
  variacaoPositiva,
}: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBgClass}`}>
          <Icon size={18} className={iconColorClass} />
        </div>
        <button className="text-ink-muted" aria-label="Mais opções">
          ⋯
        </button>
      </div>
      <p className="mb-1 text-xs text-ink-secondary">{label}</p>
      <p className="mb-1 text-2xl font-bold text-ink-primary">{value}</p>
      <p className={`text-xs font-medium ${variacaoPositiva ? 'text-success' : 'text-danger'}`}>
        {variacaoLabel}
      </p>
    </div>
  );
}
