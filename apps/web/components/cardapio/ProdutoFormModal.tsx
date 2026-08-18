'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { CategoriaDTO, ProdutoDTO, UploadImagemResponseDTO } from '@comandai/shared-types';
import { apiFetch, apiUpload } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

function centavosParaReaisTexto(centavos: number): string {
  return (centavos / 100).toFixed(2).replace('.', ',');
}

function reaisTextoParaCentavos(texto: string): number {
  const normalizado = texto.replace(/\./g, '').replace(',', '.');
  const valor = Number.parseFloat(normalizado);
  return Number.isFinite(valor) ? Math.round(valor * 100) : 0;
}

export function ProdutoFormModal({
  produto,
  categorias,
  onClose,
  onSalvo,
}: {
  produto: ProdutoDTO | null;
  categorias: CategoriaDTO[];
  onClose: () => void;
  onSalvo: (produto: ProdutoDTO) => void;
}) {
  const token = useAuthStore((state) => state.accessToken) ?? undefined;
  const [nome, setNome] = useState(produto?.nome ?? '');
  const [descricao, setDescricao] = useState(produto?.descricao ?? '');
  const [preco, setPreco] = useState(
    produto ? centavosParaReaisTexto(produto.precoCentavos) : '',
  );
  const [categoriaId, setCategoriaId] = useState(produto?.categoriaId ?? categorias[0]?.id ?? '');
  const [imagemUrl, setImagemUrl] = useState(produto?.imagemUrl ?? '');
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleArquivoSelecionado(event: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    setEnviandoImagem(true);
    setErro(null);
    try {
      const formData = new FormData();
      formData.append('arquivo', arquivo);
      const resultado = await apiUpload<UploadImagemResponseDTO>(
        '/upload/produto-imagem',
        token,
        formData,
      );
      setImagemUrl(resultado.url);
    } catch {
      setErro('Não foi possível enviar a imagem. Use JPEG, PNG ou WEBP de até 5MB.');
    } finally {
      setEnviandoImagem(false);
      event.target.value = '';
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);
    setSalvando(true);

    const payload = {
      nome,
      descricao: descricao || undefined,
      precoCentavos: reaisTextoParaCentavos(preco),
      categoriaId,
      imagemUrl: imagemUrl || undefined,
    };

    try {
      const salvo = produto
        ? await apiFetch<ProdutoDTO>(`/produtos/${produto.id}`, token, {
            method: 'PATCH',
            body: JSON.stringify(payload),
          })
        : await apiFetch<ProdutoDTO>('/produtos', token, {
            method: 'POST',
            body: JSON.stringify(payload),
          });
      onSalvo(salvo);
    } catch {
      setErro('Não foi possível salvar o produto. Confira os dados e tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-primary">
            {produto ? 'Editar produto' : 'Novo produto'}
          </h2>
          <button onClick={onClose} aria-label="Fechar">
            <X size={18} className="text-ink-muted hover:text-ink-primary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-page">
              {imagemUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagemUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-center text-[10px] text-ink-muted">
                  Sem foto
                </div>
              )}
            </div>
            <label className="flex-1 cursor-pointer rounded-lg border border-dashed border-border px-3 py-2 text-center text-xs text-ink-secondary hover:border-brand">
              {enviandoImagem ? 'Enviando...' : 'Escolher foto'}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleArquivoSelecionado}
                disabled={enviandoImagem}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label htmlFor="nome" className="mb-1 block text-sm font-medium text-ink-primary">
              Nome
            </label>
            <input
              id="nome"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <div>
            <label htmlFor="descricao" className="mb-1 block text-sm font-medium text-ink-primary">
              Descrição
            </label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label htmlFor="preco" className="mb-1 block text-sm font-medium text-ink-primary">
                Preço (R$)
              </label>
              <input
                id="preco"
                required
                inputMode="decimal"
                placeholder="0,00"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              />
            </div>

            <div className="flex-1">
              <label
                htmlFor="categoria"
                className="mb-1 block text-sm font-medium text-ink-primary"
              >
                Categoria
              </label>
              <select
                id="categoria"
                required
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
              >
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {erro && <p className="text-sm text-danger">{erro}</p>}

          <button
            type="submit"
            disabled={salvando || enviandoImagem}
            className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {salvando ? 'Salvando...' : 'Salvar produto'}
          </button>
        </form>
      </div>
    </div>
  );
}
