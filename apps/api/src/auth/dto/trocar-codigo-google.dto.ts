import { IsNotEmpty, IsString } from 'class-validator';

export class TrocarCodigoGoogleDto {
  @IsString()
  @IsNotEmpty()
  codigo!: string;
}
