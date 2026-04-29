import { Body, Controller, Delete, Get, Headers, Param, Patch, Post } from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto, UpdateEventDto, UploadImageDto } from '../../shared/dto/event.dto';

@Controller('events')
export class EventController {
  constructor(private readonly events: EventService) {}

  @Get('public/options')
  publicOptions() {
    return this.events.listPublicOptions();
  }

  @Get()
  list(@Headers('x-user-id') userId: string) {
    return this.events.listByOrganizer(userId);
  }

  @Post()
  create(@Headers('x-user-id') userId: string, @Body() dto: CreateEventDto) {
    return this.events.create(userId, dto);
  }

  @Get(':eventId')
  get(@Param('eventId') eventId: string) {
    return this.events.get(Number(eventId));
  }

  @Patch(':eventId')
  update(@Param('eventId') eventId: string, @Body() dto: UpdateEventDto) {
    return this.events.update(Number(eventId), dto);
  }

  @Delete(':eventId')
  remove(@Param('eventId') eventId: string) {
    return this.events.delete(Number(eventId));
  }

  @Post(':eventId/image')
  uploadImage(
    @Headers('x-user-id') userId: string,
    @Param('eventId') eventId: string,
    @Body() dto: UploadImageDto
  ) {
    return this.events.uploadImage(Number(eventId), userId, dto.base64, dto.contentType, dto.extension);
  }
}
