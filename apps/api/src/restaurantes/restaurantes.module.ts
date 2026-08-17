import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RestaurantesController } from './restaurantes.controller';
import { RestaurantesService } from './restaurantes.service';

@Module({
  imports: [AuthModule],
  controllers: [RestaurantesController],
  providers: [RestaurantesService],
})
export class RestaurantesModule {}
