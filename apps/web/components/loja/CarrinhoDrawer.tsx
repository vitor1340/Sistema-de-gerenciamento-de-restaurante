'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, X } from 'lucide-react';
import type {
  CriarPedidoPublicoDTO,
  LojaDTO,
  LojaProdutoDTO,
  PedidoCriadoDTO,
} from '@comandai/shared-types';
import { apiFetch, ApiError } from '@/lib/api-client';
import { formatCentavos } from '@/lib/format';
import { salvarPedidoLocal } from '@/lib/pedidos-locais';

function montarMensagemWhatsApp(
  loja: LojaDTO,
  itens: { produto: LojaProdutoDTO; quantidade: number }[],
  totalCentavos: number,
  numeroPedido?: number,
): string {
  const linhas = itens.map(
    ({ produto, quantidade }) =>
      `${quantidade}x ${produto.nome} - ${formatCentavos(produto.precoCentavos * quantidade)}`,
  );

  return [
    `Olá! Acabei de fazer o pedido${numeroPedido ? ` #${numeroPedido}` : ''} no *${loja.nome}*:`,
    '',
    ...linhas,
    '',
    `*Total: ${formatCentavos(totalCentavos)}*`,
  ].join('\n');
}

function opcoesTipoEntrega(loja: LojaDTO): { valor: 'DELIVERY' | 'RETIRADA'; label: string }[] {
  const opcoes: { valor: 'DELIVERY' | 'RETIRADA'; label: string }[] = [];
  if (loja.tipoAtendimento !== 'SOMENTE_FISICA') {
    opcoes.push({ valor: 'DELIVERY', label: 'Entrega' });
  }
  if (loja.tipoAtendimento !== 'SOMENTE_DELIVERY') {
    opcoes.push({ valor: 'RETIRADA', label: 'Retirar no local' });
  }
  return opcoes;
}

export function CarrinhoDrawer({
  loja,
  carrinho,
  produtosPorId,
  subtotalCentavos,
  onAlterarQuantidade,
  onClose,
  onPedidoCriado,
}: {
  loja: LojaDTO;
  carrinho: Record<string, number>;
  produtosPorId: Map<string, LojaProdutoDTO>;
  subtotalCentavos: number;
  onAlterarQuantidade: (produtoId: string, delta: number) => void;
  onClose: () => void;
  onPedidoCriado: () => void;
}) {
  const [chaveIdempotencia] = useState(() => crypto.randomUUID());
  const [clienteNome, setClienteNome] = useState('');
  const opcoesEntrega = opcoesTipoEntrega(loja);
  const [tipoEntrega, setTipoEntrega] = useState<'DELIVERY' | 'RETIRADA'>(
    opcoesEntrega[0]?.valor ?? 'DELIVERY',
  );
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pedidoCriado, setPedidoCriado] = useState<PedidoCriadoDTO | null>(null);
  // Snapshot do carrinho no momento do envio: `carrinho`/`subtotalCentavos` são
  // props do pai e ficam zeradas assim que `onPedidoCriado` limpa o carrinho lá,
  // então a mensagem de WhatsApp precisa ler daqui, não das props ao vivo.
  const [itensConfirmados, setItensConfirmados] = useState<
    { produto: LojaProdutoDTO; quantidade: number }[]
  >([]);
  const [totalConfirmadoCentavos, setTotalConfirmadoCentavos] = useState(0);

  const itens = Object.entries(carrinho)
    .map(([produtoId, quantidade]) => ({
      produto: produtosPorId.get(produtoId),
      quantidade,
    }))
    .filter(
      (item): item is { produto: LojaProdutoDTO; quantidade: number } =>
        item.produto !== undefined && item.quantidade > 0,
    );

  const linkWhatsApp = loja.whatsapp
    ? `https://wa.me/${loja.whatsapp}?text=${encodeURIComponent(
        montarMensagemWhatsApp(
          loja,
          itensConfirmados,
          totalConfirmadoCentavos,
          pedidoCriado?.numero,
        ),
      )}`
    : null;

  async function finalizarPedido(event: React.FormEvent) {
    event.preventDefault();
    if (!clienteNome.trim() || itens.length === 0 || enviando) return;

    setEnviando(true);
    setErro(null);
    try {
      const payload: CriarPedidoPublicoDTO = {
        clienteNome: clienteNome.trim(),
        tipoEntrega,
        itens: itens.map(({ produto, quantidade }) => ({ produtoId: produto.id, quantidade })),
        chaveIdempotencia,
      };
      const criado = await apiFetch<PedidoCriadoDTO>(`/loja/${loja.slug}/pedidos`, undefined, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setItensConfirmados(itens);
      setTotalConfirmadoCentavos(subtotalCentavos);
      setPedidoCriado(criado);
      salvarPedidoLocal(loja.slug, criado.id);
      onPedidoCriado();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setErro('Esta loja está fechada no momento e não está recebendo pedidos.');
      } else if (error instanceof ApiError && error.status === 400) {
        setErro('Um ou mais itens do carrinho não estão mais disponíveis. Atualize a página.');
      } else {
        setErro('Não foi possível enviar seu pedido. Tente novamente.');
      }
    } finally {
      setEnviando(false);
    }
  }

  if (pedidoCriado) {
    return (
      <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center">
        <div className="w-full max-w-md rounded-t-2xl bg-surface p-6 text-center shadow-lg sm:rounded-2xl">
          <CheckCircle2 className="mx-auto mb-3 text-success" size={40} />
          <h2 className="text-lg font-semibold text-ink-primary">
            Pedido #{pedidoCriado.numero} enviado!
          </h2>
          <p className="mt-1 text-sm text-ink-secondary">
            {loja.nome} recebeu seu pedido e vai confirmar em instantes.
          </p>

          {linkWhatsApp && (
            <a
              href={linkWhatsApp}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 block w-full rounded-lg bg-success py-3 text-center text-sm font-semibold text-white transition hover:opacity-90"
            >
              Avisar pelo WhatsApp
            </a>
          )}

          <Link
            href={`/loja/${loja.slug}/pedido/${pedidoCriado.id}`}
            className="mt-3 block w-full rounded-lg border border-border py-3 text-center text-sm font-semibold text-brand transition hover:bg-page"
          >
            Acompanhar pedido
          </Link>

          <button
            onClick={onClose}
            className="mt-3 w-full rounded-lg border border-border py-3 text-center text-sm font-semibold text-ink-secondary transition hover:bg-page"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-surface p-5 shadow-lg sm:rounded-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink-primary">Seu pedido</h2>
          <button onClick={onClose} aria-label="Fechar carrinho">
            <X size={18} className="text-ink-muted hover:text-ink-primary" />
          </button>
        </div>

        <div className="space-y-3">
          {itens.map(({ produto, quantidade }) => (
            <div key={produto.id} className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-primary">{produto.nome}</p>
                <p className="text-xs text-ink-secondary">
                  {formatCentavos(produto.precoCentavos)} cada
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-border px-1 py-1">
                <button
                  onClick={() => onAlterarQuantidade(produto.id, -1)}
                  aria-label={`Remover uma unidade de ${produto.nome}`}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-ink-secondary hover:bg-page"
                >
                  −
                </button>
                <span className="w-4 text-center text-xs font-semibold text-ink-primary">
                  {quantidade}
                </span>
                <button
                  onClick={() => onAlterarQuantidade(produto.id, 1)}
                  aria-label={`Adicionar mais uma unidade de ${produto.nome}`}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-ink-secondary hover:bg-page"
                >
                  +
                </button>
              </div>
              <span className="w-20 shrink-0 text-right text-sm font-semibold text-ink-primary">
                {formatCentavos(produto.precoCentavos * quantidade)}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm font-medium text-ink-secondary">Total</span>
          <span className="text-lg font-bold text-ink-primary">
            {formatCentavos(subtotalCentavos)}
          </span>
        </div>

        <form onSubmit={finalizarPedido} className="mt-4 space-y-3 border-t border-border pt-4">
          <div>
            <label htmlFor="cliente-nome" className="mb-1 block text-xs font-medium text-ink-secondary">
              Seu nome
            </label>
            <input
              id="cliente-nome"
              required
              value={clienteNome}
              onChange={(e) => setClienteNome(e.target.value)}
              placeholder="Como podemos te chamar?"
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>

          {opcoesEntrega.length > 1 && (
            <div>
              <span className="mb-1 block text-xs font-medium text-ink-secondary">
                Como você quer receber?
              </span>
              <div className="flex gap-2">
                {opcoesEntrega.map((opcao) => (
                  <button
                    key={opcao.valor}
                    type="button"
                    onClick={() => setTipoEntrega(opcao.valor)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                      tipoEntrega === opcao.valor
                        ? 'border-brand bg-brand-soft text-brand'
                        : 'border-border text-ink-secondary hover:bg-page'
                    }`}
                  >
                    {opcao.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {erro && <p className="text-xs text-danger">{erro}</p>}

          <button
            type="submit"
            disabled={enviando || itens.length === 0}
            className="block w-full rounded-lg bg-success py-3 text-center text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {enviando ? 'Enviando pedido...' : 'Finalizar pedido'}
          </button>
        </form>

        {!loja.whatsapp && (
          <p className="mt-3 rounded-lg border border-dashed border-border p-3 text-center text-xs text-ink-secondary">
            Essa loja ainda não configurou um WhatsApp para receber atualizações do pedido.
          </p>
        )}
      </div>
    </div>
  );
}
