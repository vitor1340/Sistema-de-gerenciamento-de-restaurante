import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { StatusPedido } from '../../generated/prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/jwt.types';
import { AtualizarStatusPedidoDto } from './dto/atualizar-status-pedido.dto';
import { PedidosService } from './pedidos.service';

const STATUS_VALIDOS = Object.values(StatusPedido);

@UseGuards(JwtAuthGuard)
@Controller('pedidos')
export class PedidosController {
  constructor(private readonly pedidosService: PedidosService) {}

  @Get()
  async listar(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const take = limit ? Number.parseInt(limit, 10) : 5;

    let statusFiltro: StatusPedido | undefined;
    if (status) {
      if (!STATUS_VALIDOS.includes(status as StatusPedido)) {
        throw new BadRequestException('Status inválido');
      }
      statusFiltro = status as StatusPedido;
    }

    return this.pedidosService.listar(user.restauranteId, take, statusFiltro);
  }

  @Get(':id')
  detalhar(@CurrentUser() user: AuthenticatedUser, @Param('id') id: string) {
    return this.pedidosService.detalhar(user.restauranteId, id);
  }

  @Patch(':id/status')
  atualizarStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: AtualizarStatusPedidoDto,
  ) {
    return this.pedidosService.atualizarStatus(
      user.restauranteId,
      id,
      dto.status,
    );
  }
}
