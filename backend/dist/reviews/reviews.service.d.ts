import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { MissionsService } from '../missions/missions.service';
export declare class ReviewsService {
    private readonly reviewRepo;
    private readonly missionsService;
    constructor(reviewRepo: Repository<Review>, missionsService: MissionsService);
    create(clientId: string, dto: CreateReviewDto): Promise<Review>;
    findByVendeur(vendeurId: string): Promise<Review[]>;
    getAverageRating(vendeurId: string): Promise<{
        average: number;
        count: number;
    }>;
    toggleVisibility(reviewId: string): Promise<Review>;
}
