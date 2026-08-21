import { BadRequestException, Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import sharp from 'sharp';

const LADO_MAXIMO_PX = 1600;
const QUALIDADE_WEBP = 82;

@Injectable()
export class UploadService {
  private readonly supabase: ReturnType<typeof createClient>;
  private readonly bucket: string;

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL ?? '',
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? '',
    );
    this.bucket = process.env.SUPABASE_STORAGE_BUCKET ?? 'comandai';
  }

  async enviarImagemProduto(arquivo: Express.Multer.File): Promise<string> {
    return this.enviarImagem(arquivo, 'produtos');
  }

  async enviarImagemLoja(arquivo: Express.Multer.File): Promise<string> {
    return this.enviarImagem(arquivo, 'lojas');
  }

  private async enviarImagem(
    arquivo: Express.Multer.File,
    pasta: string,
  ): Promise<string> {
    // Normaliza qualquer formato de entrada (JPEG, PNG, HEIC compatível, TIFF, BMP, AVIF...)
    // pra WebP com tamanho/qualidade controlados, em vez de guardar o arquivo cru do
    // usuário — evita fotos gigantes de celular e formatos que o navegador não exibe.
    let buffer: Buffer;
    try {
      buffer = await sharp(arquivo.buffer)
        .rotate()
        .resize({
          width: LADO_MAXIMO_PX,
          height: LADO_MAXIMO_PX,
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: QUALIDADE_WEBP })
        .toBuffer();
    } catch {
      throw new BadRequestException(
        'Não foi possível processar essa imagem. Se for uma foto HEIC de iPhone, ' +
          'vá em Ajustes > Câmera > Formatos e escolha "Mais compatível", ou exporte a foto como JPEG antes de enviar.',
      );
    }

    const caminho = `${pasta}/${randomUUID()}.webp`;

    const { error } = await this.supabase.storage
      .from(this.bucket)
      .upload(caminho, buffer, {
        contentType: 'image/webp',
        upsert: false,
      });

    if (error) {
      throw new Error(
        `Falha ao enviar imagem para o Supabase Storage: ${error.message}`,
      );
    }

    const { data } = this.supabase.storage
      .from(this.bucket)
      .getPublicUrl(caminho);
    return data.publicUrl;
  }
}
