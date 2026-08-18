import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadService } from './upload.service';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const TAMANHO_MAXIMO_BYTES = 5 * 1024 * 1024;

@UseGuards(JwtAuthGuard)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('produto-imagem')
  @UseInterceptors(
    FileInterceptor('arquivo', { limits: { fileSize: TAMANHO_MAXIMO_BYTES } }),
  )
  async enviarImagemProduto(@UploadedFile() arquivo?: Express.Multer.File) {
    if (!arquivo) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }
    if (!TIPOS_PERMITIDOS.includes(arquivo.mimetype)) {
      throw new BadRequestException(
        'Formato de imagem não suportado. Use JPEG, PNG ou WEBP.',
      );
    }

    const url = await this.uploadService.enviarImagemProduto(arquivo);
    return { url };
  }
}
