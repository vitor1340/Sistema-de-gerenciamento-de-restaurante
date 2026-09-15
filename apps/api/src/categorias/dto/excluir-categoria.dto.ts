import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

// Sem nenhum dos dois campos: se a categoria tiver produtos vinculados, o
// service recusa (409) pedindo pra decidir um dos dois — nunca apaga
// produtos em cascata silenciosamente.
export class ExcluirCategoriaDto {
  @IsOptional()
  @IsUUID()
  moverProdutosParaCategoriaId?: string;

  @IsOptional()
  @IsBoolean()
  desvincularProdutos?: boolean;
}
