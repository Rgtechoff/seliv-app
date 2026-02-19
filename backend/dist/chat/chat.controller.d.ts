import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getMessages(missionId: string): Promise<{
        data: import("./entities/chat-message.entity").ChatMessage[];
    }>;
    getPresets(category?: string): Promise<{
        data: import("./entities/chat-preset.entity").ChatPreset[];
    }>;
}
