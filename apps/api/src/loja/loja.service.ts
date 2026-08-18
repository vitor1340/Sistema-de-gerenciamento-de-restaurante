import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LojaService {
  constructor(private readonly prisma: PrismaService) {}

  async buscarPorSlug(slug: string) {
    const restaurante = await this.prisma.restaurante.findUnique({
      where: { slug },
      include: {
        categorias: {
          orderBy: { ordem: 'asc' },
          include: {
            produtos: {
              where: { disponivel: true },
              orderBy: { nome: 'asc' },
            },
          },
        },
      },
    });

    if (!restaurante) {
      throw new NotFoundException('Loja não encontrada');
    }

    return {
      nome: restaurante.nome,
      slug: restaurante.slug,
      aberto: restaurante.aberto,
      whatsapp: restaurante.whatsapp,
      categorias: restaurante.categorias
        .filter((categoria) => categoria.produtos.length > 0)
        .map((categoria) => ({
          id: categoria.id,
          nome: categoria.nome,
          produtos: categoria.produtos.map((produto) => ({
            id: produto.id,
            nome: produto.nome,
            descricao: produto.descricao,
            precoCentavos: produto.precoCentavos,
            imagemUrl: produto.imagemUrl,
          })),
        })),
    };
  }
}
