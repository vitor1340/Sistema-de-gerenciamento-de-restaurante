import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.types';
import { RestaurantesService } from './restaurantes.service';

@UseGuards(JwtAuthGuard)
@Controller('restaurantes')
export class RestaurantesController {
  constructor(private readonly restaurantesService: RestaurantesService) {}

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.restaurantesService.me(user.restauranteId);
  }
}
