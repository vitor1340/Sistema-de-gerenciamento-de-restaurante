'use client';

import { Pencil, Trash2 } from 'lucide-react';
import type { CategoriaDTO, ProdutoDTO } from '@comandai/shared-types';
import { apiFetch } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { formatCentavos } from '@/lib/format';

export function ProdutoList({
  produtos,
  categorias,
  onEditar,
  onProdutoAtualizado,
  onProdutoRemovido,
}: {
  produtos: ProdutoDTO[];
  categorias: CategoriaDTO[];
  onEditar: (produto: ProdutoDTO) => void;
  onProdutoAtualizado: (produto: ProdutoDTO) => void;
  onProdutoRemovido: (id: string) => void;
}) {
  const token = useAuthStore((state) => state.accessToken) ?? undefined;

  async function alternarDisponibilidade(produto: ProdutoDTO) {
    const atualizado = await apiFetch<ProdutoDTO>(`/produtos/${produto.id}`, token, {
      method: 'PATCH',
      body: JSON.stringify({ disponivel: !produto.disponivel }),
    });
    onProdutoAtualizado(atualizado);
  }

  async function remover(produto: ProdutoDTO) {
    if (!confirm(`Excluir "${produto.nome}"?`)) return;
    try {
      await apiFetch(`/produtos/${produto.id}`, token, { method: 'DELETE' });
      onProdutoRemovido(produto.id);
    } catch {
      alert(
        'Este produto já foi usado em pedidos e não pode ser excluído. Marque-o como indisponível.',
      );
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
    <div className="space-y-6">
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

                    <div className="mt-1 flex items-center gap-2">
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
                      <button onClick={() => onEditar(produto)} aria-label="Editar produto">
                        <Pencil size={13} className="text-ink-muted hover:text-brand" />
                      </button>
                      <button onClick={() => remover(produto)} aria-label="Excluir produto">
                        <Trash2 size={13} className="text-ink-muted hover:text-danger" />
                      </button>
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
