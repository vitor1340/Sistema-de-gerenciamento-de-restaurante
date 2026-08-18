import { Module } from '@nestjs/common';
import { LojaController } from './loja.controller';
import { LojaService } from './loja.service';

@Module({
  controllers: [LojaController],
  providers: [LojaService],
})
export class LojaModule {}
