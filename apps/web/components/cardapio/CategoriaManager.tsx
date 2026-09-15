'use client';

import { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Pencil, Trash2, X } from 'lucide-react';
import type { CategoriaDTO } from '@comandai/shared-types';
import { apiFetch, ApiError } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { ExcluirCategoriaModal } from './ExcluirCategoriaModal';

export function CategoriaManager({
  categorias,
  onCategoriasChange,
}: {
  categorias: CategoriaDTO[];
  onCategoriasChange: (categorias: CategoriaDTO[]) => void;
}) {
  const token = useAuthStore((state) => state.accessToken) ?? undefined;
  const [novaCategoria, setNovaCategoria] = useState('');
  const [categoriaEmEdicao, setCategoriaEmEdicao] = useState<string | null>(null);
  const [nomeEdicao, setNomeEdicao] = useState('');
  const [categoriaParaExcluir, setCategoriaParaExcluir] = useState<{
    categoria: CategoriaDTO;
    produtosVinculados: number;
  } | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function criarCategoria(event: React.FormEvent) {
    event.preventDefault();
    if (!novaCategoria.trim()) return;
    setErro(null);
    try {
      const categoria = await apiFetch<CategoriaDTO>('/categorias', token, {
        method: 'POST',
        body: JSON.stringify({ nome: novaCategoria, ordem: categorias.length }),
      });
      onCategoriasChange([...categorias, { ...categoria, produtosCount: 0 }]);
      setNovaCategoria('');
    } catch {
      setErro('Não foi possível criar a categoria.');
    }
  }

  function iniciarEdicao(categoria: CategoriaDTO) {
    setCategoriaEmEdicao(categoria.id);
    setNomeEdicao(categoria.nome);
    setErro(null);
  }

  async function salvarEdicao(id: string) {
    if (!nomeEdicao.trim()) return;
    try {
      const categoria = await apiFetch<CategoriaDTO>(`/categorias/${id}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ nome: nomeEdicao }),
      });
      onCategoriasChange(
        categorias.map((c) => (c.id === id ? { ...c, ...categoria } : c)),
      );
      setCategoriaEmEdicao(null);
    } catch {
      setErro('Não foi possível renomear a categoria.');
    }
  }

  async function alternarAtiva(categoria: CategoriaDTO) {
    try {
      const atualizada = await apiFetch<CategoriaDTO>(`/categorias/${categoria.id}`, token, {
        method: 'PATCH',
        body: JSON.stringify({ ativa: !categoria.ativa }),
      });
      onCategoriasChange(
        categorias.map((c) => (c.id === categoria.id ? { ...c, ...atualizada } : c)),
      );
    } catch {
      setErro('Não foi possível atualizar a categoria.');
    }
  }

  async function mover(categoria: CategoriaDTO, direcao: 'CIMA' | 'BAIXO') {
    setErro(null);
    try {
      const atualizadas = await apiFetch<CategoriaDTO[]>(
        `/categorias/${categoria.id}/reordenar`,
        token,
        { method: 'PATCH', body: JSON.stringify({ direcao }) },
      );
      onCategoriasChange(
        atualizadas.map((c) => ({
          ...c,
          produtosCount: categorias.find((atual) => atual.id === c.id)?.produtosCount ?? 0,
        })),
      );
    } catch {
      setErro('Não foi possível reordenar as categorias.');
    }
  }

  function pedirExclusao(categoria: CategoriaDTO) {
    setErro(null);
    if (!categoria.produtosCount) {
      excluir(categoria.id);
      return;
    }
    setCategoriaParaExcluir({ categoria, produtosVinculados: categoria.produtosCount });
  }

  async function excluir(
    id: string,
    decisao?: { moverProdutosParaCategoriaId?: string; desvincularProdutos?: boolean },
  ) {
    try {
      await apiFetch(`/categorias/${id}`, token, {
        method: 'DELETE',
        body: decisao ? JSON.stringify(decisao) : undefined,
      });
      onCategoriasChange(categorias.filter((c) => c.id !== id));
      setCategoriaParaExcluir(null);
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        // condição de corrida (produto adicionado entre o clique e a chamada) — reabre o modal
        const categoria = categorias.find((c) => c.id === id);
        if (categoria) {
          setCategoriaParaExcluir({ categoria, produtosVinculados: categoria.produtosCount ?? 0 });
        }
      } else {
        setErro('Não foi possível excluir a categoria agora. Tente novamente em instantes.');
        setCategoriaParaExcluir(null);
      }
    }
  }

  const categoriasOrdenadas = [...categorias].sort((a, b) => a.ordem - b.ordem);

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="mb-3 text-sm font-semibold text-ink-primary">Categorias</p>

      <div className="space-y-2">
        {categoriasOrdenadas.map((categoria, index) => (
          <div
            key={categoria.id}
            className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-page px-3 py-2"
          >
            <div className="flex shrink-0 flex-col">
              <button
                onClick={() => mover(categoria, 'CIMA')}
                disabled={index === 0}
                aria-label="Mover categoria para cima"
                className="text-ink-muted hover:text-brand disabled:opacity-30"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={() => mover(categoria, 'BAIXO')}
                disabled={index === categoriasOrdenadas.length - 1}
                aria-label="Mover categoria para baixo"
                className="text-ink-muted hover:text-brand disabled:opacity-30"
              >
                <ChevronDown size={14} />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              {categoriaEmEdicao === categoria.id ? (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    value={nomeEdicao}
                    onChange={(e) => setNomeEdicao(e.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-2 py-1 text-sm text-ink-primary outline-none focus:border-brand"
                  />
                  <button onClick={() => salvarEdicao(categoria.id)} aria-label="Salvar categoria">
                    <Check size={16} className="text-success" />
                  </button>
                  <button onClick={() => setCategoriaEmEdicao(null)} aria-label="Cancelar edição">
                    <X size={16} className="text-ink-muted" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`truncate text-sm ${categoria.ativa ? 'text-ink-primary' : 'text-ink-muted line-through'}`}
                  >
                    {categoria.nome}
                  </span>
                  <span className="shrink-0 rounded-full bg-border/60 px-2 py-0.5 text-[10px] text-ink-muted">
                    {categoria.produtosCount ?? 0} produto(s)
                  </span>
                </div>
              )}
            </div>

            {categoriaEmEdicao !== categoria.id && (
              <div className="flex shrink-0 items-center gap-2.5">
                <button
                  onClick={() => alternarAtiva(categoria)}
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    categoria.ativa
                      ? 'bg-success/10 text-success'
                      : 'bg-ink-muted/10 text-ink-muted'
                  }`}
                >
                  {categoria.ativa ? 'Ativa' : 'Inativa'}
                </button>
                <button onClick={() => iniciarEdicao(categoria)} aria-label="Editar categoria">
                  <Pencil size={13} className="text-ink-muted hover:text-brand" />
                </button>
                <button onClick={() => pedirExclusao(categoria)} aria-label="Excluir categoria">
                  <Trash2 size={13} className="text-ink-muted hover:text-danger" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={criarCategoria} className="mt-3 flex items-center gap-2">
        <input
          value={novaCategoria}
          onChange={(e) => setNovaCategoria(e.target.value)}
          placeholder="Nova categoria"
          className="min-w-0 flex-1 rounded-lg border border-border px-3 py-1.5 text-xs text-ink-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <button
          type="submit"
          className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-secondary hover:bg-page"
        >
          Adicionar
        </button>
      </form>

      {erro && <p className="mt-2 text-xs text-danger">{erro}</p>}

      {categoriaParaExcluir && (
        <ExcluirCategoriaModal
          categoria={categoriaParaExcluir.categoria}
          produtosVinculados={categoriaParaExcluir.produtosVinculados}
          outrasCategorias={categorias.filter((c) => c.id !== categoriaParaExcluir.categoria.id)}
          onCancelar={() => setCategoriaParaExcluir(null)}
          onConfirmarMover={(categoriaId) =>
            excluir(categoriaParaExcluir.categoria.id, {
              moverProdutosParaCategoriaId: categoriaId,
            })
          }
          onConfirmarDesvincular={() =>
            excluir(categoriaParaExcluir.categoria.id, { desvincularProdutos: true })
          }
        />
      )}
    </div>
  );
}
