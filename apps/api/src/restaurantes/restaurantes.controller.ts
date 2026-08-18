import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.types';
import { UpdateRestauranteDto } from './dto/update-restaurante.dto';
import { RestaurantesService } from './restaurantes.service';

@UseGuards(JwtAuthGuard)
@Controller('restaurantes')
export class RestaurantesController {
  constructor(private readonly restaurantesService: RestaurantesService) {}

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.restaurantesService.me(user.restauranteId);
  }

  @Patch('me')
  atualizar(@CurrentUser() user: AuthenticatedUser, @Body() dto: UpdateRestauranteDto) {
    return this.restaurantesService.atualizar(user.restauranteId, dto);
  }
}
