import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(restauranteId: string) {
    return this.prisma.categoria.findMany({
      where: { restauranteId },
      orderBy: { ordem: 'asc' },
      include: { _count: { select: { produtos: true } } },
    });
  }

  async criar(restauranteId: string, dto: CreateCategoriaDto) {
    return this.prisma.categoria.create({
      data: {
        restauranteId,
        nome: dto.nome,
        ordem: dto.ordem ?? 0,
      },
    });
  }

  async atualizar(restauranteId: string, id: string, dto: UpdateCategoriaDto) {
    await this.buscarDaCategoriaOuFalhar(restauranteId, id);

    return this.prisma.categoria.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined ? { nome: dto.nome } : {}),
        ...(dto.ordem !== undefined ? { ordem: dto.ordem } : {}),
      },
    });
  }

  async remover(restauranteId: string, id: string) {
    await this.buscarDaCategoriaOuFalhar(restauranteId, id);

    const produtosVinculados = await this.prisma.produto.count({
      where: { categoriaId: id },
    });
    if (produtosVinculados > 0) {
      throw new ConflictException(
        'Esta categoria possui produtos vinculados. Mova ou exclua os produtos antes de excluir a categoria.',
      );
    }

    await this.prisma.categoria.delete({ where: { id } });
  }

  private async buscarDaCategoriaOuFalhar(restauranteId: string, id: string) {
    const categoria = await this.prisma.categoria.findFirst({
      where: { id, restauranteId },
    });
    if (!categoria) {
      throw new NotFoundException('Categoria não encontrada');
    }
    return categoria;
  }
}
