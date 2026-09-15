import { Controller, Headers, HttpCode, Post, Query } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AssinaturasService } from './assinaturas.service';

// URL configurada manualmente no painel de desenvolvedores do Mercado Pago
// (notificação do tópico subscription_preapproval) — diferente do webhook de
// pagamentos, aqui não há notification_url por requisição, porque a API de
// preapproval não aceita esse campo na criação.
@Controller('assinaturas')
export class AssinaturasWebhookController {
  constructor(private readonly assinaturasService: AssinaturasService) {}

  @SkipThrottle()
  @HttpCode(200)
  @Post('webhook')
  async webhook(
    @Query('data.id') dataId: string,
    @Headers('x-signature') xSignature: string,
    @Headers('x-request-id') xRequestId: string,
  ) {
    await this.assinaturasService.processarWebhookAssinatura({
      dataId,
      xSignature,
      xRequestId,
    });
    return { recebido: true };
  }
}
