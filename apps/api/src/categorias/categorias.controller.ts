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
import { PlanoAtivoGuard } from '../restaurantes/plano-ativo.guard';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { ExcluirCategoriaDto } from './dto/excluir-categoria.dto';
import { ReordenarCategoriaDto } from './dto/reordenar-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

// PlanoAtivoGuard só nas rotas de escrita (ver método a método) — leitura
// (listar) continua liberada mesmo sem plano ativo, pra não quebrar o
// carregamento do painel (ver PlanoStatusBanner no frontend).
@UseGuards(JwtAuthGuard)
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  listar(@CurrentUser() user: AuthenticatedUser) {
    return this.categoriasService.listar(user.restauranteId);
  }

  @UseGuards(PlanoAtivoGuard)
  @Post()
  criar(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCategoriaDto,
  ) {
    return this.categoriasService.criar(user.restauranteId, dto);
  }

  @UseGuards(PlanoAtivoGuard)
  @Patch(':id')
  atualizar(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateCategoriaDto,
  ) {
    return this.categoriasService.atualizar(user.restauranteId, id, dto);
  }

  @UseGuards(PlanoAtivoGuard)
  @Delete(':id')
  remover(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ExcluirCategoriaDto,
  ) {
    return this.categoriasService.remover(user.restauranteId, id, dto);
  }

  @UseGuards(PlanoAtivoGuard)
  @Patch(':id/reordenar')
  reordenar(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: ReordenarCategoriaDto,
  ) {
    return this.categoriasService.reordenar(user.restauranteId, id, dto);
  }
}
