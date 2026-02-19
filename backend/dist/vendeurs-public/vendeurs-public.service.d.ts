import { DataSource } from 'typeorm';
import { VendeursQueryDto } from './dto/vendeurs-query.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { VendorLevel } from '../common/enums/vendor-level.enum';
export interface VendeurPublicItem {
    id: string;
    firstName: string;
    lastNameInitial: string;
    avatarUrl: string | null;
    bio: string | null;
    zones: string[];
    categories: string[];
    level: VendorLevel | null;
    isStar: boolean;
    ratingAvg: number;
    missionsCount: number;
}
export interface ReviewPublic {
    rating: number;
    comment: string | null;
    clientFirstName: string;
    createdAt: string;
}
export interface VendeurPublicDetail extends VendeurPublicItem {
    reviews: ReviewPublic[];
}
export interface ListResponse {
    data: VendeurPublicItem[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
export declare class VendeursPublicService {
    private readonly dataSource;
    private readonly subscriptionsService;
    constructor(dataSource: DataSource, subscriptionsService: SubscriptionsService);
    findAll(query: VendeursQueryDto, requestingUserId: string): Promise<ListResponse>;
    findOne(id: string, requestingUserId: string): Promise<VendeurPublicDetail>;
    private getVisibleReviews;
    private toPublicItem;
    private userHasProPlan;
}
