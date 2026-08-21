'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Clock, MapPin, Package, Plus, ShoppingBag } from 'lucide-react';
import type { LojaDTO, LojaProdutoDTO } from '@comandai/shared-types';
import { formatCentavos } from '@/lib/format';
import { CarrinhoDrawer } from './CarrinhoDrawer';

const ACENTO_PADRAO = '#e7a22f';

export function LojaView({ loja }: { loja: LojaDTO }) {
  const [carrinho, setCarrinho] = useState<Record<string, number>>({});
  const [carrinhoAberto, setCarrinhoAberto] = useState(false);

  const produtosPorId = useMemo(() => {
    const mapa = new Map<string, LojaProdutoDTO>();
    for (const categoria of loja.categorias) {
      for (const produto of categoria.produtos) {
        mapa.set(produto.id, produto);
      }
    }
    return mapa;
  }, [loja.categorias]);

  const { quantidadeTotal, subtotalCentavos } = useMemo(() => {
    let quantidade = 0;
    let subtotal = 0;
    for (const [produtoId, qtd] of Object.entries(carrinho)) {
      const produto = produtosPorId.get(produtoId);
      if (!produto || qtd <= 0) continue;
      quantidade += qtd;
      subtotal += produto.precoCentavos * qtd;
    }
    return { quantidadeTotal: quantidade, subtotalCentavos: subtotal };
  }, [carrinho, produtosPorId]);

  function adicionarAoCarrinho(produtoId: string) {
    setCarrinho((atual) => ({ ...atual, [produtoId]: (atual[produtoId] ?? 0) + 1 }));
  }

  function alterarQuantidade(produtoId: string, delta: number) {
    setCarrinho((atual) => {
      const proxima = Math.max(0, (atual[produtoId] ?? 0) + delta);
      const copia = { ...atual };
      if (proxima === 0) {
        delete copia[produtoId];
      } else {
        copia[produtoId] = proxima;
      }
      return copia;
    });
  }

  const semProdutos = loja.categorias.length === 0;
  const temAtendimentoFisico = loja.tipoAtendimento !== 'SOMENTE_DELIVERY';
  const temLocalizacao = temAtendimentoFisico && !!(loja.endereco || loja.horarioFuncionamento);
  const temDiferenciais = loja.diferenciais.length > 0;

  return (
    <div
      className="loja-publica min-h-screen bg-[var(--lp-char)] pb-24 text-[var(--lp-paper)]"
      style={{ '--lp-accent': loja.corDestaque || ACENTO_PADRAO } as React.CSSProperties}
    >
      <header className="sticky top-0 z-20 border-b-4 border-[var(--lp-accent)] bg-[var(--lp-char)]">
        <div className="mx-auto flex h-[70px] max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--lp-paper-dim)] text-sm font-bold text-[var(--lp-char)]">
              {loja.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={loja.logoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                loja.nome.charAt(0).toUpperCase()
              )}
            </div>
            <span className="lp-display text-lg">{loja.nome}</span>
          </div>
          <nav className="flex items-center gap-6 text-xs font-bold uppercase tracking-wide text-[var(--lp-paper-dim)]">
            {loja.categorias.length > 0 && (
              <a href="#produtos" className="transition hover:text-[var(--lp-accent)]">
                Produtos
              </a>
            )}
            {temLocalizacao && (
              <a href="#localizacao" className="transition hover:text-[var(--lp-accent)]">
                Localização
              </a>
            )}
            <Link href={`/loja/${loja.slug}/pedido`} className="transition hover:text-[var(--lp-accent)]">
              Acompanhar pedido
            </Link>
          </nav>
        </div>
      </header>

      <section
        className="relative overflow-hidden px-4 pb-16 pt-16"
        style={{
          background:
            'radial-gradient(circle at 82% 18%, color-mix(in srgb, var(--lp-accent) 22%, transparent), transparent 45%), var(--lp-char)',
        }}
      >
        <div
          className={`mx-auto grid max-w-5xl items-center gap-10 ${
            loja.produtoDestaque ? 'md:grid-cols-[1.15fr_0.85fr]' : ''
          }`}
        >
          <div className={loja.produtoDestaque ? '' : 'max-w-2xl'}>
            <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--lp-accent)]">
              <span
                className={`h-1.5 w-1.5 rounded-full ${loja.aberto ? 'bg-[var(--lp-accent)]' : 'bg-[var(--lp-paper-dim)]'}`}
              />
              {loja.aberto ? 'Aberto agora' : 'Fechado no momento'}
            </div>

            <h1 className="lp-display text-4xl leading-[0.97] sm:text-6xl">{loja.nome}</h1>

            {loja.tagline && (
              <p className="mt-5 max-w-[46ch] text-base leading-relaxed text-[var(--lp-paper-dim)]">
                {loja.tagline}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-4">
              {loja.categorias.length > 0 && (
                <a
                  href="#produtos"
                  className="rounded-[3px] border-2 border-[var(--lp-paper)] bg-[var(--lp-paper)] px-6 py-3.5 text-sm font-extrabold uppercase tracking-wide text-[var(--lp-char)] transition hover:border-[var(--lp-accent)] hover:text-[var(--lp-accent)]"
                >
                  Ver produtos
                </a>
              )}
              {temLocalizacao && (
                <a
                  href="#localizacao"
                  className="rounded-[3px] border-2 border-[var(--lp-paper-dim)] px-6 py-3.5 text-sm font-extrabold uppercase tracking-wide text-[var(--lp-paper)] transition hover:border-[var(--lp-accent)] hover:text-[var(--lp-accent)]"
                >
                  Ver localização
                </a>
              )}
            </div>
          </div>

          {loja.produtoDestaque && (
            <div className="lp-ticket mx-auto w-full max-w-sm rotate-2 rounded-sm bg-[var(--lp-paper)] p-6 pb-7 text-[var(--lp-char)] shadow-2xl">
              <div className="mb-3.5 aspect-[16/10] w-full overflow-hidden rounded-sm bg-[var(--lp-paper-dim)]">
                {loja.produtoDestaque.imagemUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={loja.produtoDestaque.imagemUrl}
                    alt={loja.produtoDestaque.nome}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="text-[var(--lp-char)]/40" size={26} />
                  </div>
                )}
              </div>
              <div className="lp-mono mb-3 flex items-center justify-between border-b-2 border-dashed border-[var(--lp-line)] pb-2.5 text-[0.7rem] tracking-wide">
                <span>EM DESTAQUE</span>
              </div>
              <div className="lp-display mb-2.5 text-xl">{loja.produtoDestaque.nome}</div>
              <div className="lp-mono mt-3 flex items-center justify-between border-t-2 border-dashed border-[var(--lp-line)] pt-3 text-base font-bold text-[var(--lp-chili)]">
                <span className="text-sm font-normal not-italic text-[var(--lp-char)]">Preço</span>
                <span>{formatCentavos(loja.produtoDestaque.precoCentavos)}</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {temDiferenciais && (
        <div
          className="overflow-hidden whitespace-nowrap border-y-4 border-[var(--lp-char)] bg-[var(--lp-accent)] text-[var(--lp-char)]"
          aria-hidden="true"
        >
          <div className="lp-marquee-track py-3 text-xs font-bold uppercase tracking-wide">
            {/* Repete o bloco de diferenciais várias vezes (em duas metades iguais,
                pra animação de -50% continuar perfeita) — com poucos itens cadastrados,
                uma única cópia fica curta demais e a faixa não cobre a tela toda. */}
            {[...Array(8)].flatMap((_, bloco) =>
              loja.diferenciais.map((item, index) => (
                <span key={`${bloco}-${index}`} className="mx-5">
                  ★ {item}
                </span>
              )),
            )}
          </div>
        </div>
      )}

      <main
        id="produtos"
        className="scroll-mt-20 bg-[var(--lp-paper)] px-4 py-16 text-[var(--lp-char)]"
      >
        <div className="mx-auto max-w-5xl">
          {semProdutos ? (
            <div className="flex flex-col items-center justify-center rounded-sm border-2 border-dashed border-[var(--lp-paper-dim)] py-16 text-center">
              <Package className="mb-3 text-[var(--lp-char)]/40" size={28} />
              <p className="lp-display text-lg">Nenhum produto disponível</p>
              <p className="mt-1 text-sm text-[var(--lp-char)]/60">
                Essa loja ainda não cadastrou produtos disponíveis.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {loja.categorias.map((categoria) => (
                <section
                  key={categoria.id}
                  id={`categoria-${categoria.id}`}
                  className="scroll-mt-20"
                >
                  <h2 className="lp-display mb-5 text-2xl">{categoria.nome}</h2>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {categoria.produtos.map((produto) => (
                      <div
                        key={produto.id}
                        className="overflow-hidden rounded-sm border-2 border-[var(--lp-char)] bg-white transition hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--lp-char)]"
                      >
                        <div className="aspect-[4/3] w-full bg-[var(--lp-paper-dim)]">
                          {produto.imagemUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={produto.imagemUrl}
                              alt={produto.nome}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Package className="text-[var(--lp-char)]/40" size={26} />
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="lp-display mb-2 text-base">{produto.nome}</h3>
                          {produto.descricao && (
                            <p className="min-h-[2.5rem] text-sm leading-relaxed text-[var(--lp-char)]/70">
                              {produto.descricao}
                            </p>
                          )}
                          <div className="mt-3.5 flex items-center justify-between border-t border-dashed border-[var(--lp-line)] pt-3">
                            <span className="lp-mono text-base font-bold text-[var(--lp-chili)]">
                              {formatCentavos(produto.precoCentavos)}
                            </span>

                            {carrinho[produto.id] ? (
                              <div className="flex items-center gap-2 rounded-full border border-[var(--lp-char)]/20 bg-[var(--lp-paper)] px-1 py-1">
                                <button
                                  onClick={() => alterarQuantidade(produto.id, -1)}
                                  aria-label="Remover uma unidade"
                                  className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lp-char)] text-[var(--lp-paper)]"
                                >
                                  −
                                </button>
                                <span className="w-4 text-center text-xs font-bold">
                                  {carrinho[produto.id]}
                                </span>
                                <button
                                  onClick={() => alterarQuantidade(produto.id, 1)}
                                  aria-label="Adicionar mais uma unidade"
                                  className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--lp-char)] text-[var(--lp-paper)]"
                                >
                                  +
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => adicionarAoCarrinho(produto.id)}
                                aria-label={`Adicionar ${produto.nome}`}
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--lp-char)] text-[var(--lp-paper)] transition hover:bg-[var(--lp-chili)]"
                              >
                                <Plus size={15} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </main>

      {temLocalizacao && (
        <section
          id="localizacao"
          className="scroll-mt-20 bg-[var(--lp-paper-dim)] px-4 py-16 text-[var(--lp-char)]"
        >
          <div className="mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-2">
            <div>
              <span className="lp-mono text-xs uppercase tracking-widest text-[var(--lp-chili)]">
                Horário &amp; endereço
              </span>
              <h2 className="lp-display mt-3 mb-4 text-2xl">Onde estamos</h2>
              {loja.endereco && <p className="text-[var(--lp-char)]/75">{loja.endereco}</p>}
              {loja.horarioFuncionamento && (
                <p className="mt-2 text-[var(--lp-char)]/75">{loja.horarioFuncionamento}</p>
              )}
            </div>
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-[var(--lp-char)] bg-[var(--lp-paper)] p-6 text-center">
              {loja.endereco && <MapPin size={26} className="text-[var(--lp-chili)]" />}
              {loja.horarioFuncionamento && (
                <Clock size={20} className="mt-1 text-[var(--lp-char)]/50" />
              )}
              <b className="lp-display text-base">{loja.nome}</b>
              {loja.endereco && (
                <span className="text-sm text-[var(--lp-char)]/70">{loja.endereco}</span>
              )}
            </div>
          </div>
        </section>
      )}

      <footer className="border-t-4 border-[var(--lp-accent)] bg-[var(--lp-char)] px-4 py-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
          <span className="lp-display text-base">{loja.nome}</span>
          {loja.whatsapp && (
            <a
              href={`https://wa.me/${loja.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="lp-mono text-xs text-[var(--lp-paper-dim)] transition hover:text-[var(--lp-accent)]"
            >
              Fale no WhatsApp
            </a>
          )}
        </div>
      </footer>

      {quantidadeTotal > 0 && (
        <button
          onClick={() => setCarrinhoAberto(true)}
          className="fixed inset-x-4 bottom-4 z-30 mx-auto flex max-w-md items-center justify-between rounded-[3px] bg-[var(--lp-chili)] px-5 py-4 text-[var(--lp-paper)] shadow-lg transition hover:opacity-95"
        >
          <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
            <ShoppingBag size={18} />
            {quantidadeTotal} {quantidadeTotal === 1 ? 'item' : 'itens'}
          </span>
          <span className="lp-mono text-sm font-bold">
            Ver carrinho · {formatCentavos(subtotalCentavos)}
          </span>
        </button>
      )}

      {carrinhoAberto && (
        <CarrinhoDrawer
          loja={loja}
          carrinho={carrinho}
          produtosPorId={produtosPorId}
          subtotalCentavos={subtotalCentavos}
          onAlterarQuantidade={alterarQuantidade}
          onClose={() => setCarrinhoAberto(false)}
          onPedidoCriado={() => setCarrinho({})}
        />
      )}
    </div>
  );
}
