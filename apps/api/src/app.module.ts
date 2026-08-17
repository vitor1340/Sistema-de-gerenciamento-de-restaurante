import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RestaurantesModule } from './restaurantes/restaurantes.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PedidosModule } from './pedidos/pedidos.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    RestaurantesModule,
    DashboardModule,
    PedidosModule,
  ],
})
export class AppModule {}
