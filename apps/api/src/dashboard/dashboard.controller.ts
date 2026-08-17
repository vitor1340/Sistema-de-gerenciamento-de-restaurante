import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/jwt.types';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  summary(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.summary(user.restauranteId, user.userId);
  }

  @Get('sales-performance')
  salesPerformance(
    @CurrentUser() user: AuthenticatedUser,
    @Query('dias') dias?: string,
  ) {
    const numeroDias = dias ? Number.parseInt(dias, 10) : 7;
    return this.dashboardService.salesPerformance(
      user.restauranteId,
      numeroDias,
    );
  }

  @Get('sales-channels')
  salesChannels(@CurrentUser() user: AuthenticatedUser) {
    return this.dashboardService.salesChannels(user.restauranteId);
  }
}
