import { Controller, Get, Param } from '@nestjs/common';
import { LojaService } from './loja.service';

@Controller('loja')
export class LojaController {
  constructor(private readonly lojaService: LojaService) {}

  @Get(':slug')
  buscarPorSlug(@Param('slug') slug: string) {
    return this.lojaService.buscarPorSlug(slug);
  }
}
