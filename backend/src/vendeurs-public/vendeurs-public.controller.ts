import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { VendeursPublicService, ListResponse, VendeurPublicDetail } from './vendeurs-public.service';
import { VendeursQueryDto } from './dto/vendeurs-query.dto';

@Controller('vendeurs-public')
@UseGuards(OptionalJwtAuthGuard)
export class VendeursPublicController {
  constructor(private readonly vendeursPublicService: VendeursPublicService) {}

  @Get()
  async findAll(
    @Query() query: VendeursQueryDto,
    @CurrentUser() user: User | null,
  ): Promise<ListResponse> {
    return this.vendeursPublicService.findAll(query, user?.id ?? null);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User | null,
  ): Promise<VendeurPublicDetail> {
    return this.vendeursPublicService.findOne(id, user?.id ?? null);
  }
}
