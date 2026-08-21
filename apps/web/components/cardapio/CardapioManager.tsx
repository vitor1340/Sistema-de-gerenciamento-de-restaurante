'use client';

import { useState } from 'react';
import { LayoutList, Plus, ToggleLeft } from 'lucide-react';
import type { CategoriaDTO, ProdutoDTO } from '@comandai/shared-types';
import { QuickActions, type QuickAction } from '@/components/shared/QuickActions';
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
  const [modoSelecao, setModoSelecao] = useState(false);

  function abrirCriacao() {
    if (categorias.length === 0) {
      alert('Crie uma categoria antes de adicionar produtos.');
      return;
    }
    setProdutoEmEdicao(null);
    setModalAberto(true);
  }

  function irParaCategorias() {
    document.getElementById('categorias')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function ativarSelecaoEmMassa() {
    setModoSelecao(true);
    document.getElementById('produtos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  const quickActions: QuickAction[] = [
    {
      icon: Plus,
      title: 'Adicionar produto',
      subtitle: 'Novo item no cardápio',
      onClick: abrirCriacao,
    },
    {
      icon: LayoutList,
      title: 'Organizar categorias',
      subtitle: 'Criar, renomear ou excluir',
      onClick: irParaCategorias,
    },
    {
      icon: ToggleLeft,
      title: 'Ativar/desativar em massa',
      subtitle: 'Selecionar vários produtos',
      onClick: ativarSelecaoEmMassa,
    },
  ];

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
        <QuickActions actions={quickActions} />
      </div>

      <div id="categorias" className="mb-6 scroll-mt-4">
        <CategoriaManager categorias={categorias} onCategoriasChange={setCategorias} />
      </div>

      <ProdutoList
        key={modoSelecao ? 'selecao' : 'normal'}
        produtos={produtos}
        categorias={categorias}
        onEditar={abrirEdicao}
        onProdutoAtualizado={handleProdutoSalvo}
        onProdutoRemovido={handleProdutoRemovido}
        modoSelecao={modoSelecao}
        onSairModoSelecao={() => setModoSelecao(false)}
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
