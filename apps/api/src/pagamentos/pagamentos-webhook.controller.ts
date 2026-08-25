import { Controller, Headers, HttpCode, Post, Query } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PagamentosService } from './pagamentos.service';

@Controller('pagamentos')
export class PagamentosWebhookController {
  constructor(private readonly pagamentosService: PagamentosService) {}

  @SkipThrottle()
  @HttpCode(200)
  @Post('webhook')
  async webhook(
    @Query('restauranteId') restauranteId: string,
    @Query('data.id') dataId: string,
    @Headers('x-signature') xSignature: string,
    @Headers('x-request-id') xRequestId: string,
  ) {
    await this.pagamentosService.processarNotificacaoWebhook({
      restauranteId,
      dataId,
      xSignature,
      xRequestId,
    });
    return { recebido: true };
  }
}
