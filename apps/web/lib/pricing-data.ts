import type { FaixaAssinatura } from '@comandai/shared-types';

export interface FaixaPreco {
  id: string;
  rotulo?: string;
  faixaPedidos: string;
  preco: string;
}

// Ponte entre o `id` usado só pra exibição/seleção aqui no front e o enum
// que a API espera — precisa ficar sincronizado manualmente com
// apps/api/src/assinaturas/faixa-assinatura.util.ts (preço em centavos).
export const FAIXA_ID_PARA_ENUM: Record<string, FaixaAssinatura> = {
  'ate-150': 'ATE_150',
  '151-250': 'DE_151_A_250',
  'acima-250': 'ACIMA_250',
};

export const testeGratis = {
  preco: 'R$ 0 / 7 dias',
  nota: 'Sem cartão de crédito',
  descricao: 'Use o Comandaí completo por 7 dias antes de decidir.',
  features: [
    'Acesso completo a todas as funcionalidades do Pro',
    'Cardápio digital e pedidos ilimitados',
    'Pagamento online via Pix e cartão',
    'Sem compromisso — cancele quando quiser',
  ],
  cta: 'Começar teste grátis',
};

export const planoPro = {
  descricao:
    'O valor acompanha o crescimento do seu restaurante: quanto mais pedidos, mais o plano evolui com você.',
  faixas: [
    {
      id: 'ate-150',
      rotulo: 'Mais comum pra começar',
      faixaPedidos: 'Até 150 pedidos/mês',
      preco: 'R$ 64,90/mês',
    },
    {
      id: '151-250',
      faixaPedidos: '151 a 250 pedidos/mês',
      preco: 'R$ 115,90/mês',
    },
    {
      id: 'acima-250',
      faixaPedidos: 'Acima de 250 pedidos/mês',
      preco: 'R$ 219,90/mês',
    },
  ] satisfies FaixaPreco[],
  cta: 'Assinar Pro',
  rodape:
    'Após o teste grátis, você escolhe a faixa que combina com seu volume de pedidos. Pode trocar de faixa quando quiser.',
};

export const funcionalidades = [
  'Cardápio digital com loja pública (/loja/seu-restaurante)',
  'Pedido sem precisar criar conta',
  'Delivery ou retirada',
  'Acompanhamento do pedido em tempo real',
  'Painel atualiza na hora, sem precisar dar F5',
  'Pagamento via Pix ou cartão',
  'Dinheiro cai direto na sua conta via Mercado Pago',
  'Logo, cor e diferenciais personalizados',
  'Métricas de vendas e ticket médio',
  'Login por e-mail/senha ou Google',
  'Autenticação de dois fatores (2FA)',
  'Sessão segura com renovação automática',
];
