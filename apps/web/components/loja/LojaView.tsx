'use client';

import { useMemo, useState } from 'react';
import { Plus, ShoppingBag, UtensilsCrossed } from 'lucide-react';
import type { LojaDTO, LojaProdutoDTO } from '@comandai/shared-types';
import { formatCentavos } from '@/lib/format';
import { CarrinhoDrawer } from './CarrinhoDrawer';

export function LojaView({ loja }: { loja: LojaDTO }) {
  const [carrinho, setCarrinho] = useState<Record<string, number>>({});
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  const produtosPorId = useMemo(() => {
    const mapa = new Map<string, LojaProdutoDTO>();
    for (const categoria of loja.categorias) {
      for (const produto of categoria.produtos) {
        mapa.set(produto.id, produto);
      }
    }
    return mapa;
  }, [loja.categorias]);

  const { quantidadeTotal, subtotalCentavos } = useMemo(() => {
    let quantidade = 0;
    let subtotal = 0;
    for (const [produtoId, qtd] of Object.entries(carrinho)) {
      const produto = produtosPorId.get(produtoId);
      if (!produto || qtd <= 0) continue;
      quantidade += qtd;
      subtotal += produto.precoCentavos * qtd;
    }
    return { quantidadeTotal: quantidade, subtotalCentavos: subtotal };
  }, [carrinho, produtosPorId]);

  function adicionarAoCarrinho(produtoId: string) {
    setCarrinho((atual) => ({ ...atual, [produtoId]: (atual[produtoId] ?? 0) + 1 }));
  }

  function alterarQuantidade(produtoId: string, delta: number) {
    setCarrinho((atual) => {
      const proxima = Math.max(0, (atual[produtoId] ?? 0) + delta);
      const copia = { ...atual };
      if (proxima === 0) {
        delete copia[produtoId];
      } else {
        copia[produtoId] = proxima;
      }
      return copia;
    });
  }

  const semProdutos = loja.categorias.length === 0;

  return (
    <div className="min-h-screen bg-page pb-24">
      <header className="bg-gradient-to-br from-brand to-[#c9491f] px-4 pb-8 pt-10 text-white">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-xl font-bold backdrop-blur-sm">
              {loja.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">{loja.nome}</h1>
              <div className="mt-0.5 flex items-center gap-1.5 text-sm text-white/90">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${loja.aberto ? 'bg-success' : 'bg-white/60'}`}
                />
                {loja.aberto ? 'Aberto agora' : 'Fechado no momento'}
              </div>
            </div>
          </div>
        </div>
      </header>

      {loja.categorias.length > 0 && (
        <nav className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-3xl gap-2 overflow-x-auto px-4 py-3">
            {loja.categorias.map((categoria) => (
              <a
                key={categoria.id}
                href={`#categoria-${categoria.id}`}
                className="shrink-0 rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-ink-secondary transition hover:border-brand hover:text-brand"
              >
                {categoria.nome}
              </a>
            ))}
          </div>
        </nav>
      )}

      <main className="mx-auto max-w-3xl px-4 py-6">
        {semProdutos ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
            <UtensilsCrossed className="mb-3 text-ink-muted" size={28} />
            <p className="font-semibold text-ink-primary">Cardápio em preparação</p>
            <p className="mt-1 text-sm text-ink-secondary">
              Essa loja ainda não cadastrou produtos disponíveis.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {loja.categorias.map((categoria) => (
              <section key={categoria.id} id={`categoria-${categoria.id}`} className="scroll-mt-20">
                <h2 className="mb-3 text-lg font-bold text-ink-primary">{categoria.nome}</h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {categoria.produtos.map((produto) => (
                    <div
                      key={produto.id}
                      className="flex gap-3 rounded-2xl border border-border bg-surface p-3 transition hover:shadow-md"
                    >
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-page">
                        {produto.imagemUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={produto.imagemUrl}
                            alt={produto.nome}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <UtensilsCrossed className="text-ink-muted" size={22} />
                          </div>
                        )}
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col">
                        <p className="text-sm font-semibold text-ink-primary">{produto.nome}</p>
                        {produto.descricao && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-ink-secondary">
                            {produto.descricao}
                          </p>
                        )}
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <span className="text-sm font-bold text-brand">
                            {formatCentavos(produto.precoCentavos)}
                          </span>

                          {carrinho[produto.id] ? (
                            <div className="flex items-center gap-2 rounded-full border border-brand/30 bg-brand-soft px-1 py-1">
                              <button
                                onClick={() => alterarQuantidade(produto.id, -1)}
                                aria-label="Remover uma unidade"
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-brand shadow-sm"
                              >
                                −
                              </button>
                              <span className="w-4 text-center text-xs font-semibold text-brand">
                                {carrinho[produto.id]}
                              </span>
                              <button
                                onClick={() => alterarQuantidade(produto.id, 1)}
                                aria-label="Adicionar mais uma unidade"
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-brand shadow-sm"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => adicionarAoCarrinho(produto.id)}
                              aria-label={`Adicionar ${produto.nome}`}
                              className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white shadow-sm transition hover:opacity-90"
                            >
                              <Plus size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {quantidadeTotal > 0 && (
        <button
          onClick={() => setCarrinhoAberto(true)}
          className="fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-3xl items-center justify-between rounded-2xl bg-brand px-5 py-4 text-white shadow-lg transition hover:opacity-95"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <ShoppingBag size={18} />
            {quantidadeTotal} {quantidadeTotal === 1 ? 'item' : 'itens'}
          </span>
          <span className="text-sm font-bold">
            Ver carrinho · {formatCentavos(subtotalCentavos)}
          </span>
        </button>
      )}

      {carrinhoAberto && (
        <CarrinhoDrawer
          loja={loja}
          carrinho={carrinho}
          produtosPorId={produtosPorId}
          subtotalCentavos={subtotalCentavos}
          onAlterarQuantidade={alterarQuantidade}
          onClose={() => setCarrinhoAberto(false)}
        />
      )}
    </div>
  );
}
