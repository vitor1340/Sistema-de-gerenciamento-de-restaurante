import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { TipoEntrega } from '../../../generated/prisma/client';
import { ItemPedidoPublicoDto } from './item-pedido-publico.dto';

const TIPOS_ENTREGA_PUBLICOS = [
  TipoEntrega.DELIVERY,
  TipoEntrega.RETIRADA,
] as const;

export class CriarPedidoPublicoDto {
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  clienteNome!: string;

  @IsIn(TIPOS_ENTREGA_PUBLICOS)
  tipoEntrega!: TipoEntrega;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemPedidoPublicoDto)
  itens!: ItemPedidoPublicoDto[];

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(100)
  chaveIdempotencia?: string;
}
