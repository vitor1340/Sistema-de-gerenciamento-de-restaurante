import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async enviarImagemProduto(arquivo: Express.Multer.File): Promise<string> {
    const resultado = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'comandai/produtos', resource_type: 'image' },
        (erro, resultado) => {
          if (erro || !resultado) {
            reject(erro ?? new Error('Falha ao enviar imagem'));
            return;
          }
          resolve(resultado);
        },
      );
      stream.end(arquivo.buffer);
    });

    return resultado.secure_url;
  }
}
