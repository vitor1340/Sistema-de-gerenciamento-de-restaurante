import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { gerarSlugUnico } from '../common/slugify.util';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { ExcluirCategoriaDto } from './dto/excluir-categoria.dto';
import { ReordenarCategoriaDto } from './dto/reordenar-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@Injectable()
export class CategoriasService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(restauranteId: string) {
    const categorias = await this.prisma.categoria.findMany({
      where: { restauranteId },
      orderBy: { ordem: 'asc' },
      include: { _count: { select: { produtos: true } } },
    });

    return categorias.map(({ _count, ...categoria }) => ({
      ...categoria,
      produtosCount: _count.produtos,
    }));
  }

  async criar(restauranteId: string, dto: CreateCategoriaDto) {
    const slug = await gerarSlugUnico(dto.nome, (candidato) =>
      this.slugEmUso(restauranteId, candidato),
    );

    return this.prisma.categoria.create({
      data: {
        restauranteId,
        nome: dto.nome,
        slug,
        ordem: dto.ordem ?? 0,
      },
    });
  }

  async atualizar(restauranteId: string, id: string, dto: UpdateCategoriaDto) {
    const categoria = await this.buscarDaCategoriaOuFalhar(restauranteId, id);

    const novoSlug =
      dto.nome !== undefined && dto.nome !== categoria.nome
        ? await gerarSlugUnico(dto.nome, (candidato) =>
            this.slugEmUso(restauranteId, candidato, id),
          )
        : undefined;

    return this.prisma.categoria.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined ? { nome: dto.nome } : {}),
        ...(novoSlug !== undefined ? { slug: novoSlug } : {}),
        ...(dto.ordem !== undefined ? { ordem: dto.ordem } : {}),
        ...(dto.ativa !== undefined ? { ativa: dto.ativa } : {}),
      },
    });
  }

  async remover(restauranteId: string, id: string, dto: ExcluirCategoriaDto) {
    await this.buscarDaCategoriaOuFalhar(restauranteId, id);

    const produtosVinculados = await this.prisma.produto.count({
      where: { categoriaId: id },
    });

    if (produtosVinculados > 0) {
      const { moverProdutosParaCategoriaId, desvincularProdutos } = dto;

      if (!moverProdutosParaCategoriaId && !desvincularProdutos) {
        throw new ConflictException({
          message:
            'Esta categoria possui produtos vinculados. Escolha mover os produtos para outra categoria ou deixá-los sem categoria.',
          produtosVinculados,
        });
      }

      if (moverProdutosParaCategoriaId && desvincularProdutos) {
        throw new BadRequestException(
          'Escolha mover os produtos ou desvinculá-los, não os dois',
        );
      }

      if (moverProdutosParaCategoriaId) {
        if (moverProdutosParaCategoriaId === id) {
          throw new BadRequestException(
            'Não é possível mover produtos para a mesma categoria que está sendo excluída',
          );
        }
        await this.buscarDaCategoriaOuFalhar(
          restauranteId,
          moverProdutosParaCategoriaId,
        );
      }

      await this.prisma.$transaction([
        this.prisma.produto.updateMany({
          where: { categoriaId: id },
          data: { categoriaId: moverProdutosParaCategoriaId ?? null },
        }),
        this.prisma.categoria.delete({ where: { id } }),
      ]);
      return { removido: true };
    }

    await this.prisma.categoria.delete({ where: { id } });
    return { removido: true };
  }

  async reordenar(
    restauranteId: string,
    id: string,
    dto: ReordenarCategoriaDto,
  ) {
    const categoria = await this.buscarDaCategoriaOuFalhar(restauranteId, id);

    const vizinha = await this.prisma.categoria.findFirst({
      where: {
        restauranteId,
        ordem:
          dto.direcao === 'CIMA'
            ? { lt: categoria.ordem }
            : { gt: categoria.ordem },
      },
      orderBy: { ordem: dto.direcao === 'CIMA' ? 'desc' : 'asc' },
    });

    if (!vizinha) {
      // já está na ponta (primeira ou última) — nada a fazer, não é erro
      return this.listar(restauranteId);
    }

    await this.prisma.$transaction([
      this.prisma.categoria.update({
        where: { id: categoria.id },
        data: { ordem: vizinha.ordem },
      }),
      this.prisma.categoria.update({
        where: { id: vizinha.id },
        data: { ordem: categoria.ordem },
      }),
    ]);

    return this.listar(restauranteId);
  }

  private async slugEmUso(
    restauranteId: string,
    slug: string,
    ignorarId?: string,
  ): Promise<boolean> {
    const existente = await this.prisma.categoria.findFirst({
      where: {
        restauranteId,
        slug,
        ...(ignorarId ? { id: { not: ignorarId } } : {}),
      },
      select: { id: true },
    });
    return Boolean(existente);
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
