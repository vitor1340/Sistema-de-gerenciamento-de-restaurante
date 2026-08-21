import type { CanalVenda, StatusPedido, TipoEntrega } from '@comandai/shared-types';

export const CANAL_LABEL: Record<CanalVenda, string> = {
  CARDAPIO_DIGITAL: 'Cardápio digital',
  WHATSAPP: 'WhatsApp',
  QR_CODE_SALAO: 'QR Code / salão',
};

export const CANAL_COLOR: Record<CanalVenda, string> = {
  CARDAPIO_DIGITAL: 'var(--color-series-cardapio)',
  WHATSAPP: 'var(--color-series-whatsapp)',
  QR_CODE_SALAO: 'var(--color-series-qrcode)',
};

export const TIPO_ENTREGA_LABEL: Record<TipoEntrega, string> = {
  DELIVERY: 'Delivery',
  RETIRADA: 'Retirada',
  SALAO: 'Salão',
};

export const STATUS_LABEL: Record<StatusPedido, string> = {
  NOVO: 'Novo',
  CONFIRMADO: 'Confirmado',
  EM_PREPARO: 'Em preparo',
  PRONTO: 'Pronto',
  SAIU_PARA_ENTREGA: 'Saiu para entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

export const STATUS_COLOR: Record<StatusPedido, string> = {
  NOVO: 'var(--color-status-novo)',
  CONFIRMADO: 'var(--color-status-confirmado)',
  EM_PREPARO: 'var(--color-status-preparo)',
  PRONTO: 'var(--color-status-pronto)',
  SAIU_PARA_ENTREGA: 'var(--color-status-entrega)',
  ENTREGUE: 'var(--color-status-entregue)',
  CANCELADO: 'var(--color-status-cancelado)',
};

/**
 * Espelha as transições aceitas pelo backend (apps/api PedidosService), só
 * para decidir quais botões mostrar — o backend é a fonte da verdade e
 * revalida a transição antes de aplicar.
 */
export const TRANSICOES_STATUS_PEDIDO: Record<StatusPedido, StatusPedido[]> = {
  NOVO: ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO: ['EM_PREPARO', 'CANCELADO'],
  EM_PREPARO: ['PRONTO', 'CANCELADO'],
  PRONTO: ['SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO'],
  SAIU_PARA_ENTREGA: ['ENTREGUE', 'CANCELADO'],
  ENTREGUE: [],
  CANCELADO: [],
};

export const ACAO_STATUS_LABEL: Record<StatusPedido, string> = {
  NOVO: 'Reabrir pedido',
  CONFIRMADO: 'Confirmar pedido',
  EM_PREPARO: 'Iniciar preparo',
  PRONTO: 'Marcar como pronto',
  SAIU_PARA_ENTREGA: 'Enviar para entrega',
  ENTREGUE: 'Marcar como entregue',
  CANCELADO: 'Cancelar pedido',
};
