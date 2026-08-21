import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CanalVenda,
  Prisma,
  StatusPedido,
} from '../../generated/prisma/client';
import { CriarPedidoPublicoDto } from './dto/criar-pedido-publico.dto';

const TRANSICOES_PERMITIDAS: Record<StatusPedido, StatusPedido[]> = {
  NOVO: [StatusPedido.CONFIRMADO, StatusPedido.CANCELADO],
  CONFIRMADO: [StatusPedido.EM_PREPARO, StatusPedido.CANCELADO],
  EM_PREPARO: [StatusPedido.PRONTO, StatusPedido.CANCELADO],
  PRONTO: [
    StatusPedido.SAIU_PARA_ENTREGA,
    StatusPedido.ENTREGUE,
    StatusPedido.CANCELADO,
  ],
  SAIU_PARA_ENTREGA: [StatusPedido.ENTREGUE, StatusPedido.CANCELADO],
  ENTREGUE: [],
  CANCELADO: [],
};

const MAX_TENTATIVAS_NUMERO = 5;

@Injectable()
export class PedidosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(restauranteId: string, take: number, status?: StatusPedido) {
    const pedidos = await this.prisma.pedido.findMany({
      where: { restauranteId, ...(status ? { status } : {}) },
      orderBy: { createdAt: 'desc' },
      take,
      include: { _count: { select: { itens: true } } },
    });

    return pedidos.map((pedido) => ({
      id: pedido.id,
      numero: pedido.numero,
      clienteNome: pedido.clienteNome,
      itensCount: pedido._count.itens,
      tipoEntrega: pedido.tipoEntrega,
      status: pedido.status,
      valorTotalCentavos: pedido.valorTotalCentavos,
      createdAt: pedido.createdAt,
    }));
  }

  async detalhar(restauranteId: string, id: string) {
    const pedido = await this.prisma.pedido.findFirst({
      where: { id, restauranteId },
      include: { itens: { include: { produto: true } } },
    });
    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }
    return pedido;
  }

  async atualizarStatus(
    restauranteId: string,
    id: string,
    novoStatus: StatusPedido,
  ) {
    const pedido = await this.buscarPedidoOuFalhar(restauranteId, id);

    const transicoesPermitidas = TRANSICOES_PERMITIDAS[pedido.status];
    if (!transicoesPermitidas.includes(novoStatus)) {
      throw new ConflictException(
        `Não é possível mudar o status de "${pedido.status}" para "${novoStatus}"`,
      );
    }

    return this.prisma.pedido.update({
      where: { id },
      data: { status: novoStatus },
    });
  }

  async criarPublico(restauranteId: string, dto: CriarPedidoPublicoDto) {
    if (dto.chaveIdempotencia) {
      const existente = await this.buscarPorChaveIdempotencia(
        restauranteId,
        dto.chaveIdempotencia,
      );
      if (existente) {
        return existente;
      }
    }

    const produtoIds = [...new Set(dto.itens.map((item) => item.produtoId))];
    const produtos = await this.prisma.produto.findMany({
      where: { id: { in: produtoIds }, restauranteId, disponivel: true },
    });
    const produtosPorId = new Map(
      produtos.map((produto) => [produto.id, produto]),
    );

    for (const item of dto.itens) {
      if (!produtosPorId.has(item.produtoId)) {
        throw new BadRequestException(
          'Um ou mais produtos do pedido não estão mais disponíveis',
        );
      }
    }

    const valorTotalCentavos = dto.itens.reduce((total, item) => {
      const produto = produtosPorId.get(item.produtoId)!;
      return total + produto.precoCentavos * item.quantidade;
    }, 0);

    for (let tentativa = 0; tentativa < MAX_TENTATIVAS_NUMERO; tentativa++) {
      try {
        return await this.prisma.$transaction(async (tx) => {
          const ultimoPedido = await tx.pedido.findFirst({
            where: { restauranteId },
            orderBy: { numero: 'desc' },
            select: { numero: true },
          });
          const numero = (ultimoPedido?.numero ?? 0) + 1;

          return tx.pedido.create({
            data: {
              restauranteId,
              numero,
              clienteNome: dto.clienteNome,
              canal: CanalVenda.CARDAPIO_DIGITAL,
              tipoEntrega: dto.tipoEntrega,
              status: StatusPedido.NOVO,
              valorTotalCentavos,
              chaveIdempotencia: dto.chaveIdempotencia,
              itens: {
                create: dto.itens.map((item) => {
                  const produto = produtosPorId.get(item.produtoId)!;
                  return {
                    produtoId: item.produtoId,
                    quantidade: item.quantidade,
                    precoUnitarioCentavos: produto.precoCentavos,
                    observacao: item.observacao,
                  };
                }),
              },
            },
            include: { itens: true },
          });
        });
      } catch (erro) {
        if (
          erro instanceof Prisma.PrismaClientKnownRequestError &&
          erro.code === 'P2002'
        ) {
          if (dto.chaveIdempotencia) {
            const existente = await this.buscarPorChaveIdempotencia(
              restauranteId,
              dto.chaveIdempotencia,
            );
            if (existente) {
              return existente;
            }
          }
          if (tentativa < MAX_TENTATIVAS_NUMERO - 1) {
            continue;
          }
        }
        throw erro;
      }
    }

    throw new ConflictException(
      'Não foi possível registrar o pedido, tente novamente',
    );
  }

  private async buscarPorChaveIdempotencia(
    restauranteId: string,
    chaveIdempotencia: string,
  ) {
    return this.prisma.pedido.findFirst({
      where: { restauranteId, chaveIdempotencia },
      include: { itens: true },
    });
  }

  private async buscarPedidoOuFalhar(restauranteId: string, id: string) {
    const pedido = await this.prisma.pedido.findFirst({
      where: { id, restauranteId },
    });
    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }
    return pedido;
  }
}
