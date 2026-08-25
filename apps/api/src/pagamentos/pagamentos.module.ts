import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PedidosModule } from '../pedidos/pedidos.module';
import { MercadoPagoClient } from './mercado-pago.client';
import { PagamentosController } from './pagamentos.controller';
import { PagamentosService } from './pagamentos.service';
import { PagamentosWebhookController } from './pagamentos-webhook.controller';

@Module({
  imports: [AuthModule, PedidosModule],
  controllers: [PagamentosController, PagamentosWebhookController],
  providers: [PagamentosService, MercadoPagoClient],
  exports: [PagamentosService],
})
export class PagamentosModule {}
