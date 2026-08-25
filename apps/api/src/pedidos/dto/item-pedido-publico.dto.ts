import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class ItemPedidoPublicoDto {
  @IsUUID()
  produtoId!: string;

  @IsInt()
  @Min(1)
  @Max(50)
  quantidade!: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  observacao?: string;
}
