import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { CriarPedidoPublicoDto } from '../pedidos/dto/criar-pedido-publico.dto';
import { LojaService } from './loja.service';

@Controller('loja')
export class LojaController {
  constructor(private readonly lojaService: LojaService) {}

  @Get(':slug')
  buscarPorSlug(@Param('slug') slug: string) {
    return this.lojaService.buscarPorSlug(slug);
  }

  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post(':slug/pedidos')
  criarPedido(@Param('slug') slug: string, @Body() dto: CriarPedidoPublicoDto) {
    return this.lojaService.criarPedido(slug, dto);
  }

  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Get(':slug/pedidos/:id')
  buscarPedido(@Param('slug') slug: string, @Param('id') id: string) {
    return this.lojaService.buscarPedidoPublico(slug, id);
  }
}
