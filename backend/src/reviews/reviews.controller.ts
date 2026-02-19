import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';
import { User } from '../users/entities/user.entity';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CLIENT)
  async create(@CurrentUser() user: User, @Body() dto: CreateReviewDto) {
    const review = await this.reviewsService.create(user.id, dto);
    return { data: review };
  }

  @Get('vendeur/:vendeurId')
  async getByVendeur(@Param('vendeurId', ParseUUIDPipe) vendeurId: string) {
    const reviews = await this.reviewsService.findByVendeur(vendeurId);
    const stats = await this.reviewsService.getAverageRating(vendeurId);
    return { data: reviews, meta: stats };
  }
}
