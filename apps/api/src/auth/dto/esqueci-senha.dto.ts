import { IsEmail } from 'class-validator';

export class EsqueciSenhaDto {
  @IsEmail()
  email!: string;
}
