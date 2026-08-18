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
  slug: string;
  plano: string;
  aberto: boolean;
  whatsapp: string | null;
  pedidosNovosCount: number;
}

export interface UpdateRestauranteDTO {
  whatsapp?: string;
  aberto?: boolean;
}

export interface LojaProdutoDTO {
  id: string;
  nome: string;
  descricao: string | null;
  precoCentavos: number;
  imagemUrl: string | null;
}

export interface LojaCategoriaDTO {
  id: string;
  nome: string;
  produtos: LojaProdutoDTO[];
}

export interface LojaDTO {
  nome: string;
  slug: string;
  aberto: boolean;
  whatsapp: string | null;
  categorias: LojaCategoriaDTO[];
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

export interface RegistrarDTO {
  nomeRestaurante: string;
  nomeDono: string;
  email: string;
  senha: string;
}

export interface CategoriaDTO {
  id: string;
  nome: string;
  ordem: number;
  createdAt: string;
}

export interface ProdutoDTO {
  id: string;
  categoriaId: string;
  categoria: CategoriaDTO;
  nome: string;
  descricao: string | null;
  precoCentavos: number;
  imagemUrl: string | null;
  disponivel: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoriaDTO {
  nome: string;
  ordem?: number;
}

export interface UpdateCategoriaDTO {
  nome?: string;
  ordem?: number;
}

export interface CreateProdutoDTO {
  nome: string;
  descricao?: string;
  precoCentavos: number;
  categoriaId: string;
  imagemUrl?: string;
  disponivel?: boolean;
}

export type UpdateProdutoDTO = Partial<CreateProdutoDTO>;

export interface UploadImagemResponseDTO {
  url: string;
}
