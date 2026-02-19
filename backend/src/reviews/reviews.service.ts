import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { MissionsService } from '../missions/missions.service';
import { MissionStatus } from '../common/enums/mission-status.enum';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>,
    private readonly missionsService: MissionsService,
  ) {}

  async create(clientId: string, dto: CreateReviewDto): Promise<Review> {
    const mission = await this.missionsService.findById(dto.missionId);
    if (!mission) throw new NotFoundException('Mission not found');
    if (mission.status !== MissionStatus.COMPLETED) {
      throw new BadRequestException('Can only review completed missions');
    }
    if (mission.clientId !== clientId) {
      throw new ForbiddenException('Only the mission client can leave a review');
    }

    const existing = await this.reviewRepo.findOne({
      where: { missionId: dto.missionId },
    });
    if (existing) {
      throw new BadRequestException('Review already exists for this mission');
    }

    if (!mission.vendeurId) {
      throw new BadRequestException('No vendeur assigned to this mission');
    }

    const review = this.reviewRepo.create({
      missionId: dto.missionId,
      clientId,
      vendeurId: mission.vendeurId,
      rating: dto.rating,
      comment: dto.comment ?? null,
    });

    return this.reviewRepo.save(review);
  }

  async findByVendeur(vendeurId: string): Promise<Review[]> {
    return this.reviewRepo.find({
      where: { vendeurId, isVisible: true },
      order: { createdAt: 'DESC' },
    });
  }

  async getAverageRating(
    vendeurId: string,
  ): Promise<{ average: number; count: number }> {
    const reviews = await this.findByVendeur(vendeurId);
    if (reviews.length === 0) return { average: 0, count: 0 };
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return { average: sum / reviews.length, count: reviews.length };
  }

  async toggleVisibility(reviewId: string): Promise<Review> {
    const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    review.isVisible = !review.isVisible;
    return this.reviewRepo.save(review);
  }
}
