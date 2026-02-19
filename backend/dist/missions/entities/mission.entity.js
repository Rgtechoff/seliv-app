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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mission = void 0;
const typeorm_1 = require("typeorm");
const mission_status_enum_1 = require("../../common/enums/mission-status.enum");
const volume_enum_1 = require("../../common/enums/volume.enum");
const user_entity_1 = require("../../users/entities/user.entity");
let Mission = class Mission {
};
exports.Mission = Mission;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Mission.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'client_id' }),
    __metadata("design:type", String)
], Mission.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'client_id' }),
    __metadata("design:type", user_entity_1.User)
], Mission.prototype, "client", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vendeur_id', nullable: true }),
    __metadata("design:type", Object)
], Mission.prototype, "vendeurId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'vendeur_id' }),
    __metadata("design:type", Object)
], Mission.prototype, "vendeur", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'moderateur_id', nullable: true }),
    __metadata("design:type", Object)
], Mission.prototype, "moderateurId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'moderateur_id' }),
    __metadata("design:type", Object)
], Mission.prototype, "moderateur", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: mission_status_enum_1.MissionStatus, default: mission_status_enum_1.MissionStatus.DRAFT }),
    __metadata("design:type", String)
], Mission.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Mission.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'start_time', type: 'time' }),
    __metadata("design:type", String)
], Mission.prototype, "startTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'duration_hours', type: 'int' }),
    __metadata("design:type", Number)
], Mission.prototype, "durationHours", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Mission.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Mission.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Mission.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: volume_enum_1.VolumeEnum }),
    __metadata("design:type", String)
], Mission.prototype, "volume", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'base_price', type: 'int' }),
    __metadata("design:type", Number)
], Mission.prototype, "basePrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'options_price', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Mission.prototype, "optionsPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Mission.prototype, "discount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_price', type: 'int' }),
    __metadata("design:type", Number)
], Mission.prototype, "totalPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stripe_payment_id', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Mission.prototype, "stripePaymentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'stripe_checkout_session_id', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Mission.prototype, "stripeCheckoutSessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'paid_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], Mission.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'refund_amount', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], Mission.prototype, "refundAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'refund_stripe_id', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], Mission.prototype, "refundStripeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cancelled_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], Mission.prototype, "cancelledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cancellation_reason', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Mission.prototype, "cancellationReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'completed_at', type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], Mission.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Mission.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Mission.prototype, "updatedAt", void 0);
exports.Mission = Mission = __decorate([
    (0, typeorm_1.Entity)('missions')
], Mission);
//# sourceMappingURL=mission.entity.js.map