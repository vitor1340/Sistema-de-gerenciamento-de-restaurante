import { IsEnum } from 'class-validator';
import { FaixaAssinatura } from '../../../generated/prisma/client';

export class IniciarAssinaturaDto {
  @IsEnum(FaixaAssinatura)
  faixa: FaixaAssinatura;
}
