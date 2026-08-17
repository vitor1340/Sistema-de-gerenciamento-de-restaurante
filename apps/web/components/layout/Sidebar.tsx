'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from './nav-items';
import { RestaurantSwitcher } from './RestaurantSwitcher';
import { HelpCard } from './HelpCard';

export function Sidebar({
  restauranteNome,
  restaurantePlano,
  pedidosNovosCount,
}: {
  restauranteNome: string;
  restaurantePlano: string;
  pedidosNovosCount: number;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-border bg-surface p-4">
      <div className="mb-6 flex items-center gap-2 px-1">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-base font-bold text-white">
          C
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-ink-primary">Comandaí</p>
          <p className="text-[10px] tracking-wide text-ink-muted">PARCEIROS</p>
        </div>
      </div>

      <RestaurantSwitcher nome={restauranteNome} plano={restaurantePlano} />

      <nav className="mt-6 flex-1 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const badge = item.badgeKey === 'pedidosNovos' ? pedidosNovosCount : undefined;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? 'bg-brand-soft text-brand'
                  : 'text-ink-secondary hover:bg-page hover:text-ink-primary'
              }`}
            >
              <item.icon size={18} />
              <span className="flex-1">{item.label}</span>
              {!!badge && (
                <span className="rounded-full bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <HelpCard />
    </aside>
  );
}
