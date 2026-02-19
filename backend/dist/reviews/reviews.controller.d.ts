import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { User } from '../users/entities/user.entity';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    create(user: User, dto: CreateReviewDto): Promise<{
        data: import("./entities/review.entity").Review;
    }>;
    getByVendeur(vendeurId: string): Promise<{
        data: import("./entities/review.entity").Review[];
        meta: {
            average: number;
            count: number;
        };
    }>;
}
