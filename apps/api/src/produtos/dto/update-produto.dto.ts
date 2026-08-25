import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateProdutoDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  nome?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descricao?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  precoCentavos?: number;

  @IsOptional()
  @IsUUID()
  categoriaId?: string;

  @IsOptional()
  @IsUrl()
  imagemUrl?: string;

  @IsOptional()
  @IsBoolean()
  disponivel?: boolean;

  @IsOptional()
  @IsBoolean()
  destaque?: boolean;
}
