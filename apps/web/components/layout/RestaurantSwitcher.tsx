import { ChevronDown } from 'lucide-react';

export function RestaurantSwitcher({ nome, plano }: { nome: string; plano: string }) {
  return (
    <button className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface p-3 text-left hover:bg-page">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#11131a] text-sm font-bold text-white">
        {nome.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-ink-primary">{nome}</p>
        <p className="truncate text-xs text-brand">Plano {plano === 'PRO' ? 'Pro' : 'Free'}</p>
      </div>
      <ChevronDown size={16} className="shrink-0 text-ink-muted" />
    </button>
  );
}
