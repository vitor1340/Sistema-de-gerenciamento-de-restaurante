import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TipoAtendimento } from '../../../generated/prisma/client';

export class UpdateRestauranteDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  nome?: string;

  @IsOptional()
  @IsString()
  @Matches(/^$|^\d{10,13}$/, {
    message:
      'WhatsApp deve conter DDI + DDD + número, só números (ex: 5511999998888)',
  })
  whatsapp?: string;

  @IsOptional()
  @IsBoolean()
  aberto?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  tagline?: string;

  @IsOptional()
  @IsString()
  @Matches(/^$|^https?:\/\//, { message: 'logoUrl deve ser uma URL válida' })
  logoUrl?: string;

  @IsOptional()
  @IsString()
  @Matches(/^$|^#[0-9a-fA-F]{6}$/, {
    message: 'corDestaque deve ser um hex válido (ex: #EB6834)',
  })
  corDestaque?: string;

  @IsOptional()
  @IsEnum(TipoAtendimento)
  tipoAtendimento?: TipoAtendimento;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  endereco?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  horarioFuncionamento?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @IsString({ each: true })
  @MaxLength(60, { each: true })
  diferenciais?: string[];
}
