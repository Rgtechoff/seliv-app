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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const chat_message_entity_1 = require("./entities/chat-message.entity");
const chat_preset_entity_1 = require("./entities/chat-preset.entity");
const BLOCKED_PATTERNS = [
    /0[67]\d{8}/,
    /\+33\s*[67]\s*\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}/,
    /\d{10}/,
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
    /whatsapp/i,
    /telegram/i,
    /signal\s*(app)?/i,
    /instagram\.com/i,
    /facebook\.com/i,
    /tiktok\.com/i,
    /snapchat/i,
    /discord/i,
];
function isFlagged(content) {
    return BLOCKED_PATTERNS.some((pattern) => pattern.test(content));
}
let ChatService = class ChatService {
    constructor(messageRepo, presetRepo) {
        this.messageRepo = messageRepo;
        this.presetRepo = presetRepo;
    }
    async sendMessage(missionId, senderId, content, isPreset) {
        const flagged = !isPreset && isFlagged(content);
        const message = this.messageRepo.create({
            missionId,
            senderId,
            content,
            isPreset,
            isFlagged: flagged,
        });
        return this.messageRepo.save(message);
    }
    async getMessages(missionId) {
        return this.messageRepo.find({
            where: { missionId, isFlagged: false },
            relations: ['sender'],
            order: { createdAt: 'ASC' },
        });
    }
    async getFlaggedMessages() {
        return this.messageRepo.find({
            where: { isFlagged: true },
            relations: ['sender', 'mission'],
            order: { createdAt: 'DESC' },
        });
    }
    async getPresets(category) {
        if (category) {
            return this.presetRepo.find({
                where: { category },
                order: { sortOrder: 'ASC' },
            });
        }
        return this.presetRepo.find({ order: { category: 'ASC', sortOrder: 'ASC' } });
    }
    async approveMessage(messageId) {
        await this.messageRepo.update(messageId, { isFlagged: false });
        const msg = await this.messageRepo.findOne({ where: { id: messageId } });
        if (!msg)
            throw new Error(`Message ${messageId} not found`);
        return msg;
    }
    async deleteMessage(messageId) {
        await this.messageRepo.delete(messageId);
    }
    async seedPresets() {
        const existing = await this.presetRepo.count();
        if (existing > 0)
            return;
        const presets = [
            { category: 'Logistique', label: 'Les articles sont prêts et étiquetés', sortOrder: 1 },
            { category: 'Logistique', label: "J'ai besoin de plus de temps pour la préparation", sortOrder: 2 },
            { category: 'Logistique', label: 'Le volume est différent de ce qui était prévu', sortOrder: 3 },
            { category: 'Logistique', label: 'Où puis-je me garer ?', sortOrder: 4 },
            { category: 'Horaire', label: 'Je serai en retard de 15 minutes', sortOrder: 1 },
            { category: 'Horaire', label: 'Je suis en route', sortOrder: 2 },
            { category: 'Horaire', label: "Je suis arrivé(e)", sortOrder: 3 },
            { category: 'Horaire', label: 'Peut-on décaler de 30 minutes ?', sortOrder: 4 },
            { category: 'Live', label: 'Le live est lancé', sortOrder: 1 },
            { category: 'Live', label: 'Problème technique en cours', sortOrder: 2 },
            { category: 'Live', label: 'Le live est terminé', sortOrder: 3 },
            { category: 'Live', label: 'Les résultats du live sont disponibles', sortOrder: 4 },
        ];
        for (const p of presets) {
            await this.presetRepo.save(this.presetRepo.create(p));
        }
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(chat_message_entity_1.ChatMessage)),
    __param(1, (0, typeorm_1.InjectRepository)(chat_preset_entity_1.ChatPreset)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ChatService);
//# sourceMappingURL=chat.service.js.map