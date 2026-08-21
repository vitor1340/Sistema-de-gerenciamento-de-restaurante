import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PedidosService } from '../pedidos/pedidos.service';
import { CriarPedidoPublicoDto } from '../pedidos/dto/criar-pedido-publico.dto';

@Injectable()
export class LojaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pedidosService: PedidosService,
  ) {}

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

  async buscarPedidoPublico(slug: string, pedidoId: string) {
    const restaurante = await this.prisma.restaurante.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!restaurante) {
      throw new NotFoundException('Loja não encontrada');
    }

    const pedido = await this.prisma.pedido.findFirst({
      where: { id: pedidoId, restauranteId: restaurante.id },
      include: { itens: { include: { produto: true } } },
    });
    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }

    return {
      id: pedido.id,
      numero: pedido.numero,
      clienteNome: pedido.clienteNome,
      status: pedido.status,
      tipoEntrega: pedido.tipoEntrega,
      valorTotalCentavos: pedido.valorTotalCentavos,
      createdAt: pedido.createdAt,
      updatedAt: pedido.updatedAt,
      itens: pedido.itens.map((item) => ({
        produtoNome: item.produto.nome,
        quantidade: item.quantidade,
        precoUnitarioCentavos: item.precoUnitarioCentavos,
      })),
    };
  }

  async criarPedido(slug: string, dto: CriarPedidoPublicoDto) {
    const restaurante = await this.prisma.restaurante.findUnique({
      where: { slug },
      select: { id: true, aberto: true },
    });

    if (!restaurante) {
      throw new NotFoundException('Loja não encontrada');
    }
    if (!restaurante.aberto) {
      throw new ConflictException(
        'Esta loja está fechada no momento e não está recebendo pedidos',
      );
    }

    return this.pedidosService.criarPublico(restaurante.id, dto);
  }
}
