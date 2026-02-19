"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MissionsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const missions_service_1 = require("./missions.service");
const missions_controller_1 = require("./missions.controller");
const pricing_service_1 = require("./pricing.service");
const mission_entity_1 = require("./entities/mission.entity");
const mission_option_entity_1 = require("./entities/mission-option.entity");
let MissionsModule = class MissionsModule {
};
exports.MissionsModule = MissionsModule;
exports.MissionsModule = MissionsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([mission_entity_1.Mission, mission_option_entity_1.MissionOption])],
        providers: [missions_service_1.MissionsService, pricing_service_1.PricingService],
        controllers: [missions_controller_1.MissionsController],
        exports: [missions_service_1.MissionsService, pricing_service_1.PricingService],
    })
], MissionsModule);
//# sourceMappingURL=missions.module.js.map