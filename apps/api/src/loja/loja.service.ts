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

    const mapearProduto = (
      produto: (typeof restaurante.categorias)[number]['produtos'][number],
    ) => ({
      id: produto.id,
      nome: produto.nome,
      descricao: produto.descricao,
      precoCentavos: produto.precoCentavos,
      imagemUrl: produto.imagemUrl,
    });

    const produtoDestaque = restaurante.categorias
      .flatMap((categoria) => categoria.produtos)
      .find((produto) => produto.destaque);

    return {
      nome: restaurante.nome,
      slug: restaurante.slug,
      aberto: restaurante.aberto,
      whatsapp: restaurante.whatsapp,
      tagline: restaurante.tagline,
      logoUrl: restaurante.logoUrl,
      corDestaque: restaurante.corDestaque,
      tipoAtendimento: restaurante.tipoAtendimento,
      endereco: restaurante.endereco,
      horarioFuncionamento: restaurante.horarioFuncionamento,
      diferenciais: restaurante.diferenciais,
      produtoDestaque: produtoDestaque ? mapearProduto(produtoDestaque) : null,
      categorias: restaurante.categorias
        .filter((categoria) => categoria.produtos.length > 0)
        .map((categoria) => ({
          id: categoria.id,
          nome: categoria.nome,
          produtos: categoria.produtos.map(mapearProduto),
        })),
    };
  }
}
