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
exports.SubscriptionsController = void 0;
const common_1 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
const subscriptions_service_1 = require("./subscriptions.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_role_enum_1 = require("../common/enums/user-role.enum");
const user_entity_1 = require("../users/entities/user.entity");
const subscription_plan_enum_1 = require("../common/enums/subscription-plan.enum");
const config_1 = require("@nestjs/config");
class CreateSubscriptionDto {
}
__decorate([
    (0, class_validator_1.IsEnum)(subscription_plan_enum_1.SubscriptionPlan),
    __metadata("design:type", String)
], CreateSubscriptionDto.prototype, "plan", void 0);
let SubscriptionsController = class SubscriptionsController {
    constructor(subscriptionsService, configService) {
        this.subscriptionsService = subscriptionsService;
        this.configService = configService;
    }
    async getMy(user) {
        const sub = await this.subscriptionsService.findActiveByUserId(user.id);
        return { data: sub };
    }
    async createCheckout(user, dto) {
        const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
        const result = await this.subscriptionsService.createCheckoutSession(user.id, dto.plan, frontendUrl);
        return { data: result };
    }
};
exports.SubscriptionsController = SubscriptionsController;
__decorate([
    (0, common_1.Get)('my'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "getMy", null);
__decorate([
    (0, common_1.Post)('checkout'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_entity_1.User,
        CreateSubscriptionDto]),
    __metadata("design:returntype", Promise)
], SubscriptionsController.prototype, "createCheckout", null);
exports.SubscriptionsController = SubscriptionsController = __decorate([
    (0, common_1.Controller)('subscriptions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.CLIENT),
    __metadata("design:paramtypes", [subscriptions_service_1.SubscriptionsService,
        config_1.ConfigService])
], SubscriptionsController);
//# sourceMappingURL=subscriptions.controller.js.map