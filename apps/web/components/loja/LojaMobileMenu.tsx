'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { ClipboardList, MapPin, Package, X } from 'lucide-react';
import { Z_INDEX_LOJA } from '@/lib/loja-layout';

interface LojaMobileMenuProps {
  slug: string;
  temProdutos: boolean;
  temLocalizacao: boolean;
  onClose: () => void;
}

const CLASSES_ITEM =
  'lp-display flex w-full max-w-xs items-center justify-center gap-3 rounded-[3px] border-2 border-[var(--lp-paper-dim)]/40 py-4 text-xl text-[var(--lp-paper)] transition hover:border-[var(--lp-accent)] hover:bg-[var(--lp-accent)]/10 hover:text-[var(--lp-accent)]';

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
      style={{ zIndex: Z_INDEX_LOJA.menuMobile }}
      className="lp-mobile-menu fixed inset-0 flex flex-col bg-[var(--lp-char)] pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] text-[var(--lp-paper)] md:hidden"
    >
      <div
        style={{ height: 'var(--lp-header-h, 70px)' }}
        className="flex shrink-0 items-center justify-between border-b-2 border-dashed border-[var(--lp-paper-dim)]/20 px-6"
      >
        <span className="lp-mono text-xs uppercase tracking-widest text-[var(--lp-paper-dim)]">
          Menu
        </span>
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
          <a href="#produtos" onClick={onClose} className={CLASSES_ITEM}>
            <Package size={20} />
            Produtos
          </a>
        )}
        {temLocalizacao && (
          <a href="#localizacao" onClick={onClose} className={CLASSES_ITEM}>
            <MapPin size={20} />
            Localização
          </a>
        )}
        <Link href={`/loja/${slug}/pedido`} onClick={onClose} className={CLASSES_ITEM}>
          <ClipboardList size={20} />
          Acompanhar pedido
        </Link>
      </nav>
    </div>
  );
}
