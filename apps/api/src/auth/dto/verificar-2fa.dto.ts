import { IsNotEmpty, IsString } from 'class-validator';

export class Verificar2faDto {
  @IsString()
  @IsNotEmpty()
  tempToken!: string;

  @IsString()
  @IsNotEmpty()
  codigo!: string;
}
