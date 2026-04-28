import { Body, Controller, Get, Headers, Param, Patch, Query } from '@nestjs/common';
import { ParticipantDashboardService } from './participant-dashboard.service';

@Controller('participants')
export class ParticipantDashboardController {
  constructor(private readonly participants: ParticipantDashboardService) {}

  @Get('me/dashboard')
  me(@Headers('x-user-id') userId: string) {
    return this.participants.getByUser(userId);
  }

  @Get('by-email/dashboard')
  byEmail(@Query('correo') correo: string) {
    return this.participants.getByCorreo(correo);
  }

  @Get(':participantId/dashboard')
  get(@Param('participantId') participantId: string) {
    return this.participants.getById(Number(participantId));
  }

  @Patch(':participantId')
  update(
    @Param('participantId') participantId: string,
    @Body() dto: { nombre?: string; correo?: string; rol?: string | null }
  ) {
    return this.participants.update(Number(participantId), dto);
  }
}
