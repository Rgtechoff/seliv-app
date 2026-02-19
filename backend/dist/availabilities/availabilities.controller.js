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
exports.AvailabilitiesController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const availabilities_service_1 = require("./availabilities.service");
const upsert_availability_dto_1 = require("./dto/upsert-availability.dto");
let AvailabilitiesController = class AvailabilitiesController {
    constructor(service) {
        this.service = service;
    }
    async getMine(user) {
        const list = await this.service.findByUser(user.id);
        return { data: list };
    }
    async getByUser(userId) {
        const list = await this.service.findByUser(userId);
        return { data: list };
    }
    async upsert(user, dto) {
        const avail = await this.service.upsert(user.id, dto);
        return { data: avail };
    }
    async remove(user, id) {
        await this.service.remove(id, user.id);
        return { data: { success: true } };
    }
};
exports.AvailabilitiesController = AvailabilitiesController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], AvailabilitiesController.prototype, "getMine", null);
__decorate([
    (0, common_1.Get)(':userId/public'),
    __param(0, (0, common_1.Param)('userId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AvailabilitiesController.prototype, "getByUser", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, upsert_availability_dto_1.UpsertAvailabilityDto]),
    __metadata("design:returntype", Promise)
], AvailabilitiesController.prototype, "upsert", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User, String]),
    __metadata("design:returntype", Promise)
], AvailabilitiesController.prototype, "remove", null);
exports.AvailabilitiesController = AvailabilitiesController = __decorate([
    (0, common_1.Controller)('availabilities'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [availabilities_service_1.AvailabilitiesService])
], AvailabilitiesController);
//# sourceMappingURL=availabilities.controller.js.map