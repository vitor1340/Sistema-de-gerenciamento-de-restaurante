import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PedidosService {
  constructor(private readonly prisma: PrismaService) {}

  async recentes(restauranteId: string, limit: number) {
    const pedidos = await this.prisma.pedido.findMany({
      where: { restauranteId },
      orderBy: { createdAt: 'desc' },
      take: limit,
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
}
