import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/jwt.types';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { ProdutosService } from './produtos.service';

@UseGuards(JwtAuthGuard)
@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Get()
  listar(@CurrentUser() user: AuthenticatedUser) {
    return this.produtosService.listar(user.restauranteId);
  }

  @Post()
  criar(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateProdutoDto) {
    return this.produtosService.criar(user.restauranteId, dto);
  }

  @Patch(':id')
  atualizar(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateProdutoDto,
  ) {
    return this.produtosService.atualizar(user.restauranteId, id, dto);
  }

  @Delete(':id')
  remover(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.produtosService.remover(user.restauranteId, id);
  }
}
