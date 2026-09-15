import { IsEnum } from 'class-validator';
import { FaixaAssinatura } from '../../../generated/prisma/client';

export class TrocarFaixaDto {
  @IsEnum(FaixaAssinatura)
  faixa: FaixaAssinatura;
}
