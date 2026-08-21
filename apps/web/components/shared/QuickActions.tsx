import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

type QuickActionBase = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
};

export type QuickAction =
  | (QuickActionBase & { href: string; target?: string; onClick?: never })
  | (QuickActionBase & { onClick: () => void; href?: never; target?: never });

export function QuickActions({
  actions,
  title = 'Ações rápidas',
  subtitle = 'Atalhos da operação',
}: {
  actions: QuickAction[];
  title?: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4">
        <p className="text-sm font-semibold text-ink-primary">{title}</p>
        <p className="text-xs text-ink-secondary">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) =>
          action.href ? (
            <Link
              key={action.title}
              href={action.href}
              target={action.target}
              className="flex items-start gap-2 rounded-xl border border-border p-3 text-left transition hover:border-brand/40 hover:bg-brand-soft"
            >
              <action.icon size={16} className="mt-0.5 shrink-0 text-brand" />
              <span>
                <span className="block text-xs font-semibold text-ink-primary">
                  {action.title}
                </span>
                <span className="block text-[11px] text-ink-secondary">{action.subtitle}</span>
              </span>
            </Link>
          ) : (
            <button
              key={action.title}
              type="button"
              onClick={action.onClick}
              className="flex items-start gap-2 rounded-xl border border-border p-3 text-left transition hover:border-brand/40 hover:bg-brand-soft"
            >
              <action.icon size={16} className="mt-0.5 shrink-0 text-brand" />
              <span>
                <span className="block text-xs font-semibold text-ink-primary">
                  {action.title}
                </span>
                <span className="block text-[11px] text-ink-secondary">{action.subtitle}</span>
              </span>
            </button>
          ),
        )}
      </div>
    </div>
  );
}
