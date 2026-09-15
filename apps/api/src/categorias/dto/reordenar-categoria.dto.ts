import { IsIn } from 'class-validator';

export class ReordenarCategoriaDto {
  @IsIn(['CIMA', 'BAIXO'])
  direcao!: 'CIMA' | 'BAIXO';
}
