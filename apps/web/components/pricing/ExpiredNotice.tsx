'use client';

import { useSearchParams } from 'next/navigation';

const MENSAGENS_POR_MOTIVO: Record<string, string> = {
  'teste-expirado': 'Seu teste grátis acabou. Escolha um plano para continuar usando o Comandaí.',
  'assinatura-cancelada':
    'Sua assinatura do Comandaí foi cancelada. Escolha um plano para continuar usando o Comandaí.',
  'assinatura-necessaria':
    'Você precisa de um plano ativo para continuar usando o Comandaí.',
};

export function ExpiredNotice() {
  const searchParams = useSearchParams();
  const motivo = searchParams.get('motivo');
  const mensagem = motivo ? MENSAGENS_POR_MOTIVO[motivo] : undefined;

  if (!mensagem) {
    return null;
  }

  return (
    <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-terracotta/30 bg-terracotta/10 px-4 py-3 text-center text-sm font-medium text-terracotta">
      {mensagem}
    </div>
  );
}
