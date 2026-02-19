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
exports.AvailabilitiesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const availability_entity_1 = require("./entities/availability.entity");
let AvailabilitiesService = class AvailabilitiesService {
    constructor(repo) {
        this.repo = repo;
    }
    async findByUser(userId) {
        return this.repo.find({ where: { userId }, order: { dayOfWeek: 'ASC', startTime: 'ASC' } });
    }
    async upsert(userId, dto) {
        const avail = this.repo.create({ ...dto, userId });
        return this.repo.save(avail);
    }
    async remove(id, userId) {
        const avail = await this.repo.findOne({ where: { id } });
        if (!avail || avail.userId !== userId)
            throw new common_1.NotFoundException('Disponibilité introuvable');
        await this.repo.remove(avail);
    }
    async isVendeurAvailable(userId, date, startTime, durationHours) {
        const dayOfWeek = new Date(date).getDay();
        const [sh, sm] = startTime.split(':').map(Number);
        const endTotalMinutes = sh * 60 + sm + durationHours * 60;
        const endH = Math.floor(endTotalMinutes / 60);
        const endM = endTotalMinutes % 60;
        const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
        const specific = await this.repo.findOne({
            where: { userId, dateSpecific: new Date(date) },
        });
        if (specific)
            return specific.isAvailable;
        const recurring = await this.repo
            .createQueryBuilder('a')
            .where('a.userId = :userId', { userId })
            .andWhere('a.dayOfWeek = :dayOfWeek', { dayOfWeek })
            .andWhere('a.startTime <= :startTime', { startTime })
            .andWhere('a.endTime >= :endTime', { endTime })
            .andWhere('a.isAvailable = true')
            .getOne();
        return !!recurring;
    }
};
exports.AvailabilitiesService = AvailabilitiesService;
exports.AvailabilitiesService = AvailabilitiesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(availability_entity_1.Availability)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AvailabilitiesService);
//# sourceMappingURL=availabilities.service.js.map