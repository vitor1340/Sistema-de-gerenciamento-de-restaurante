'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { CategoriaDTO, ProdutoDTO } from '@comandai/shared-types';
import { CategoriaManager } from './CategoriaManager';
import { ProdutoList } from './ProdutoList';
import { ProdutoFormModal } from './ProdutoFormModal';

export function CardapioManager({
  produtosIniciais,
  categoriasIniciais,
}: {
  produtosIniciais: ProdutoDTO[];
  categoriasIniciais: CategoriaDTO[];
}) {
  const [produtos, setProdutos] = useState(produtosIniciais);
  const [categorias, setCategorias] = useState(categoriasIniciais);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState<ProdutoDTO | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  function abrirCriacao() {
    setProdutoEmEdicao(null);
    setModalAberto(true);
  }

  function abrirEdicao(produto: ProdutoDTO) {
    setProdutoEmEdicao(produto);
    setModalAberto(true);
  }

  function handleProdutoSalvo(produto: ProdutoDTO) {
    setProdutos((atual) => {
      const existe = atual.some((p) => p.id === produto.id);
      return existe ? atual.map((p) => (p.id === produto.id ? produto : p)) : [...atual, produto];
    });
    setModalAberto(false);
  }

  function handleProdutoRemovido(id: string) {
    setProdutos((atual) => atual.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-primary">Cardápio</h1>
          <p className="text-sm text-ink-secondary">Gerencie categorias, produtos e fotos.</p>
        </div>
        <button
          onClick={abrirCriacao}
          disabled={categorias.length === 0}
          className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          <Plus size={16} />
          Novo produto
        </button>
      </div>

      <div className="mb-6">
        <CategoriaManager categorias={categorias} onCategoriasChange={setCategorias} />
      </div>

      <ProdutoList
        produtos={produtos}
        categorias={categorias}
        onEditar={abrirEdicao}
        onProdutoAtualizado={handleProdutoSalvo}
        onProdutoRemovido={handleProdutoRemovido}
      />

      {modalAberto && (
        <ProdutoFormModal
          produto={produtoEmEdicao}
          categorias={categorias}
          onClose={() => setModalAberto(false)}
          onSalvo={handleProdutoSalvo}
        />
      )}
    </div>
  );
}
