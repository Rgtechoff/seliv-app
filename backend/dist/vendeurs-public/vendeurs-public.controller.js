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
exports.VendeursPublicController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_entity_1 = require("../users/entities/user.entity");
const vendeurs_public_service_1 = require("./vendeurs-public.service");
const vendeurs_query_dto_1 = require("./dto/vendeurs-query.dto");
let VendeursPublicController = class VendeursPublicController {
    constructor(vendeursPublicService) {
        this.vendeursPublicService = vendeursPublicService;
    }
    async findAll(query, user) {
        return this.vendeursPublicService.findAll(query, user.id);
    }
    async findOne(id, user) {
        return this.vendeursPublicService.findOne(id, user.id);
    }
};
exports.VendeursPublicController = VendeursPublicController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [vendeurs_query_dto_1.VendeursQueryDto,
        user_entity_1.User]),
    __metadata("design:returntype", Promise)
], VendeursPublicController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], VendeursPublicController.prototype, "findOne", null);
exports.VendeursPublicController = VendeursPublicController = __decorate([
    (0, common_1.Controller)('vendeurs-public'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [vendeurs_public_service_1.VendeursPublicService])
], VendeursPublicController);
//# sourceMappingURL=vendeurs-public.controller.js.map