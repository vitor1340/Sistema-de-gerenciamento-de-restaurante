'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import type { CategoriaDTO, ProdutoDTO } from '@comandai/shared-types';
import { apiFetch, ApiError } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { formatCentavos } from '@/lib/format';

export function ProdutoList({
  produtos,
  categorias,
  onEditar,
  onProdutoAtualizado,
  onProdutoRemovido,
  modoSelecao = false,
  onSairModoSelecao,
}: {
  produtos: ProdutoDTO[];
  categorias: CategoriaDTO[];
  onEditar: (produto: ProdutoDTO) => void;
  onProdutoAtualizado: (produto: ProdutoDTO) => void;
  onProdutoRemovido: (id: string) => void;
  modoSelecao?: boolean;
  onSairModoSelecao?: () => void;
}) {
  const token = useAuthStore((state) => state.accessToken) ?? undefined;
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [aplicandoEmMassa, setAplicandoEmMassa] = useState(false);
  const [removendoId, setRemovendoId] = useState<string | null>(null);

  function alternarSelecao(id: string) {
    setSelecionados((atual) => {
      const copia = new Set(atual);
      if (copia.has(id)) {
        copia.delete(id);
      } else {
        copia.add(id);
      }
      return copia;
    });
  }

  async function alternarDisponibilidade(produto: ProdutoDTO) {
    const atualizado = await apiFetch<ProdutoDTO>(`/produtos/${produto.id}`, token, {
      method: 'PATCH',
      body: JSON.stringify({ disponivel: !produto.disponivel }),
    });
    onProdutoAtualizado(atualizado);
  }

  async function aplicarDisponibilidadeEmMassa(disponivel: boolean) {
    setAplicandoEmMassa(true);
    try {
      const atualizados = await Promise.all(
        [...selecionados].map((id) =>
          apiFetch<ProdutoDTO>(`/produtos/${id}`, token, {
            method: 'PATCH',
            body: JSON.stringify({ disponivel }),
          }),
        ),
      );
      atualizados.forEach(onProdutoAtualizado);
      setSelecionados(new Set());
    } finally {
      setAplicandoEmMassa(false);
    }
  }

  async function remover(produto: ProdutoDTO) {
    if (removendoId) return;
    if (!confirm(`Excluir "${produto.nome}"?`)) return;
    setRemovendoId(produto.id);
    try {
      await apiFetch(`/produtos/${produto.id}`, token, { method: 'DELETE' });
      onProdutoRemovido(produto.id);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        alert(
          'Este produto já foi usado em pedidos e não pode ser excluído. Marque-o como indisponível.',
        );
      } else {
        alert('Não foi possível excluir o produto agora. Tente novamente em instantes.');
      }
    } finally {
      setRemovendoId(null);
    }
  }

  if (categorias.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-ink-secondary">
        Crie uma categoria acima para começar a cadastrar produtos.
      </div>
    );
  }

  return (
    <div id="produtos" className="scroll-mt-4 space-y-6">
      {modoSelecao && (
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/30 bg-brand-soft px-4 py-3">
          <p className="text-xs font-medium text-ink-primary">
            {selecionados.size === 0
              ? 'Selecione os produtos que quer ativar ou desativar'
              : `${selecionados.size} produto(s) selecionado(s)`}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={selecionados.size === 0 || aplicandoEmMassa}
              onClick={() => aplicarDisponibilidadeEmMassa(true)}
              className="rounded-lg bg-success px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              Ativar selecionados
            </button>
            <button
              type="button"
              disabled={selecionados.size === 0 || aplicandoEmMassa}
              onClick={() => aplicarDisponibilidadeEmMassa(false)}
              className="rounded-lg bg-ink-muted px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              Desativar selecionados
            </button>
            <button
              type="button"
              onClick={onSairModoSelecao}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-secondary hover:bg-page"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {categorias.map((categoria) => {
        const produtosDaCategoria = produtos.filter((p) => p.categoriaId === categoria.id);
        if (produtosDaCategoria.length === 0) return null;

        return (
          <div key={categoria.id}>
            <p className="mb-2 text-sm font-semibold text-ink-primary">{categoria.nome}</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {produtosDaCategoria.map((produto) => (
                <div
                  key={produto.id}
                  className="flex gap-3 rounded-2xl border border-border bg-surface p-3"
                >
                  {modoSelecao && (
                    <input
                      type="checkbox"
                      checked={selecionados.has(produto.id)}
                      onChange={() => alternarSelecao(produto.id)}
                      className="mt-1 h-4 w-4 shrink-0 rounded border-border text-brand focus:ring-brand/20"
                    />
                  )}

                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-page">
                    {produto.imagemUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={produto.imagemUrl}
                        alt={produto.nome}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-center text-[10px] text-ink-muted">
                        Sem foto
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-primary">
                      {produto.nome}
                    </p>
                    <p className="text-sm font-semibold text-brand">
                      {formatCentavos(produto.precoCentavos)}
                    </p>

                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {produto.destaque && (
                        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-medium text-brand">
                          Destaque
                        </span>
                      )}
                      <button
                        onClick={() => alternarDisponibilidade(produto)}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          produto.disponivel
                            ? 'bg-success/10 text-success'
                            : 'bg-ink-muted/10 text-ink-muted'
                        }`}
                      >
                        {produto.disponivel ? 'Disponível' : 'Indisponível'}
                      </button>
                      {!modoSelecao && (
                        <>
                          <button onClick={() => onEditar(produto)} aria-label="Editar produto">
                            <Pencil size={13} className="text-ink-muted hover:text-brand" />
                          </button>
                          <button
                            onClick={() => remover(produto)}
                            disabled={removendoId === produto.id}
                            aria-label="Excluir produto"
                          >
                            <Trash2
                              size={13}
                              className={
                                removendoId === produto.id
                                  ? 'text-ink-muted/40'
                                  : 'text-ink-muted hover:text-danger'
                              }
                            />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
