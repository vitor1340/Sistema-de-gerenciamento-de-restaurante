import { FaixaAssinatura } from '../../generated/prisma/client';

// Fonte da verdade do preço no backend — nunca confiar em valor vindo do
// cliente. Precisa ficar sincronizado manualmente com
// apps/web/lib/pricing-data.ts (não existe pacote de pricing compartilhado).
export const PRECO_CENTAVOS_POR_FAIXA: Record<FaixaAssinatura, number> = {
  ATE_150: 6490,
  DE_151_A_250: 11590,
  ACIMA_250: 21990,
};

export const NOME_FAIXA_ASSINATURA: Record<FaixaAssinatura, string> = {
  ATE_150: 'até 150 pedidos/mês',
  DE_151_A_250: '151 a 250 pedidos/mês',
  ACIMA_250: 'acima de 250 pedidos/mês',
};
