'use client';

import { useRouter } from 'next/navigation';
import { Search, Bell, LogOut } from 'lucide-react';
import { clearSessionCookie } from '@/lib/auth-cookie';
import { useAuthStore } from '@/store/auth-store';

export function Header({ lojaAberta }: { lojaAberta: boolean }) {
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);

  function handleLogout() {
    clearSessionCookie();
    clearSession();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="flex items-center justify-end gap-3 border-b border-border bg-surface px-6 py-3">
      <button
        aria-label="Buscar"
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-ink-secondary hover:bg-page"
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
      <div className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-ink-secondary">
        <span
          className={`h-1.5 w-1.5 rounded-full ${lojaAberta ? 'bg-success' : 'bg-ink-muted'}`}
        />
        {lojaAberta ? 'Loja aberta' : 'Loja fechada'}
      </div>
      <button
        aria-label="Sair"
        onClick={handleLogout}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-ink-secondary hover:bg-page"
      >
        <LogOut size={16} />
      </button>
    </header>
  );
}
