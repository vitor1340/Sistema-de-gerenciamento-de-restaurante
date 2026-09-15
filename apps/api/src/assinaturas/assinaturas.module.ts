import { Module } from '@nestjs/common';
import { PagamentosModule } from '../pagamentos/pagamentos.module';
import { AssinaturasController } from './assinaturas.controller';
import { AssinaturasService } from './assinaturas.service';
import { AssinaturasWebhookController } from './assinaturas-webhook.controller';

@Module({
  imports: [PagamentosModule],
  controllers: [AssinaturasController, AssinaturasWebhookController],
  providers: [AssinaturasService],
})
export class AssinaturasModule {}
