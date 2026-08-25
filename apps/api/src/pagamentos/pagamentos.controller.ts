import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/jwt.types';
import { exigirVariavelAmbiente } from '../common/env.util';
import { PagamentosService } from './pagamentos.service';

@Controller('pagamentos')
export class PagamentosController {
  private readonly logger = new Logger(PagamentosController.name);

  constructor(private readonly pagamentosService: PagamentosService) {}

  @UseGuards(JwtAuthGuard)
  @Get('conectar')
  async conectar(@CurrentUser() user: AuthenticatedUser) {
    return {
      url: await this.pagamentosService.gerarLinkConexao(user.restauranteId),
    };
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const origemFrontend = exigirVariavelAmbiente('CORS_ORIGIN');
    try {
      await this.pagamentosService.tratarCallback(code, state);
      res.redirect(`${origemFrontend}/configuracoes?mercadopago=conectado`);
    } catch (erro) {
      this.logger.error('Falha ao tratar callback do Mercado Pago', erro);
      res.redirect(`${origemFrontend}/configuracoes?mercadopago=erro`);
    }
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Delete('conectar')
  async desconectar(@CurrentUser() user: AuthenticatedUser) {
    await this.pagamentosService.desconectar(user.restauranteId);
    return { mensagem: 'Mercado Pago desconectado' };
  }
}
