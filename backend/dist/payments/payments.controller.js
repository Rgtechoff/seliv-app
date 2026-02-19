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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const payments_service_1 = require("./payments.service");
const missions_service_1 = require("../missions/missions.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const user_role_enum_1 = require("../common/enums/user-role.enum");
const user_entity_1 = require("../users/entities/user.entity");
const config_1 = require("@nestjs/config");
const class_validator_1 = require("class-validator");
class CancelMissionDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CancelMissionDto.prototype, "reason", void 0);
let PaymentsController = class PaymentsController {
    constructor(paymentsService, missionsService, configService) {
        this.paymentsService = paymentsService;
        this.missionsService = missionsService;
        this.configService = configService;
    }
    async createCheckout(missionId, user) {
        const mission = await this.missionsService.findById(missionId);
        if (!mission)
            throw new common_1.NotFoundException('Mission not found');
        const frontendUrl = this.configService.get('FRONTEND_URL', 'http://localhost:3000');
        const result = await this.paymentsService.createCheckoutSession(missionId, mission.totalPrice, user.email, frontendUrl);
        return { data: result };
    }
    async cancelMission(missionId, user, dto) {
        const { mission, refundPercent } = await this.missionsService.cancel(missionId, user.id, dto.reason);
        if (mission.stripePaymentId && mission.totalPrice) {
            const refundAmount = Math.floor((mission.totalPrice * refundPercent) / 100);
            const refund = await this.paymentsService.refund(mission.stripePaymentId, refundAmount);
            return { data: { mission, refund, refundPercent } };
        }
        return { data: { mission, refundPercent } };
    }
    async downloadInvoice(missionId, res) {
        const pdfBuffer = await this.paymentsService.generateInvoicePdf(missionId);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="facture-${missionId}.pdf"`,
            'Content-Length': pdfBuffer.length,
        });
        res.end(pdfBuffer);
    }
    async handleWebhook(req, signature) {
        const rawBody = req.rawBody;
        if (!rawBody)
            throw new common_1.NotFoundException('Raw body not available');
        await this.paymentsService.handleWebhook(rawBody, signature);
        return { received: true };
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('missions/:id/checkout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.CLIENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "createCheckout", null);
__decorate([
    (0, common_1.Post)('missions/:id/cancel'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.CLIENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_entity_1.User,
        CancelMissionDto]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "cancelMission", null);
__decorate([
    (0, common_1.Get)('missions/:missionId/invoice'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('missionId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "downloadInvoice", null);
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Headers)('stripe-signature')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleWebhook", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService,
        missions_service_1.MissionsService,
        config_1.ConfigService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map