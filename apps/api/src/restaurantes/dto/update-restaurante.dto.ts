import { IsBoolean, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateRestauranteDto {
  @IsOptional()
  @IsString()
  @Matches(/^$|^\d{10,13}$/, {
    message: 'WhatsApp deve conter DDI + DDD + número, só números (ex: 5511999998888)',
  })
  whatsapp?: string;

  @IsOptional()
  @IsBoolean()
  aberto?: boolean;
}
