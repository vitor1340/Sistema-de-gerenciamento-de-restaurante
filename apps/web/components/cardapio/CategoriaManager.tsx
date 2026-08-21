'use client';

import { useState } from 'react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import type { CategoriaDTO } from '@comandai/shared-types';
import { apiFetch, ApiError } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

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
      onCategoriasChange([...categorias, categoria]);
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
      onCategoriasChange(categorias.map((c) => (c.id === id ? categoria : c)));
      setCategoriaEmEdicao(null);
    } catch {
      setErro('Não foi possível renomear a categoria.');
    }
  }

  async function remover(id: string) {
    setErro(null);
    try {
      await apiFetch(`/categorias/${id}`, token, { method: 'DELETE' });
      onCategoriasChange(categorias.filter((c) => c.id !== id));
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setErro('Categorias com produtos vinculados não podem ser excluídas.');
      } else {
        setErro('Não foi possível excluir a categoria agora. Tente novamente em instantes.');
      }
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="mb-3 text-sm font-semibold text-ink-primary">Categorias</p>

      <div className="flex flex-wrap gap-2">
        {categorias.map((categoria) => (
          <div
            key={categoria.id}
            className="flex items-center gap-1 rounded-full border border-border bg-page px-3 py-1.5 text-xs"
          >
            {categoriaEmEdicao === categoria.id ? (
              <>
                <input
                  autoFocus
                  value={nomeEdicao}
                  onChange={(e) => setNomeEdicao(e.target.value)}
                  className="w-28 bg-transparent text-ink-primary outline-none"
                />
                <button onClick={() => salvarEdicao(categoria.id)} aria-label="Salvar categoria">
                  <Check size={14} className="text-success" />
                </button>
                <button onClick={() => setCategoriaEmEdicao(null)} aria-label="Cancelar edição">
                  <X size={14} className="text-ink-muted" />
                </button>
              </>
            ) : (
              <>
                <span className="text-ink-primary">{categoria.nome}</span>
                <button onClick={() => iniciarEdicao(categoria)} aria-label="Editar categoria">
                  <Pencil size={12} className="text-ink-muted hover:text-brand" />
                </button>
                <button onClick={() => remover(categoria.id)} aria-label="Excluir categoria">
                  <Trash2 size={12} className="text-ink-muted hover:text-danger" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={criarCategoria} className="mt-3 flex items-center gap-2">
        <input
          value={novaCategoria}
          onChange={(e) => setNovaCategoria(e.target.value)}
          placeholder="Nova categoria"
          className="rounded-lg border border-border px-3 py-1.5 text-xs text-ink-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <button
          type="submit"
          className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-ink-secondary hover:bg-page"
        >
          <Plus size={12} />
          Adicionar
        </button>
      </form>

      {erro && <p className="mt-2 text-xs text-danger">{erro}</p>}
    </div>
  );
}
