'use client';

import { X } from 'lucide-react';
import type { LojaDTO, LojaProdutoDTO } from '@comandai/shared-types';
import { formatCentavos } from '@/lib/format';

function montarMensagemWhatsApp(
  loja: LojaDTO,
  itens: { produto: LojaProdutoDTO; quantidade: number }[],
  totalCentavos: number,
): string {
  const linhas = itens.map(
    ({ produto, quantidade }) =>
      `${quantidade}x ${produto.nome} - ${formatCentavos(produto.precoCentavos * quantidade)}`,
  );

  return [
    `Olá! Gostaria de fazer um pedido no *${loja.nome}*:`,
    '',
    ...linhas,
    '',
    `*Total: ${formatCentavos(totalCentavos)}*`,
  ].join('\n');
}

export function CarrinhoDrawer({
  loja,
  carrinho,
  produtosPorId,
  subtotalCentavos,
  onAlterarQuantidade,
  onClose,
}: {
  loja: LojaDTO;
  carrinho: Record<string, number>;
  produtosPorId: Map<string, LojaProdutoDTO>;
  subtotalCentavos: number;
  onAlterarQuantidade: (produtoId: string, delta: number) => void;
  onClose: () => void;
}) {
  const itens = Object.entries(carrinho)
    .map(([produtoId, quantidade]) => ({
      produto: produtosPorId.get(produtoId),
      quantidade,
    }))
    .filter(
      (item): item is { produto: LojaProdutoDTO; quantidade: number } =>
        item.produto !== undefined && item.quantidade > 0,
    );

  const linkWhatsApp = loja.whatsapp
    ? `https://wa.me/${loja.whatsapp}?text=${encodeURIComponent(
        montarMensagemWhatsApp(loja, itens, subtotalCentavos),
      )}`
    : null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-surface p-5 shadow-lg sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-primary">Seu pedido</h2>
          <button onClick={onClose} aria-label="Fechar carrinho">
            <X size={18} className="text-ink-muted hover:text-ink-primary" />
          </button>
        </div>

        <div className="space-y-3">
          {itens.map(({ produto, quantidade }) => (
            <div key={produto.id} className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-primary">{produto.nome}</p>
                <p className="text-xs text-ink-secondary">
                  {formatCentavos(produto.precoCentavos)} cada
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border px-1 py-1">
                <button
                  onClick={() => onAlterarQuantidade(produto.id, -1)}
                  aria-label={`Remover uma unidade de ${produto.nome}`}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-ink-secondary hover:bg-page"
                >
                  −
                </button>
                <span className="w-4 text-center text-xs font-semibold text-ink-primary">
                  {quantidade}
                </span>
                <button
                  onClick={() => onAlterarQuantidade(produto.id, 1)}
                  aria-label={`Adicionar mais uma unidade de ${produto.nome}`}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-ink-secondary hover:bg-page"
                >
                  +
                </button>
              </div>
              <span className="w-20 shrink-0 text-right text-sm font-semibold text-ink-primary">
                {formatCentavos(produto.precoCentavos * quantidade)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm font-medium text-ink-secondary">Total</span>
          <span className="text-lg font-bold text-ink-primary">
            {formatCentavos(subtotalCentavos)}
          </span>
        </div>

        {linkWhatsApp ? (
          <a
            href={linkWhatsApp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block w-full rounded-lg bg-success py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
          >
            Finalizar pedido no WhatsApp
          </a>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-border p-3 text-center text-xs text-ink-secondary">
            Essa loja ainda não configurou um WhatsApp para receber pedidos.
          </p>
        )}
      </div>
    </div>
  );
}
