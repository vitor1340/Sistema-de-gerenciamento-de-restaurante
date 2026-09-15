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

  // null explícito = desvincular (produto fica sem categoria); ausente =
  // não mexe; @IsOptional() do class-validator já trata null como "sem
  // validar", então um UUID inválido continua sendo barrado normalmente.
  @IsOptional()
  @IsUUID()
  categoriaId?: string | null;

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
