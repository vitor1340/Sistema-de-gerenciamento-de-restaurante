import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RestaurantesModule } from './restaurantes/restaurantes.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { CategoriasModule } from './categorias/categorias.module';
import { ProdutosModule } from './produtos/produtos.module';
import { UploadModule } from './upload/upload.module';
import { LojaModule } from './loja/loja.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    RestaurantesModule,
    DashboardModule,
    PedidosModule,
    CategoriasModule,
    ProdutosModule,
    UploadModule,
    LojaModule,
  ],
})
export class AppModule {}
