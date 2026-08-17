import { Injectable } from '@nestjs/common';
import { StatusPedido } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RestaurantesService {
  constructor(private readonly prisma: PrismaService) {}

  async me(restauranteId: string) {
    const restaurante = await this.prisma.restaurante.findUniqueOrThrow({
      where: { id: restauranteId },
    });

    const pedidosNovosCount = await this.prisma.pedido.count({
      where: { restauranteId, status: StatusPedido.NOVO },
    });

    return {
      id: restaurante.id,
      nome: restaurante.nome,
      plano: restaurante.plano,
      aberto: restaurante.aberto,
      pedidosNovosCount,
    };
  }
}
