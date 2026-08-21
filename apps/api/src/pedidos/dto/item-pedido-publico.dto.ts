import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class ItemPedidoPublicoDto {
  @IsUUID()
  produtoId!: string;

  @IsInt()
  @Min(1)
  quantidade!: number;

  @IsOptional()
  @IsString()
  observacao?: string;
}
