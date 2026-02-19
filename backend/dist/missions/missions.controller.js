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
exports.MissionsController = void 0;
const common_1 = require("@nestjs/common");
const missions_service_1 = require("./missions.service");
const create_mission_dto_1 = require("./dto/create-mission.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_role_enum_1 = require("../common/enums/user-role.enum");
const user_entity_1 = require("../users/entities/user.entity");
const subscription_plan_enum_1 = require("../common/enums/subscription-plan.enum");
let MissionsController = class MissionsController {
    constructor(missionsService) {
        this.missionsService = missionsService;
    }
    async create(user, dto) {
        const plan = subscription_plan_enum_1.SubscriptionPlan.BASIC;
        const mission = await this.missionsService.create(user.id, dto, plan);
        return { data: mission };
    }
    async getMyMissions(user) {
        const missions = user.role === user_role_enum_1.UserRole.VENDEUR
            ? await this.missionsService.findByVendeurId(user.id)
            : await this.missionsService.findByClientId(user.id);
        return { data: missions };
    }
    async getAvailable(user) {
        const missions = await this.missionsService.findAvailableForVendeur(user.zones, user.categories);
        return {
            data: missions.map((m) => ({
                id: m.id,
                date: m.date,
                startTime: m.startTime,
                durationHours: m.durationHours,
                city: m.city,
                category: m.category,
                volume: m.volume,
                totalPrice: m.totalPrice,
                status: m.status,
            })),
        };
    }
    async findOne(id, user) {
        const mission = await this.missionsService.findById(id);
        if (!mission)
            return { data: null };
        if (user.role === user_role_enum_1.UserRole.VENDEUR) {
            return {
                data: {
                    id: mission.id,
                    date: mission.date,
                    startTime: mission.startTime,
                    durationHours: mission.durationHours,
                    address: mission.address,
                    city: mission.city,
                    category: mission.category,
                    volume: mission.volume,
                    status: mission.status,
                    totalPrice: mission.totalPrice,
                },
            };
        }
        return { data: mission };
    }
    async acceptMission(id, user) {
        const mission = await this.missionsService.assignVendeur(id, user.id);
        return { data: mission };
    }
    async completeMission(id, user) {
        const mission = await this.missionsService.markCompleted(id, user.id);
        return { data: mission };
    }
};
exports.MissionsController = MissionsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.CLIENT),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, create_mission_dto_1.CreateMissionDto]),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('my'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.CLIENT, user_role_enum_1.UserRole.VENDEUR),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "getMyMissions", null);
__decorate([
    (0, common_1.Get)('available'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.VENDEUR),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "getAvailable", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/accept'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.VENDEUR),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "acceptMission", null);
__decorate([
    (0, common_1.Patch)(':id/complete'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.VENDEUR),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], MissionsController.prototype, "completeMission", null);
exports.MissionsController = MissionsController = __decorate([
    (0, common_1.Controller)('missions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [missions_service_1.MissionsService])
], MissionsController);
//# sourceMappingURL=missions.controller.js.map