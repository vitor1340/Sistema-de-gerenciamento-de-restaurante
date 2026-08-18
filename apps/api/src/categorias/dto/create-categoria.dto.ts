import { IsInt, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateCategoriaDto {
  @IsString()
  @MinLength(1)
  nome!: string;

  @IsOptional()
  @IsInt()
  ordem?: number;
}
