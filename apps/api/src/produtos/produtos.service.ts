import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@Injectable()
export class ProdutosService {
  constructor(private readonly prisma: PrismaService) {}

  async listar(restauranteId: string) {
    return this.prisma.produto.findMany({
      where: { restauranteId },
      orderBy: [{ categoria: { ordem: 'asc' } }, { nome: 'asc' }],
      include: { categoria: true },
    });
  }

  async criar(restauranteId: string, dto: CreateProdutoDto) {
    await this.verificarCategoriaDoRestauranteOuFalhar(restauranteId, dto.categoriaId);

    return this.prisma.produto.create({
      data: {
        restauranteId,
        categoriaId: dto.categoriaId,
        nome: dto.nome,
        descricao: dto.descricao,
        precoCentavos: dto.precoCentavos,
        imagemUrl: dto.imagemUrl,
        disponivel: dto.disponivel ?? true,
      },
    });
  }

  async atualizar(restauranteId: string, id: string, dto: UpdateProdutoDto) {
    await this.buscarProdutoOuFalhar(restauranteId, id);

    if (dto.categoriaId !== undefined) {
      await this.verificarCategoriaDoRestauranteOuFalhar(restauranteId, dto.categoriaId);
    }

    return this.prisma.produto.update({
      where: { id },
      data: {
        ...(dto.nome !== undefined ? { nome: dto.nome } : {}),
        ...(dto.descricao !== undefined ? { descricao: dto.descricao } : {}),
        ...(dto.precoCentavos !== undefined ? { precoCentavos: dto.precoCentavos } : {}),
        ...(dto.categoriaId !== undefined ? { categoriaId: dto.categoriaId } : {}),
        ...(dto.imagemUrl !== undefined ? { imagemUrl: dto.imagemUrl } : {}),
        ...(dto.disponivel !== undefined ? { disponivel: dto.disponivel } : {}),
      },
    });
  }

  async remover(restauranteId: string, id: string) {
    await this.buscarProdutoOuFalhar(restauranteId, id);

    const usadoEmPedidos = await this.prisma.itemPedido.count({
      where: { produtoId: id },
    });
    if (usadoEmPedidos > 0) {
      throw new ConflictException(
        'Este produto já foi usado em pedidos e não pode ser excluído. Marque-o como indisponível em vez de excluir.',
      );
    }

    await this.prisma.produto.delete({ where: { id } });
  }

  private async buscarProdutoOuFalhar(restauranteId: string, id: string) {
    const produto = await this.prisma.produto.findFirst({
      where: { id, restauranteId },
    });
    if (!produto) {
      throw new NotFoundException('Produto não encontrado');
    }
    return produto;
  }

  private async verificarCategoriaDoRestauranteOuFalhar(
    restauranteId: string,
    categoriaId: string,
  ) {
    const categoria = await this.prisma.categoria.findFirst({
      where: { id: categoriaId, restauranteId },
    });
    if (!categoria) {
      throw new NotFoundException('Categoria não encontrada');
    }
    return categoria;
  }
}
