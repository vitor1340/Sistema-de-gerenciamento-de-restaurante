'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { RestauranteMeDTO, UpdateRestauranteDTO } from '@comandai/shared-types';
import { apiFetch } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

export function ConfiguracoesForm({ restaurante }: { restaurante: RestauranteMeDTO }) {
  const token = useAuthStore((state) => state.accessToken) ?? undefined;
  const [whatsapp, setWhatsapp] = useState(restaurante.whatsapp ?? '');
  const [aberto, setAberto] = useState(restaurante.aberto);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);

  const linkLoja =
    typeof window !== 'undefined'
      ? `${window.location.origin}/loja/${restaurante.slug}`
      : `/loja/${restaurante.slug}`;

  async function copiarLink() {
    await navigator.clipboard.writeText(linkLoja);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2000);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);
    setSalvo(false);
    setSalvando(true);

    const payload: UpdateRestauranteDTO = {
      whatsapp: whatsapp.replace(/\D/g, ''),
      aberto,
    };

    try {
      await apiFetch('/restaurantes/me', token, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setSalvo(true);
    } catch {
      setErro('Não foi possível salvar. Confira o número do WhatsApp (DDI + DDD + número).');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-1 text-2xl font-bold text-ink-primary">Configurações</h1>
      <p className="mb-6 text-sm text-ink-secondary">Dados da sua loja pública.</p>

      <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
        <p className="mb-1 text-sm font-semibold text-ink-primary">Link da sua loja</p>
        <p className="mb-3 text-xs text-ink-secondary">
          Compartilhe esse link com seus clientes para eles verem o cardápio e fazerem pedidos.
        </p>
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={linkLoja}
            className="flex-1 truncate rounded-lg border border-border bg-page px-3 py-2 text-sm text-ink-secondary"
          />
          <button
            type="button"
            onClick={copiarLink}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-ink-secondary hover:bg-page"
          >
            {linkCopiado ? <Check size={14} className="text-success" /> : <Copy size={14} />}
            {linkCopiado ? 'Copiado' : 'Copiar'}
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-border bg-surface p-5"
      >
        <div>
          <label htmlFor="whatsapp" className="mb-1 block text-sm font-medium text-ink-primary">
            WhatsApp para receber pedidos
          </label>
          <input
            id="whatsapp"
            type="tel"
            placeholder="5511999998888"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <p className="mt-1 text-xs text-ink-muted">
            Só números, com DDI + DDD (ex: 55 11 99999-8888 → 5511999998888). Enquanto esse campo
            estiver vazio, os clientes não conseguem finalizar pedidos pela loja.
          </p>
        </div>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={aberto}
            onChange={(e) => setAberto(e.target.checked)}
            className="h-4 w-4 rounded border-border text-brand focus:ring-brand/20"
          />
          <span className="text-sm text-ink-primary">Loja aberta para pedidos</span>
        </label>

        {erro && <p className="text-sm text-danger">{erro}</p>}
        {salvo && <p className="text-sm text-success">Configurações salvas.</p>}

        <button
          type="submit"
          disabled={salvando}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  );
}
