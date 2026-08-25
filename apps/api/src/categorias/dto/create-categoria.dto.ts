import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  @MinLength(1)
  @MaxLength(60)
  nome!: string;

  @IsOptional()
  @IsInt()
  ordem?: number;
}
