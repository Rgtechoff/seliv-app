import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { VendeursQueryDto } from './dto/vendeurs-query.dto';
import { SubscriptionsService } from '../subscriptions/subscriptions.service';
import { SubscriptionPlan } from '../common/enums/subscription-plan.enum';
import { VendorLevel } from '../common/enums/vendor-level.enum';
import { UserRole } from '../common/enums/user-role.enum';

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

interface RawVendeurRow {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  bio: string | null;
  zones: string[];
  categories: string[];
  level: VendorLevel | null;
  is_star: boolean;
  rating_avg: string | null;
  missions_count: string;
  total_count: string;
}

interface RawReviewRow {
  rating: string;
  comment: string | null;
  client_first_name: string;
  created_at: string;
}

@Injectable()
export class VendeursPublicService {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async findAll(
    query: VendeursQueryDto,
    requestingUserId: string | null,
  ): Promise<ListResponse> {
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
      .leftJoin(
        'reviews',
        'r',
        'r.vendeur_id = u.id AND r.is_visible = true',
      )
      .leftJoin(
        'missions',
        'm',
        "m.vendeur_id = u.id AND m.status = 'completed'",
      )
      .where('u.is_validated = true')
      .andWhere('u.role = :role', { role: UserRole.VENDEUR });

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
      qb.having(
        'ROUND(COALESCE(AVG(r.rating), 0)::numeric, 1) >= :minRating',
        { minRating: query.minRating },
      );
    }

    switch (query.sort) {
      case 'missions':
        qb.orderBy('missions_count', 'DESC').addOrderBy('u.first_name', 'ASC');
        break;
      case 'recent':
        qb.orderBy('u.created_at', 'DESC');
        break;
      default: // 'rating' or undefined
        qb.orderBy('rating_avg', 'DESC').addOrderBy('u.first_name', 'ASC');
        break;
    }

    qb.offset(skip).limit(limit);

    const rows = await qb.getRawMany<RawVendeurRow>();

    const total = rows.length > 0 ? parseInt(rows[0].total_count, 10) : 0;

    const data = rows.map((row) =>
      this.toPublicItem(row, parseFloat(row.rating_avg ?? '0'), parseInt(row.missions_count, 10), true),
    );

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

  async findOne(
    id: string,
    requestingUserId: string | null,
  ): Promise<VendeurPublicDetail> {
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
      .leftJoin(
        'reviews',
        'r',
        'r.vendeur_id = u.id AND r.is_visible = true',
      )
      .leftJoin(
        'missions',
        'm',
        "m.vendeur_id = u.id AND m.status = 'completed'",
      )
      .where('u.id = :id', { id })
      .andWhere('u.is_validated = true')
      .andWhere('u.role = :role', { role: UserRole.VENDEUR })
      .groupBy('u.id');

    const rows = await qb.getRawMany<RawVendeurRow>();

    if (rows.length === 0) {
      throw new NotFoundException(`Vendeur with id "${id}" not found`);
    }

    const row = rows[0];

    if (row.is_star && !canSeeStar) {
      throw new NotFoundException(`Vendeur with id "${id}" not found`);
    }

    const reviews = await this.getVisibleReviews(id);

    const item = this.toPublicItem(
      row,
      parseFloat(row.rating_avg ?? '0'),
      parseInt(row.missions_count, 10),
      false,
    );

    return { ...item, reviews };
  }

  private async getVisibleReviews(vendeurId: string): Promise<ReviewPublic[]> {
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
      .getRawMany<RawReviewRow>();

    return rows.map((r) => ({
      rating: parseInt(String(r.rating), 10),
      comment: r.comment ?? null,
      clientFirstName: r.client_first_name,
      createdAt: r.created_at,
    }));
  }

  private toPublicItem(
    row: RawVendeurRow,
    ratingAvg: number,
    missionsCount: number,
    truncateBio: boolean,
  ): VendeurPublicItem {
    const lastNameInitial =
      row.last_name && row.last_name.length > 0
        ? `${row.last_name[0].toUpperCase()}.`
        : '';

    let bio: string | null = row.bio ?? null;
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

  private async userHasProPlan(userId: string | null): Promise<boolean> {
    if (!userId) return false;
    const subscription =
      await this.subscriptionsService.findActiveByUserId(userId);
    return subscription?.plan === SubscriptionPlan.PRO;
  }
}
