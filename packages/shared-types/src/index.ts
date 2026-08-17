export type CanalVenda = 'CARDAPIO_DIGITAL' | 'WHATSAPP' | 'QR_CODE_SALAO';
export type TipoEntrega = 'DELIVERY' | 'RETIRADA' | 'SALAO';
export type StatusPedido =
  | 'NOVO'
  | 'CONFIRMADO'
  | 'EM_PREPARO'
  | 'PRONTO'
  | 'SAIU_PARA_ENTREGA'
  | 'ENTREGUE'
  | 'CANCELADO';

export interface UsuarioDTO {
  id: string;
  nome: string;
  email: string;
  cargo: string;
}

export interface LoginResponseDTO {
  accessToken: string;
  usuario: UsuarioDTO;
}

export interface RestauranteMeDTO {
  id: string;
  nome: string;
  plano: string;
  aberto: boolean;
  pedidosNovosCount: number;
}

export interface DashboardSummaryDTO {
  dataFormatada: string;
  saudacao: string;
  vendasHoje: { valorCentavos: number; variacaoPercentual: number };
  pedidosHoje: { quantidade: number; variacaoAbsoluta: number };
  ticketMedio: { valorCentavos: number; variacaoPercentual: number };
  tempoMedioPreparo: { minutos: number; variacaoMinutos: number };
  ultimoPedidoNovo: { numero: number; clienteNome: string; valorTotalCentavos: number } | null;
}

export interface SalesPerformanceDTO {
  totalPeriodoCentavos: number;
  variacaoPercentual: number;
  serie: { data: string; diaSemana: string; valorCentavos: number }[];
}

export interface SalesChannelsDTO {
  totalPedidos: number;
  canais: { canal: CanalVenda; quantidade: number; percentual: number }[];
}

export interface PedidoResumoDTO {
  id: string;
  numero: number;
  clienteNome: string;
  itensCount: number;
  tipoEntrega: TipoEntrega;
  status: StatusPedido;
  valorTotalCentavos: number;
  createdAt: string;
}
