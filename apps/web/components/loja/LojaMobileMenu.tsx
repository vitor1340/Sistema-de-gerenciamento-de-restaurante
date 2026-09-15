'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

interface LojaMobileMenuProps {
  slug: string;
  temProdutos: boolean;
  temLocalizacao: boolean;
  onClose: () => void;
}

export function LojaMobileMenu({
  slug,
  temProdutos,
  temLocalizacao,
  onClose,
}: LojaMobileMenuProps) {
  useEffect(() => {
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function aoTeclar(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', aoTeclar);

    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener('keydown', aoTeclar);
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu de navegação"
      onClick={onClose}
      className="lp-mobile-menu fixed inset-0 z-40 flex flex-col bg-[var(--lp-char)] pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] text-[var(--lp-paper)] md:hidden"
    >
      <div className="flex h-[70px] shrink-0 items-center justify-end px-4">
        <button
          onClick={onClose}
          aria-label="Fechar menu"
          className="flex h-11 w-11 items-center justify-center text-[var(--lp-paper)] transition hover:text-[var(--lp-accent)]"
        >
          <X size={26} />
        </button>
      </div>

      <nav className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        {temProdutos && (
          <a
            href="#produtos"
            onClick={onClose}
            className="lp-display w-full max-w-xs rounded-[3px] border-2 border-[var(--lp-paper-dim)] py-4 text-xl text-[var(--lp-paper)] transition hover:border-[var(--lp-accent)] hover:text-[var(--lp-accent)]"
          >
            Produtos
          </a>
        )}
        {temLocalizacao && (
          <a
            href="#localizacao"
            onClick={onClose}
            className="lp-display w-full max-w-xs rounded-[3px] border-2 border-[var(--lp-paper-dim)] py-4 text-xl text-[var(--lp-paper)] transition hover:border-[var(--lp-accent)] hover:text-[var(--lp-accent)]"
          >
            Localização
          </a>
        )}
        <Link
          href={`/loja/${slug}/pedido`}
          onClick={onClose}
          className="lp-display w-full max-w-xs rounded-[3px] border-2 border-[var(--lp-paper-dim)] py-4 text-xl text-[var(--lp-paper)] transition hover:border-[var(--lp-accent)] hover:text-[var(--lp-accent)]"
        >
          Acompanhar pedido
        </Link>
      </nav>
    </div>
  );
}
