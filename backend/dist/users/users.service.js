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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const user_role_enum_1 = require("../common/enums/user-role.enum");
const vendor_level_enum_1 = require("../common/enums/vendor-level.enum");
let UsersService = class UsersService {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async create(data) {
        const user = this.userRepo.create(data);
        return this.userRepo.save(user);
    }
    async findById(id) {
        return this.userRepo.findOne({ where: { id } });
    }
    async findByEmail(email) {
        return this.userRepo.findOne({ where: { email } });
    }
    async update(id, dto) {
        const user = await this.findById(id);
        if (!user)
            throw new common_1.NotFoundException(`User ${id} not found`);
        Object.assign(user, dto);
        return this.userRepo.save(user);
    }
    async validateVendeur(id) {
        const user = await this.findById(id);
        if (!user)
            throw new common_1.NotFoundException(`User ${id} not found`);
        user.isValidated = true;
        return this.userRepo.save(user);
    }
    async toggleStar(id) {
        const user = await this.findById(id);
        if (!user)
            throw new common_1.NotFoundException(`User ${id} not found`);
        user.isStar = !user.isStar;
        if (user.isStar)
            user.level = vendor_level_enum_1.VendorLevel.STAR;
        return this.userRepo.save(user);
    }
    async updateStripeCustomerId(id, stripeCustomerId) {
        await this.userRepo.update(id, { stripeCustomerId });
    }
    async findValidatedVendeurs() {
        return this.userRepo.find({
            where: { role: user_role_enum_1.UserRole.VENDEUR, isValidated: true },
        });
    }
    async findAll() {
        return this.userRepo.find();
    }
    async findByRole(role) {
        return this.userRepo.find({ where: { role } });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map