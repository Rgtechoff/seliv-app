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
exports.MissionOption = void 0;
const typeorm_1 = require("typeorm");
const mission_entity_1 = require("./mission.entity");
let MissionOption = class MissionOption {
};
exports.MissionOption = MissionOption;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MissionOption.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'mission_id' }),
    __metadata("design:type", String)
], MissionOption.prototype, "missionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => mission_entity_1.Mission),
    (0, typeorm_1.JoinColumn)({ name: 'mission_id' }),
    __metadata("design:type", mission_entity_1.Mission)
], MissionOption.prototype, "mission", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'option_type' }),
    __metadata("design:type", String)
], MissionOption.prototype, "optionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'option_detail', type: 'varchar', nullable: true }),
    __metadata("design:type", Object)
], MissionOption.prototype, "optionDetail", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], MissionOption.prototype, "price", void 0);
exports.MissionOption = MissionOption = __decorate([
    (0, typeorm_1.Entity)('mission_options')
], MissionOption);
//# sourceMappingURL=mission-option.entity.js.map