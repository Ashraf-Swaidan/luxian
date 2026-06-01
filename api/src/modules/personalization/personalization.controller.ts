import { Body, Controller, Get, Headers, Post, Query } from '@nestjs/common';
import { parseVisitorId, VisitorId } from 'src/common/decorators/visitor-id.decorator';
import { CreateVisitorEventDto } from './dto/create-visitor-event.dto';
import { RecommendationsQueryDto } from './dto/recommendations-query.dto';
import { PersonalizationService } from './personalization.service';

@Controller('personalization')
export class PersonalizationController {
  constructor(private readonly personalizationService: PersonalizationService) {}

  @Post('events')
  recordEvent(@Body() dto: CreateVisitorEventDto) {
    return this.personalizationService.recordEvent(dto);
  }

  @Get('recommendations')
  getRecommendations(
    @VisitorId() visitorId: string | undefined,
    @Headers('x-visitor-id') headerVisitorId: string | undefined,
    @Query() query: RecommendationsQueryDto,
  ) {
    const id = visitorId ?? parseVisitorId(headerVisitorId);
    if (!id) {
      return [];
    }
    return this.personalizationService.getRecommendations(id, query.limit);
  }
}
