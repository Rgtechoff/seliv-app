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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const user_role_enum_1 = require("../common/enums/user-role.enum");
const missions_service_1 = require("../missions/missions.service");
const users_service_1 = require("../users/users.service");
const chat_service_1 = require("../chat/chat.service");
const subscriptions_service_1 = require("../subscriptions/subscriptions.service");
const mission_status_enum_1 = require("../common/enums/mission-status.enum");
const class_validator_1 = require("class-validator");
class AdminAssignVendeurDto {
}
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], AdminAssignVendeurDto.prototype, "vendeurId", void 0);
class AdminChangeStatusDto {
}
__decorate([
    (0, class_validator_1.IsEnum)(mission_status_enum_1.MissionStatus),
    __metadata("design:type", String)
], AdminChangeStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AdminChangeStatusDto.prototype, "reason", void 0);
let AdminController = class AdminController {
    constructor(missionsService, usersService, chatService, subscriptionsService) {
        this.missionsService = missionsService;
        this.usersService = usersService;
        this.chatService = chatService;
        this.subscriptionsService = subscriptionsService;
    }
    async getAllMissions() {
        const missions = await this.missionsService.findAll();
        return { data: missions };
    }
    async getAllSubscriptions() {
        const subscriptions = await this.subscriptionsService.findAll();
        return { data: subscriptions };
    }
    async assignVendeur(missionId, dto) {
        const mission = await this.missionsService.assignVendeur(missionId, dto.vendeurId);
        return { data: mission };
    }
    async changeMissionStatus(missionId, dto) {
        const mission = await this.missionsService.findById(missionId);
        if (!mission)
            return { data: null };
        if (dto.status === mission_status_enum_1.MissionStatus.IN_PROGRESS) {
            const updated = await this.missionsService.markInProgress(missionId);
            return { data: updated };
        }
        return { data: mission };
    }
    async getAllVendeurs() {
        const vendeurs = await this.usersService.findByRole(user_role_enum_1.UserRole.VENDEUR);
        return {
            data: vendeurs.map(({ passwordHash: _pw, ...u }) => u),
        };
    }
    async validateVendeur(id) {
        const user = await this.usersService.validateVendeur(id);
        const { passwordHash: _pw, ...safeUser } = user;
        return { data: safeUser };
    }
    async toggleStar(id) {
        const user = await this.usersService.toggleStar(id);
        const { passwordHash: _pw, ...safeUser } = user;
        return { data: safeUser };
    }
    async getAllClients() {
        const clients = await this.usersService.findByRole(user_role_enum_1.UserRole.CLIENT);
        return {
            data: clients.map(({ passwordHash: _pw, ...u }) => u),
        };
    }
    async getFlaggedMessages() {
        const messages = await this.chatService.getFlaggedMessages();
        return { data: messages };
    }
    async approveMessage(id) {
        const message = await this.chatService.approveMessage(id);
        return { data: message };
    }
    async deleteMessage(id) {
        await this.chatService.deleteMessage(id);
        return { data: { success: true } };
    }
    async exportMissions(res) {
        const missions = await this.missionsService.findAll();
        const csv = [
            'id,clientId,vendeurId,status,date,city,category,totalPrice,createdAt',
            ...missions.map((m) => `${m.id},${m.clientId},${m.vendeurId ?? ''},${m.status},${m.date},${m.city},${m.category},${m.totalPrice},${m.createdAt.toISOString()}`),
        ].join('\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="missions.csv"');
        res.send(csv);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('missions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllMissions", null);
__decorate([
    (0, common_1.Get)('subscriptions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllSubscriptions", null);
__decorate([
    (0, common_1.Patch)('missions/:id/assign'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AdminAssignVendeurDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "assignVendeur", null);
__decorate([
    (0, common_1.Patch)('missions/:id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AdminChangeStatusDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "changeMissionStatus", null);
__decorate([
    (0, common_1.Get)('vendeurs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllVendeurs", null);
__decorate([
    (0, common_1.Patch)('vendeurs/:id/validate'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "validateVendeur", null);
__decorate([
    (0, common_1.Patch)('vendeurs/:id/toggle-star'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "toggleStar", null);
__decorate([
    (0, common_1.Get)('clients'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAllClients", null);
__decorate([
    (0, common_1.Get)('chat/flagged'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getFlaggedMessages", null);
__decorate([
    (0, common_1.Patch)('chat/:id/approve'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveMessage", null);
__decorate([
    (0, common_1.Post)('chat/:id/delete'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteMessage", null);
__decorate([
    (0, common_1.Get)('export/missions'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "exportMissions", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN),
    __metadata("design:paramtypes", [missions_service_1.MissionsService,
        users_service_1.UsersService,
        chat_service_1.ChatService,
        subscriptions_service_1.SubscriptionsService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map