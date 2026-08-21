import { Module } from '@nestjs/common';
import { PedidosModule } from '../pedidos/pedidos.module';
import { LojaController } from './loja.controller';
import { LojaService } from './loja.service';

@Module({
  imports: [PedidosModule],
  controllers: [LojaController],
  providers: [LojaService],
})
export class LojaModule {}
