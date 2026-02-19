"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const review_entity_1 = require("./entities/review.entity");
const missions_service_1 = require("../missions/missions.service");
const mission_status_enum_1 = require("../common/enums/mission-status.enum");
let ReviewsService = class ReviewsService {
    constructor(reviewRepo, missionsService) {
        this.reviewRepo = reviewRepo;
        this.missionsService = missionsService;
    }
    async create(clientId, dto) {
        const mission = await this.missionsService.findById(dto.missionId);
        if (!mission)
            throw new common_1.NotFoundException('Mission not found');
        if (mission.status !== mission_status_enum_1.MissionStatus.COMPLETED) {
            throw new common_1.BadRequestException('Can only review completed missions');
        }
        if (mission.clientId !== clientId) {
            throw new common_1.ForbiddenException('Only the mission client can leave a review');
        }
        const existing = await this.reviewRepo.findOne({
            where: { missionId: dto.missionId },
        });
        if (existing) {
            throw new common_1.BadRequestException('Review already exists for this mission');
        }
        if (!mission.vendeurId) {
            throw new common_1.BadRequestException('No vendeur assigned to this mission');
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
    async findByVendeur(vendeurId) {
        return this.reviewRepo.find({
            where: { vendeurId, isVisible: true },
            order: { createdAt: 'DESC' },
        });
    }
    async getAverageRating(vendeurId) {
        const reviews = await this.findByVendeur(vendeurId);
        if (reviews.length === 0)
            return { average: 0, count: 0 };
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return { average: sum / reviews.length, count: reviews.length };
    }
    async toggleVisibility(reviewId) {
        const review = await this.reviewRepo.findOne({ where: { id: reviewId } });
        if (!review)
            throw new common_1.NotFoundException('Review not found');
        review.isVisible = !review.isVisible;
        return this.reviewRepo.save(review);
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        missions_service_1.MissionsService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map