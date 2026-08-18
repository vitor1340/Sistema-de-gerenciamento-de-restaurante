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
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { UpdateCategoriaDto } from './dto/update-categoria.dto';

@UseGuards(JwtAuthGuard)
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  listar(@CurrentUser() user: AuthenticatedUser) {
    return this.categoriasService.listar(user.restauranteId);
  }

  @Post()
  criar(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateCategoriaDto) {
    return this.categoriasService.criar(user.restauranteId, dto);
  }

  @Patch(':id')
  atualizar(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateCategoriaDto,
  ) {
    return this.categoriasService.atualizar(user.restauranteId, id, dto);
  }

  @Delete(':id')
  remover(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.categoriasService.remover(user.restauranteId, id);
  }
}
