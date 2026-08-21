'use client';

import { useState } from 'react';
import { Check, Copy, Download, Palette, Pencil, Plus, Share2, Store, Truck, X } from 'lucide-react';
import type {
  RestauranteMeDTO,
  TipoAtendimento,
  UpdateRestauranteDTO,
  UploadImagemResponseDTO,
} from '@comandai/shared-types';
import { apiFetch, apiUpload } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';
import { QuickActions, type QuickAction } from '@/components/shared/QuickActions';

const COR_PADRAO = '#eb6834';
const MAX_DIFERENCIAIS = 6;

const OPCOES_ATENDIMENTO: { value: TipoAtendimento; label: string }[] = [
  { value: 'DELIVERY_E_FISICA', label: 'Delivery e loja física' },
  { value: 'SOMENTE_DELIVERY', label: 'Somente delivery' },
  { value: 'SOMENTE_FISICA', label: 'Somente loja física' },
];

export function ConfiguracoesForm({ restaurante }: { restaurante: RestauranteMeDTO }) {
  const token = useAuthStore((state) => state.accessToken) ?? undefined;

  const [nome, setNome] = useState(restaurante.nome);
  const [tagline, setTagline] = useState(restaurante.tagline ?? '');
  const [logoUrl, setLogoUrl] = useState(restaurante.logoUrl ?? '');
  const [corDestaque, setCorDestaque] = useState(restaurante.corDestaque ?? COR_PADRAO);
  const [tipoAtendimento, setTipoAtendimento] = useState<TipoAtendimento>(
    restaurante.tipoAtendimento,
  );
  const [endereco, setEndereco] = useState(restaurante.endereco ?? '');
  const [horarioFuncionamento, setHorarioFuncionamento] = useState(
    restaurante.horarioFuncionamento ?? '',
  );
  const [diferenciais, setDiferenciais] = useState<string[]>(restaurante.diferenciais);
  const [whatsapp, setWhatsapp] = useState(restaurante.whatsapp ?? '');
  const [aberto, setAberto] = useState(restaurante.aberto);

  const [enviandoLogo, setEnviandoLogo] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);
  const [linkCopiado, setLinkCopiado] = useState(false);

  const temEnderecoRelevante = tipoAtendimento !== 'SOMENTE_DELIVERY';

  function focarCampo(id: string) {
    const campo = document.getElementById(id);
    campo?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    campo?.focus();
  }

  const quickActions: QuickAction[] = [
    {
      icon: Pencil,
      title: 'Editar dados da loja',
      subtitle: 'Nome, logo e tagline',
      onClick: () => focarCampo('nome'),
    },
    {
      icon: Truck,
      title: 'Tipo de atendimento',
      subtitle: 'Delivery ou loja física',
      onClick: () => focarCampo('tipoAtendimento'),
    },
    {
      icon: Palette,
      title: 'Personalizar cor da loja',
      subtitle: 'Cor de destaque da página',
      onClick: () => focarCampo('cor'),
    },
    {
      icon: Store,
      title: 'Visualizar loja',
      subtitle: 'Como seus clientes veem',
      href: `/loja/${restaurante.slug}`,
      target: '_blank',
    },
    {
      icon: Share2,
      title: 'Compartilhar cardápio',
      subtitle: linkCopiado ? 'Link copiado!' : 'Copiar link da loja',
      onClick: copiarLink,
    },
    {
      icon: Download,
      title: 'Exportar relatório',
      subtitle: 'Vendas e financeiro',
      onClick: () => alert('Exportação de relatórios em breve.'),
    },
  ];

  const linkLoja =
    typeof window !== 'undefined'
      ? `${window.location.origin}/loja/${restaurante.slug}`
      : `/loja/${restaurante.slug}`;

  function atualizarDiferencial(index: number, valor: string) {
    setDiferenciais((atual) => atual.map((item, i) => (i === index ? valor : item)));
  }

  function removerDiferencial(index: number) {
    setDiferenciais((atual) => atual.filter((_, i) => i !== index));
  }

  function adicionarDiferencial() {
    setDiferenciais((atual) => [...atual, '']);
  }

  async function copiarLink() {
    await navigator.clipboard.writeText(linkLoja);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2000);
  }

  async function handleLogoSelecionado(event: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];
    if (!arquivo) return;

    setEnviandoLogo(true);
    setErro(null);
    try {
      const formData = new FormData();
      formData.append('arquivo', arquivo);
      const resultado = await apiUpload<UploadImagemResponseDTO>(
        '/upload/loja-logo',
        token,
        formData,
      );
      setLogoUrl(resultado.url);
    } catch {
      setErro('Não foi possível enviar a logo. Envie uma imagem de até 10MB.');
    } finally {
      setEnviandoLogo(false);
      event.target.value = '';
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);
    setSalvo(false);
    setSalvando(true);

    const payload: UpdateRestauranteDTO = {
      nome,
      tagline: tagline || undefined,
      logoUrl: logoUrl || undefined,
      corDestaque,
      tipoAtendimento,
      endereco: temEnderecoRelevante ? endereco || undefined : undefined,
      horarioFuncionamento: temEnderecoRelevante ? horarioFuncionamento || undefined : undefined,
      diferenciais: diferenciais.map((item) => item.trim()).filter(Boolean),
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
      setErro('Não foi possível salvar. Confira os campos preenchidos e tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="max-w-xl">
      <h1 className="mb-1 text-2xl font-bold text-ink-primary">Configurações</h1>
      <p className="mb-6 text-sm text-ink-secondary">Dados da sua loja pública.</p>

      <div className="mb-6">
        <QuickActions actions={quickActions} />
      </div>

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
        className="space-y-6 rounded-2xl border border-border bg-surface p-5"
      >
        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Identidade
          </h2>

          <div className="flex items-center gap-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-page">
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-ink-muted">
                  Sem logo
                </div>
              )}
            </div>
            <label className="flex-1 cursor-pointer rounded-lg border border-dashed border-border px-3 py-2 text-center text-xs text-ink-secondary hover:border-brand">
              {enviandoLogo ? 'Enviando...' : 'Escolher logo'}
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoSelecionado}
                disabled={enviandoLogo}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label htmlFor="nome" className="mb-1 block text-sm font-medium text-ink-primary">
              Nome da loja
            </label>
            <input
              id="nome"
              required
              minLength={2}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <div>
            <label htmlFor="tagline" className="mb-1 block text-sm font-medium text-ink-primary">
              Frase de destaque
            </label>
            <input
              id="tagline"
              maxLength={140}
              placeholder="Ex: Aberto e servindo agora"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            />
          </div>

          <div>
            <label htmlFor="cor" className="mb-1 block text-sm font-medium text-ink-primary">
              Cor de destaque
            </label>
            <div className="flex items-center gap-2">
              <input
                id="cor"
                type="color"
                value={corDestaque}
                onChange={(e) => setCorDestaque(e.target.value)}
                className="h-9 w-14 cursor-pointer rounded-lg border border-border p-1"
              />
              <span className="text-sm text-ink-secondary">{corDestaque}</span>
            </div>
            <p className="mt-1 text-xs text-ink-muted">
              Usada na página pública da sua loja (botões, destaques e cabeçalho).
            </p>
          </div>
        </div>

        <div className="space-y-3 border-t border-border pt-5">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              Diferenciais
            </h2>
            {diferenciais.length < MAX_DIFERENCIAIS && (
              <button
                type="button"
                onClick={adicionarDiferencial}
                className="flex items-center gap-1 text-xs font-medium text-brand hover:underline"
              >
                <Plus size={13} />
                Adicionar
              </button>
            )}
          </div>
          <p className="text-xs text-ink-muted">
            Frases curtas exibidas em destaque na página pública (ex: &quot;Feito na hora do
            pedido&quot;). Deixe em branco pra não mostrar essa faixa.
          </p>

          {diferenciais.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-ink-muted">
              Nenhum diferencial cadastrado.
            </p>
          ) : (
            <div className="space-y-2">
              {diferenciais.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    maxLength={60}
                    placeholder="Ex: Ingrediente selecionado"
                    value={item}
                    onChange={(e) => atualizarDiferencial(index, e.target.value)}
                    className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                  />
                  <button
                    type="button"
                    onClick={() => removerDiferencial(index)}
                    aria-label="Remover diferencial"
                    className="shrink-0 text-ink-muted hover:text-danger"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 border-t border-border pt-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
            Atendimento
          </h2>

          <div>
            <label
              htmlFor="tipoAtendimento"
              className="mb-1 block text-sm font-medium text-ink-primary"
            >
              Tipo de atendimento
            </label>
            <select
              id="tipoAtendimento"
              value={tipoAtendimento}
              onChange={(e) => setTipoAtendimento(e.target.value as TipoAtendimento)}
              className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            >
              {OPCOES_ATENDIMENTO.map((opcao) => (
                <option key={opcao.value} value={opcao.value}>
                  {opcao.label}
                </option>
              ))}
            </select>
          </div>

          {temEnderecoRelevante && (
            <>
              <div>
                <label
                  htmlFor="endereco"
                  className="mb-1 block text-sm font-medium text-ink-primary"
                >
                  Endereço
                </label>
                <input
                  id="endereco"
                  placeholder="Rua, número, bairro, cidade"
                  value={endereco}
                  onChange={(e) => setEndereco(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>

              <div>
                <label
                  htmlFor="horario"
                  className="mb-1 block text-sm font-medium text-ink-primary"
                >
                  Horário de funcionamento
                </label>
                <input
                  id="horario"
                  placeholder="Seg a sáb, 11h – 22h"
                  value={horarioFuncionamento}
                  onChange={(e) => setHorarioFuncionamento(e.target.value)}
                  className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
                />
              </div>
            </>
          )}

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
        </div>

        {erro && <p className="text-sm text-danger">{erro}</p>}
        {salvo && <p className="text-sm text-success">Configurações salvas.</p>}

        <button
          type="submit"
          disabled={salvando || enviandoLogo}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {salvando ? 'Salvando...' : 'Salvar'}
        </button>
      </form>
    </div>
  );
}
