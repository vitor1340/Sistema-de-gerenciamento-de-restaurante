import { IsNotEmpty, IsString } from 'class-validator';

export class Desativar2faDto {
  @IsString()
  @IsNotEmpty()
  senha!: string;
}
