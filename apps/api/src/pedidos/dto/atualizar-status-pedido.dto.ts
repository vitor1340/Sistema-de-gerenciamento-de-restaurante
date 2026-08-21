import { IsEnum } from 'class-validator';
import { StatusPedido } from '../../../generated/prisma/client';

export class AtualizarStatusPedidoDto {
  @IsEnum(StatusPedido)
  status!: StatusPedido;
}
