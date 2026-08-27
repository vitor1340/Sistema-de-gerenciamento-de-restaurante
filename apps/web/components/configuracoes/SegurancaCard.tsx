'use client';

import { useState } from 'react';
import { Check, ShieldCheck } from 'lucide-react';
import type {
  AtivarDoisFatoresResponseDTO,
  SetupDoisFatoresDTO,
} from '@comandai/shared-types';
import { apiFetch } from '@/lib/api-client';
import { useAuthStore } from '@/store/auth-store';

type Etapa = 'idle' | 'configurando' | 'backupCodes' | 'desativando';

export function SegurancaCard({ doisFatoresAtivoInicial }: { doisFatoresAtivoInicial: boolean }) {
  const token = useAuthStore((state) => state.accessToken) ?? undefined;
  const [ativo, setAtivo] = useState(doisFatoresAtivoInicial);
  const [etapa, setEtapa] = useState<Etapa>('idle');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [codigo, setCodigo] = useState('');
  const [senha, setSenha] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function iniciarConfiguracao() {
    setErro(null);
    setCarregando(true);
    try {
      const dados = await apiFetch<SetupDoisFatoresDTO>('/auth/2fa/setup', token, {
        method: 'POST',
      });
      setQrCodeDataUrl(dados.qrCodeDataUrl);
      setEtapa('configurando');
    } catch {
      setErro('Não foi possível iniciar a configuração do 2FA.');
    } finally {
      setCarregando(false);
    }
  }

  async function confirmarAtivacao(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const dados = await apiFetch<AtivarDoisFatoresResponseDTO>('/auth/2fa/enable', token, {
        method: 'POST',
        body: JSON.stringify({ codigo }),
      });
      setBackupCodes(dados.backupCodes);
      setEtapa('backupCodes');
      setCodigo('');
    } catch {
      setErro('Código inválido. Confira o app autenticador e tente de novo.');
    } finally {
      setCarregando(false);
    }
  }

  function concluirAtivacao() {
    setAtivo(true);
    setEtapa('idle');
    setQrCodeDataUrl(null);
    setBackupCodes([]);
  }

  async function confirmarDesativacao(event: React.FormEvent) {
    event.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      await apiFetch('/auth/2fa/disable', token, {
        method: 'POST',
        body: JSON.stringify({ senha }),
      });
      setAtivo(false);
      setEtapa('idle');
      setSenha('');
    } catch {
      setErro('Senha incorreta.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="mb-6 rounded-2xl border border-border bg-surface p-5">
      <div className="mb-1 flex items-center gap-2">
        <ShieldCheck size={16} className="text-ink-secondary" />
        <p className="text-sm font-semibold text-ink-primary">Autenticação de dois fatores</p>
      </div>
      <p className="mb-3 text-xs text-ink-secondary">
        Exige um código do seu aplicativo autenticador (Google Authenticator, Authy etc.) além da
        senha para entrar na sua conta.
      </p>

      {erro && <p className="mb-3 text-sm text-danger">{erro}</p>}

      {etapa === 'idle' && !ativo && (
        <button
          type="button"
          onClick={iniciarConfiguracao}
          disabled={carregando}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {carregando ? 'Preparando...' : 'Ativar 2FA'}
        </button>
      )}

      {etapa === 'idle' && ativo && (
        <div className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-1.5 text-sm text-success">
            <Check size={14} />
            2FA ativado
          </span>
          <button
            type="button"
            onClick={() => setEtapa('desativando')}
            className="rounded-lg border border-border px-3 py-2 text-xs font-medium text-ink-secondary hover:bg-page"
          >
            Desativar
          </button>
        </div>
      )}

      {etapa === 'configurando' && qrCodeDataUrl && (
        <form onSubmit={confirmarAtivacao} className="space-y-3">
          <p className="text-xs text-ink-secondary">
            Escaneie o código com seu aplicativo autenticador e informe o código de 6 dígitos
            gerado.
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrCodeDataUrl}
            alt="QR code para configurar o autenticador"
            className="h-40 w-40 rounded-lg border border-border"
          />
          <input
            type="text"
            inputMode="numeric"
            required
            autoFocus
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="000000"
            className="w-full rounded-lg border border-border px-3 py-2 text-center text-lg tracking-widest text-ink-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={carregando}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {carregando ? 'Confirmando...' : 'Confirmar'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEtapa('idle');
                setQrCodeDataUrl(null);
                setCodigo('');
                setErro(null);
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink-secondary hover:bg-page"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {etapa === 'backupCodes' && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-ink-primary">
            Guarde estes códigos de backup em um lugar seguro.
          </p>
          <p className="text-xs text-ink-secondary">
            Cada um só pode ser usado uma vez, para entrar caso você perca acesso ao aplicativo
            autenticador. Eles não serão mostrados de novo.
          </p>
          <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-page p-3 font-mono text-sm text-ink-primary">
            {backupCodes.map((codigoBackup) => (
              <span key={codigoBackup}>{codigoBackup}</span>
            ))}
          </div>
          <button
            type="button"
            onClick={concluirAtivacao}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Já copiei meus códigos
          </button>
        </div>
      )}

      {etapa === 'desativando' && (
        <form onSubmit={confirmarDesativacao} className="space-y-3">
          <label htmlFor="senha-desativar-2fa" className="block text-sm font-medium text-ink-primary">
            Confirme sua senha para desativar o 2FA
          </label>
          <input
            id="senha-desativar-2fa"
            type="password"
            required
            autoFocus
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full rounded-lg border border-border px-3 py-2 text-sm text-ink-primary outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={carregando}
              className="rounded-lg border border-danger/30 px-4 py-2 text-sm font-semibold text-danger transition hover:bg-danger/10 disabled:opacity-60"
            >
              {carregando ? 'Desativando...' : 'Confirmar desativação'}
            </button>
            <button
              type="button"
              onClick={() => {
                setEtapa('idle');
                setSenha('');
                setErro(null);
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink-secondary hover:bg-page"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
