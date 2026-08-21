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
      tagline: restaurante.tagline,
      logoUrl: restaurante.logoUrl,
      corDestaque: restaurante.corDestaque,
      tipoAtendimento: restaurante.tipoAtendimento,
      endereco: restaurante.endereco,
      horarioFuncionamento: restaurante.horarioFuncionamento,
      diferenciais: restaurante.diferenciais,
      pedidosNovosCount,
    };
  }

  async atualizar(restauranteId: string, dto: UpdateRestauranteDto) {
    return this.prisma.restaurante.update({
      where: { id: restauranteId },
      data: {
        ...(dto.nome !== undefined ? { nome: dto.nome } : {}),
        ...(dto.whatsapp !== undefined
          ? { whatsapp: dto.whatsapp || null }
          : {}),
        ...(dto.aberto !== undefined ? { aberto: dto.aberto } : {}),
        ...(dto.tagline !== undefined ? { tagline: dto.tagline || null } : {}),
        ...(dto.logoUrl !== undefined ? { logoUrl: dto.logoUrl || null } : {}),
        ...(dto.corDestaque !== undefined
          ? { corDestaque: dto.corDestaque || null }
          : {}),
        ...(dto.tipoAtendimento !== undefined
          ? { tipoAtendimento: dto.tipoAtendimento }
          : {}),
        ...(dto.endereco !== undefined
          ? { endereco: dto.endereco || null }
          : {}),
        ...(dto.horarioFuncionamento !== undefined
          ? { horarioFuncionamento: dto.horarioFuncionamento || null }
          : {}),
        ...(dto.diferenciais !== undefined
          ? {
              diferenciais: dto.diferenciais.filter(
                (texto) => texto.trim().length > 0,
              ),
            }
          : {}),
      },
    });
  }
}
