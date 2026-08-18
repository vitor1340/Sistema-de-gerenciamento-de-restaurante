import { Injectable } from '@nestjs/common';
import { StatusPedido } from '../../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateRestauranteDto } from './dto/update-restaurante.dto';

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
      slug: restaurante.slug,
      plano: restaurante.plano,
      aberto: restaurante.aberto,
      whatsapp: restaurante.whatsapp,
      pedidosNovosCount,
    };
  }

  async atualizar(restauranteId: string, dto: UpdateRestauranteDto) {
    return this.prisma.restaurante.update({
      where: { id: restauranteId },
      data: {
        ...(dto.whatsapp !== undefined ? { whatsapp: dto.whatsapp || null } : {}),
        ...(dto.aberto !== undefined ? { aberto: dto.aberto } : {}),
      },
    });
  }
}
