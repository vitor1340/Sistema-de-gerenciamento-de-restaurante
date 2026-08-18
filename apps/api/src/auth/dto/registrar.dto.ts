import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegistrarDto {
  @IsString()
  @MinLength(2)
  nomeRestaurante!: string;

  @IsString()
  @MinLength(2)
  nomeDono!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  senha!: string;
}
