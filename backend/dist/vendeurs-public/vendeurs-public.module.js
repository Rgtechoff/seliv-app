"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VendeursPublicModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const review_entity_1 = require("../reviews/entities/review.entity");
const mission_entity_1 = require("../missions/entities/mission.entity");
const subscriptions_module_1 = require("../subscriptions/subscriptions.module");
const vendeurs_public_service_1 = require("./vendeurs-public.service");
const vendeurs_public_controller_1 = require("./vendeurs-public.controller");
let VendeursPublicModule = class VendeursPublicModule {
};
exports.VendeursPublicModule = VendeursPublicModule;
exports.VendeursPublicModule = VendeursPublicModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, review_entity_1.Review, mission_entity_1.Mission]),
            subscriptions_module_1.SubscriptionsModule,
        ],
        providers: [vendeurs_public_service_1.VendeursPublicService],
        controllers: [vendeurs_public_controller_1.VendeursPublicController],
    })
], VendeursPublicModule);
//# sourceMappingURL=vendeurs-public.module.js.map