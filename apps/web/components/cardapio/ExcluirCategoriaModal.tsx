'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { CategoriaDTO } from '@comandai/shared-types';

export function ExcluirCategoriaModal({
  categoria,
  produtosVinculados,
  outrasCategorias,
  onCancelar,
  onConfirmarMover,
  onConfirmarDesvincular,
}: {
  categoria: CategoriaDTO;
  produtosVinculados: number;
  outrasCategorias: CategoriaDTO[];
  onCancelar: () => void;
  onConfirmarMover: (categoriaDestinoId: string) => void;
  onConfirmarDesvincular: () => void;
}) {
  const [categoriaDestinoId, setCategoriaDestinoId] = useState(outrasCategorias[0]?.id ?? '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink-primary">Excluir &quot;{categoria.nome}&quot;</h2>
          <button onClick={onCancelar} aria-label="Fechar">
            <X size={18} className="text-ink-muted hover:text-ink-primary" />
          </button>
        </div>

        <p className="mb-4 text-sm text-ink-secondary">
          {produtosVinculados === 1
            ? 'Há 1 produto nesta categoria.'
            : `Há ${produtosVinculados} produtos nesta categoria.`}{' '}
          Escolha o que fazer com {produtosVinculados === 1 ? 'ele' : 'eles'} antes de excluir.
        </p>

        {outrasCategorias.length > 0 && (
          <div className="mb-3 space-y-2 rounded-lg border border-border p-3">
            <label htmlFor="categoriaDestino" className="block text-xs font-medium text-ink-primary">
              Mover produtos para
            </label>
            <select
              id="categoriaDestino"
              value={categoriaDestinoId}
              onChange={(e) => setCategoriaDestinoId(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              {outrasCategorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onConfirmarMover(categoriaDestinoId)}
              disabled={!categoriaDestinoId}
              className="w-full rounded-lg bg-brand py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              Mover e excluir categoria
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onConfirmarDesvincular}
          className="w-full rounded-lg border border-border py-2 text-sm font-medium text-ink-secondary transition hover:bg-page"
        >
          Deixar {produtosVinculados === 1 ? 'produto' : 'produtos'} sem categoria e excluir
        </button>

        <button
          type="button"
          onClick={onCancelar}
          className="mt-2 w-full py-2 text-xs text-ink-muted hover:text-ink-primary"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
