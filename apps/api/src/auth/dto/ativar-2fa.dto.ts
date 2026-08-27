import { IsNotEmpty, IsString } from 'class-validator';

export class Ativar2faDto {
  @IsString()
  @IsNotEmpty()
  codigo!: string;
}
