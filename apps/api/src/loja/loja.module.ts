import { Module } from '@nestjs/common';
import { PagamentosModule } from '../pagamentos/pagamentos.module';
import { PedidosModule } from '../pedidos/pedidos.module';
import { LojaController } from './loja.controller';
import { LojaService } from './loja.service';

@Module({
  imports: [PedidosModule, PagamentosModule],
  controllers: [LojaController],
  providers: [LojaService],
})
export class LojaModule {}
