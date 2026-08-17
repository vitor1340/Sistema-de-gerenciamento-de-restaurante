import { Plus, Share2, Store, Download } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const ACTIONS: { icon: LucideIcon; title: string; subtitle: string }[] = [
  { icon: Plus, title: 'Novo produto', subtitle: 'Adicionar ao cardápio' },
  { icon: Share2, title: 'Compartilhar cardápio', subtitle: 'Copiar link da loja' },
  { icon: Store, title: 'Visualizar loja', subtitle: 'Como seus clientes veem' },
  { icon: Download, title: 'Exportar relatório', subtitle: 'Vendas e financeiro' },
];

export function QuickActions() {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <div className="mb-4">
        <p className="text-sm font-semibold text-ink-primary">Ações rápidas</p>
        <p className="text-xs text-ink-secondary">Atalhos da operação</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action) => (
          <button
            key={action.title}
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
        ))}
      </div>
    </div>
  );
}
