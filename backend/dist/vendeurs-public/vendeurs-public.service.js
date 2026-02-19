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
exports.VendeursPublicService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscriptions_service_1 = require("../subscriptions/subscriptions.service");
const subscription_plan_enum_1 = require("../common/enums/subscription-plan.enum");
const user_role_enum_1 = require("../common/enums/user-role.enum");
let VendeursPublicService = class VendeursPublicService {
    constructor(dataSource, subscriptionsService) {
        this.dataSource = dataSource;
        this.subscriptionsService = subscriptionsService;
    }
    async findAll(query, requestingUserId) {
        const page = query.page ?? 1;
        const limit = Math.min(query.limit ?? 20, 100);
        const skip = (page - 1) * limit;
        const canSeeStar = await this.userHasProPlan(requestingUserId);
        const qb = this.dataSource
            .createQueryBuilder()
            .select([
            'u.id AS id',
            'u.first_name AS first_name',
            'u.last_name AS last_name',
            'u.avatar_url AS avatar_url',
            'u.bio AS bio',
            'u.zones AS zones',
            'u.categories AS categories',
            'u.level AS level',
            'u.is_star AS is_star',
            'ROUND(COALESCE(AVG(r.rating), 0)::numeric, 1) AS rating_avg',
            'COUNT(DISTINCT m.id) AS missions_count',
            'COUNT(*) OVER() AS total_count',
        ])
            .from('users', 'u')
            .leftJoin('reviews', 'r', 'r.vendeur_id = u.id AND r.is_visible = true')
            .leftJoin('missions', 'm', "m.vendeur_id = u.id AND m.status = 'completed'")
            .where('u.is_validated = true')
            .andWhere('u.role = :role', { role: user_role_enum_1.UserRole.VENDEUR });
        if (!canSeeStar) {
            qb.andWhere('u.is_star = false');
        }
        if (query.categories) {
            const cats = query.categories.split(',').map((c) => c.trim());
            qb.andWhere('u.categories && ARRAY[:...cats]::text[]', { cats });
        }
        if (query.zones) {
            const zones = query.zones.split(',').map((z) => z.trim());
            qb.andWhere('u.zones && ARRAY[:...zones]::text[]', { zones });
        }
        if (query.level) {
            const levels = query.level.split(',').map((l) => l.trim());
            qb.andWhere('u.level IN (:...levels)', { levels });
        }
        qb.groupBy('u.id');
        if (query.minRating !== undefined && query.minRating > 0) {
            qb.having('ROUND(COALESCE(AVG(r.rating), 0)::numeric, 1) >= :minRating', { minRating: query.minRating });
        }
        switch (query.sort) {
            case 'rating_desc':
                qb.orderBy('rating_avg', 'DESC').addOrderBy('u.first_name', 'ASC');
                break;
            case 'missions_desc':
                qb.orderBy('missions_count', 'DESC').addOrderBy('u.first_name', 'ASC');
                break;
            default:
                qb.orderBy('u.first_name', 'ASC');
                break;
        }
        qb.offset(skip).limit(limit);
        const rows = await qb.getRawMany();
        const total = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;
        const data = rows.map((row) => this.toPublicItem(row, parseFloat(row.rating_avg ?? '0'), parseInt(row.missions_count, 10), true));
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id, requestingUserId) {
        const canSeeStar = await this.userHasProPlan(requestingUserId);
        const qb = this.dataSource
            .createQueryBuilder()
            .select([
            'u.id AS id',
            'u.first_name AS first_name',
            'u.last_name AS last_name',
            'u.avatar_url AS avatar_url',
            'u.bio AS bio',
            'u.zones AS zones',
            'u.categories AS categories',
            'u.level AS level',
            'u.is_star AS is_star',
            'ROUND(COALESCE(AVG(r.rating), 0)::numeric, 1) AS rating_avg',
            'COUNT(DISTINCT m.id) AS missions_count',
            'COUNT(*) OVER() AS total_count',
        ])
            .from('users', 'u')
            .leftJoin('reviews', 'r', 'r.vendeur_id = u.id AND r.is_visible = true')
            .leftJoin('missions', 'm', "m.vendeur_id = u.id AND m.status = 'completed'")
            .where('u.id = :id', { id })
            .andWhere('u.is_validated = true')
            .andWhere('u.role = :role', { role: user_role_enum_1.UserRole.VENDEUR })
            .groupBy('u.id');
        const rows = await qb.getRawMany();
        if (rows.length === 0) {
            throw new common_1.NotFoundException(`Vendeur with id "${id}" not found`);
        }
        const row = rows[0];
        if (row.is_star && !canSeeStar) {
            throw new common_1.NotFoundException(`Vendeur with id "${id}" not found`);
        }
        const reviews = await this.getVisibleReviews(id);
        const item = this.toPublicItem(row, parseFloat(row.rating_avg ?? '0'), parseInt(row.missions_count, 10), false);
        return { ...item, reviews };
    }
    async getVisibleReviews(vendeurId) {
        const rows = await this.dataSource
            .createQueryBuilder()
            .select([
            'r.rating AS rating',
            'r.comment AS comment',
            'u.first_name AS client_first_name',
            'r.created_at AS created_at',
        ])
            .from('reviews', 'r')
            .innerJoin('users', 'u', 'u.id = r.client_id')
            .where('r.vendeur_id = :vendeurId', { vendeurId })
            .andWhere('r.is_visible = true')
            .orderBy('r.created_at', 'DESC')
            .getRawMany();
        return rows.map((r) => ({
            rating: parseInt(String(r.rating), 10),
            comment: r.comment ?? null,
            clientFirstName: r.client_first_name,
            createdAt: r.created_at,
        }));
    }
    toPublicItem(row, ratingAvg, missionsCount, truncateBio) {
        const lastNameInitial = row.last_name && row.last_name.length > 0
            ? `${row.last_name[0].toUpperCase()}.`
            : '';
        let bio = row.bio ?? null;
        if (truncateBio && bio && bio.length > 150) {
            bio = bio.substring(0, 150);
        }
        return {
            id: row.id,
            firstName: row.first_name,
            lastNameInitial,
            avatarUrl: row.avatar_url ?? null,
            bio,
            zones: row.zones ?? [],
            categories: row.categories ?? [],
            level: row.level ?? null,
            isStar: row.is_star,
            ratingAvg,
            missionsCount,
        };
    }
    async userHasProPlan(userId) {
        const subscription = await this.subscriptionsService.findActiveByUserId(userId);
        return subscription?.plan === subscription_plan_enum_1.SubscriptionPlan.PRO;
    }
};
exports.VendeursPublicService = VendeursPublicService;
exports.VendeursPublicService = VendeursPublicService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        subscriptions_service_1.SubscriptionsService])
], VendeursPublicService);
//# sourceMappingURL=vendeurs-public.service.js.map