import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateCategoriaDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  nome?: string;

  @IsOptional()
  @IsInt()
  ordem?: number;

  @IsOptional()
  @IsBoolean()
  ativa?: boolean;
}
