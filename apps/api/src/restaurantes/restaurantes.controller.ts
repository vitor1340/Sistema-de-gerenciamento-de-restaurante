import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.types';
import { PlanoAtivoGuard } from './plano-ativo.guard';
import { UpdateRestauranteDto } from './dto/update-restaurante.dto';
import { RestaurantesService } from './restaurantes.service';

@UseGuards(JwtAuthGuard)
@Controller('restaurantes')
export class RestaurantesController {
  constructor(private readonly restaurantesService: RestaurantesService) {}

  // Sem PlanoAtivoGuard de propósito: é a rota que o frontend consulta pra
  // SABER se o plano expirou (guard de layout, banner de teste), então
  // precisa continuar acessível mesmo com o teste vencido.
  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.restaurantesService.me(user.restauranteId);
  }

  @UseGuards(PlanoAtivoGuard)
  @Patch('me')
  atualizar(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateRestauranteDto,
  ) {
    return this.restaurantesService.atualizar(user.restauranteId, dto);
  }
}
