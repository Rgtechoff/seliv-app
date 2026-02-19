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
exports.MissionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const mission_entity_1 = require("./entities/mission.entity");
const mission_option_entity_1 = require("./entities/mission-option.entity");
const mission_status_enum_1 = require("../common/enums/mission-status.enum");
const pricing_service_1 = require("./pricing.service");
const ALLOWED_TRANSITIONS = {
    [mission_status_enum_1.MissionStatus.DRAFT]: [mission_status_enum_1.MissionStatus.PENDING_PAYMENT, mission_status_enum_1.MissionStatus.CANCELLED],
    [mission_status_enum_1.MissionStatus.PENDING_PAYMENT]: [mission_status_enum_1.MissionStatus.PAID, mission_status_enum_1.MissionStatus.CANCELLED],
    [mission_status_enum_1.MissionStatus.PAID]: [mission_status_enum_1.MissionStatus.ASSIGNED, mission_status_enum_1.MissionStatus.CANCELLED],
    [mission_status_enum_1.MissionStatus.ASSIGNED]: [
        mission_status_enum_1.MissionStatus.IN_PROGRESS,
        mission_status_enum_1.MissionStatus.PAID,
        mission_status_enum_1.MissionStatus.CANCELLED,
    ],
    [mission_status_enum_1.MissionStatus.IN_PROGRESS]: [mission_status_enum_1.MissionStatus.COMPLETED],
    [mission_status_enum_1.MissionStatus.COMPLETED]: [],
    [mission_status_enum_1.MissionStatus.CANCELLED]: [],
};
let MissionsService = class MissionsService {
    constructor(missionRepo, optionRepo, pricingService) {
        this.missionRepo = missionRepo;
        this.optionRepo = optionRepo;
        this.pricingService = pricingService;
    }
    validateTransition(from, to) {
        if (!ALLOWED_TRANSITIONS[from].includes(to)) {
            throw new common_1.BadRequestException(`Cannot transition from ${from} to ${to}`);
        }
    }
    async create(clientId, dto, plan) {
        const missionDate = new Date(dto.date);
        const minDate = new Date();
        minDate.setDate(minDate.getDate() + 2);
        minDate.setHours(0, 0, 0, 0);
        if (missionDate < minDate) {
            throw new common_1.BadRequestException('Mission date must be at least 2 days in the future');
        }
        const optionPrices = dto.options.map((o) => o.price);
        const basePrice = this.pricingService.calculateBasePrice(dto.volume, dto.durationHours, plan);
        const discount = this.pricingService.getHourlyDiscount(plan) * dto.durationHours;
        const optionsPrice = optionPrices.reduce((s, p) => s + p, 0);
        const totalPrice = basePrice + optionsPrice;
        const mission = this.missionRepo.create({
            clientId,
            status: mission_status_enum_1.MissionStatus.DRAFT,
            date: missionDate,
            startTime: dto.startTime,
            durationHours: dto.durationHours,
            address: dto.address,
            city: dto.city,
            category: dto.category,
            volume: dto.volume,
            basePrice,
            optionsPrice,
            discount,
            totalPrice,
        });
        const saved = await this.missionRepo.save(mission);
        if (dto.options.length > 0) {
            const options = dto.options.map((o) => this.optionRepo.create({
                missionId: saved.id,
                optionType: o.optionType,
                optionDetail: o.optionDetail ?? null,
                price: o.price,
            }));
            await this.optionRepo.save(options);
        }
        return saved;
    }
    async findById(id) {
        return this.missionRepo.findOne({
            where: { id },
            relations: ['client', 'vendeur'],
        });
    }
    async findByClientId(clientId) {
        return this.missionRepo.find({
            where: { clientId },
            order: { createdAt: 'DESC' },
        });
    }
    async findByVendeurId(vendeurId) {
        return this.missionRepo.find({
            where: { vendeurId },
            order: { createdAt: 'DESC' },
        });
    }
    async findAvailableForVendeur(zones, categories) {
        if (!zones.length || !categories.length)
            return [];
        return this.missionRepo
            .createQueryBuilder('m')
            .where('m.status = :status', { status: mission_status_enum_1.MissionStatus.PAID })
            .andWhere('m.city IN (:...zones)', { zones })
            .andWhere('m.category IN (:...categories)', { categories })
            .orderBy('m.date', 'ASC')
            .getMany();
    }
    async assignVendeur(missionId, vendeurId) {
        const mission = await this.findById(missionId);
        if (!mission)
            throw new common_1.NotFoundException(`Mission ${missionId} not found`);
        this.validateTransition(mission.status, mission_status_enum_1.MissionStatus.ASSIGNED);
        mission.vendeurId = vendeurId;
        mission.status = mission_status_enum_1.MissionStatus.ASSIGNED;
        return this.missionRepo.save(mission);
    }
    async markInProgress(missionId) {
        const mission = await this.findById(missionId);
        if (!mission)
            throw new common_1.NotFoundException(`Mission ${missionId} not found`);
        this.validateTransition(mission.status, mission_status_enum_1.MissionStatus.IN_PROGRESS);
        mission.status = mission_status_enum_1.MissionStatus.IN_PROGRESS;
        return this.missionRepo.save(mission);
    }
    async markCompleted(missionId, vendeurId) {
        const mission = await this.findById(missionId);
        if (!mission)
            throw new common_1.NotFoundException(`Mission ${missionId} not found`);
        if (mission.vendeurId !== vendeurId)
            throw new common_1.ForbiddenException();
        this.validateTransition(mission.status, mission_status_enum_1.MissionStatus.COMPLETED);
        mission.status = mission_status_enum_1.MissionStatus.COMPLETED;
        mission.completedAt = new Date();
        return this.missionRepo.save(mission);
    }
    async cancel(missionId, requesterId, reason) {
        const mission = await this.findById(missionId);
        if (!mission)
            throw new common_1.NotFoundException(`Mission ${missionId} not found`);
        if (mission.status === mission_status_enum_1.MissionStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Cannot cancel a mission in progress');
        }
        if (mission.clientId !== requesterId) {
            throw new common_1.ForbiddenException('Only the client can cancel their mission');
        }
        this.validateTransition(mission.status, mission_status_enum_1.MissionStatus.CANCELLED);
        const now = new Date();
        const missionDateTime = new Date(mission.date);
        const [hours, minutes] = mission.startTime.split(':').map(Number);
        missionDateTime.setHours(hours ?? 0, minutes ?? 0, 0, 0);
        const hoursUntilMission = (missionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        const refundPercent = hoursUntilMission >= 48 ? 100 : 50;
        mission.status = mission_status_enum_1.MissionStatus.CANCELLED;
        mission.cancelledAt = new Date();
        mission.cancellationReason = reason;
        const saved = await this.missionRepo.save(mission);
        return { mission: saved, refundPercent };
    }
    async updateStripeData(missionId, data) {
        await this.missionRepo.update(missionId, data);
    }
    async findAll() {
        return this.missionRepo.find({
            relations: ['client', 'vendeur'],
            order: { createdAt: 'DESC' },
        });
    }
};
exports.MissionsService = MissionsService;
exports.MissionsService = MissionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(mission_entity_1.Mission)),
    __param(1, (0, typeorm_1.InjectRepository)(mission_option_entity_1.MissionOption)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        pricing_service_1.PricingService])
], MissionsService);
//# sourceMappingURL=missions.service.js.map