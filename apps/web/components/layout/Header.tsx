'use client';

import { useRouter } from 'next/navigation';
import { Menu, Search, Bell, LogOut } from 'lucide-react';
import { clearSessionCookie } from '@/lib/auth-cookie';
import { useAuthStore } from '@/store/auth-store';
import { useUiStore } from '@/store/ui-store';

export function Header({ lojaAberta }: { lojaAberta: boolean }) {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const abrirMenuMobile = useUiStore((state) => state.abrirMenuMobile);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
    clearSessionCookie();
    clearSession();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between gap-3 border-b border-border bg-surface px-4 py-3 md:justify-end md:px-6">
      <button
        aria-label="Abrir menu"
        onClick={abrirMenuMobile}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-ink-secondary hover:bg-page md:hidden"
      >
        <Menu size={16} />
      </button>
      <div className="flex items-center gap-2 md:gap-3">
        <button
          aria-label="Buscar"
          className="hidden h-9 w-9 items-center justify-center rounded-lg border border-border text-ink-secondary hover:bg-page sm:flex"
        >
          <Search size={16} />
        </button>
        <button
          aria-label="Notificações"
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border text-ink-secondary hover:bg-page"
        >
          <Bell size={16} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-danger" />
        </button>
        <div className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1.5 text-xs font-medium text-ink-secondary md:px-3">
          <span
            className={`h-1.5 w-1.5 rounded-full ${lojaAberta ? 'bg-success' : 'bg-ink-muted'}`}
          />
          <span className="hidden sm:inline">
            {lojaAberta ? 'Loja aberta' : 'Loja fechada'}
          </span>
        </div>
        <button
          aria-label="Sair"
          onClick={handleLogout}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-ink-secondary hover:bg-page"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  );
}
