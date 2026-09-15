'use client';

import { useState } from 'react';
import { CreditCard } from 'lucide-react';
import type { AssinaturaAtualDTO, FaixaAssinatura } from '@comandai/shared-types';
import { ApiError, apiFetch } from '@/lib/api-client';
import { FAIXA_ID_PARA_ENUM, planoPro } from '@/lib/pricing-data';

const OPCOES_FAIXA = planoPro.faixas.map((faixa) => ({
  value: FAIXA_ID_PARA_ENUM[faixa.id],
  label: faixa.faixaPedidos,
  preco: faixa.preco,
}));

const STATUS_LABEL: Record<AssinaturaAtualDTO['statusAssinatura'], string> = {
  TRIALING: 'Em teste grátis',
  ACTIVE: 'Ativa',
  EXPIRED: 'Teste expirado',
  PAST_DUE: 'Pagamento pendente',
  CANCELED: 'Cancelada',
};

function formatarPreco(precoCentavos: number): string {
  return (precoCentavos / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function AssinaturaCard({
  assinaturaInicial,
  token,
}: {
  assinaturaInicial: AssinaturaAtualDTO;
  token: string | undefined;
}) {
  const [assinatura, setAssinatura] = useState(assinaturaInicial);
  const [faixaSelecionada, setFaixaSelecionada] = useState<FaixaAssinatura>(
    assinatura.faixaAssinatura ?? OPCOES_FAIXA[0].value,
  );
  const [salvando, setSalvando] = useState(false);
  const [cancelando, setCancelando] = useState(false);
  const [aviso, setAviso] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  async function trocarFaixa() {
    setSalvando(true);
    setAviso(null);
    try {
      const atualizado = await apiFetch<AssinaturaAtualDTO>('/assinaturas', token, {
        method: 'PATCH',
        body: JSON.stringify({ faixa: faixaSelecionada }),
      });
      setAssinatura(atualizado);
      setAviso({ tipo: 'sucesso', texto: 'Faixa atualizada.' });
    } catch (erro) {
      setAviso({
        tipo: 'erro',
        texto:
          erro instanceof ApiError && erro.status === 409
            ? 'Você ainda não tem uma assinatura ativa para trocar de faixa.'
            : 'Não foi possível trocar de faixa agora.',
      });
    } finally {
      setSalvando(false);
    }
  }

  async function cancelarAssinatura() {
    if (!window.confirm('Tem certeza que quer cancelar sua assinatura do Comandaí?')) return;
    setCancelando(true);
    setAviso(null);
    try {
      await apiFetch('/assinaturas', token, { method: 'DELETE' });
      setAssinatura((atual) => ({ ...atual, statusAssinatura: 'CANCELED' }));
      setAviso({ tipo: 'sucesso', texto: 'Assinatura cancelada.' });
    } catch {
      setAviso({ tipo: 'erro', texto: 'Não foi possível cancelar agora.' });
    } finally {
      setCancelando(false);
    }
  }

  return (
    <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
      <div className="mb-1 flex items-center gap-2">
        <CreditCard size={16} className="text-ink-secondary" />
        <p className="text-sm font-semibold text-ink-primary">Assinatura Comandaí</p>
      </div>
      <p className="mb-3 text-xs text-ink-secondary">
        Plano Pro, com preço por volume de pedidos. Diferente da conexão do Mercado Pago acima —
        essa é a cobrança pelo uso do Comandaí, não pelos pagamentos dos seus clientes.
      </p>

      <p className="mb-3 text-sm text-ink-primary">
        Status:{' '}
        <span className="font-semibold">{STATUS_LABEL[assinatura.statusAssinatura]}</span>
        {assinatura.precoCentavos !== null && (
          <span className="text-ink-secondary">
            {' '}
            · {formatarPreco(assinatura.precoCentavos)}/mês
          </span>
        )}
      </p>

      {aviso && (
        <p className={`mb-3 text-sm ${aviso.tipo === 'sucesso' ? 'text-success' : 'text-danger'}`}>
          {aviso.texto}
        </p>
      )}

      {assinatura.temAssinatura ? (
        <div className="space-y-3">
          <div>
            <label
              htmlFor="faixaAssinatura"
              className="mb-1 block text-sm font-medium text-ink-primary"
            >
              Faixa de pedidos
            </label>
            <select
              id="faixaAssinatura"
              value={faixaSelecionada}
              onChange={(e) => setFaixaSelecionada(e.target.value as FaixaAssinatura)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              {OPCOES_FAIXA.map((opcao) => (
                <option key={opcao.value} value={opcao.value}>
                  {opcao.label} — {opcao.preco}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={trocarFaixa}
              disabled={salvando || faixaSelecionada === assinatura.faixaAssinatura}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {salvando ? 'Salvando...' : 'Trocar faixa'}
            </button>

            {assinatura.statusAssinatura !== 'CANCELED' && (
              <button
                type="button"
                onClick={cancelarAssinatura}
                disabled={cancelando}
                className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-ink-secondary hover:bg-page disabled:opacity-60"
              >
                {cancelando ? 'Cancelando...' : 'Cancelar assinatura'}
              </button>
            )}
          </div>
        </div>
      ) : (
        <a
          href="/planos"
          className="inline-block rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Assinar o plano Pro
        </a>
      )}
    </div>
  );
}
