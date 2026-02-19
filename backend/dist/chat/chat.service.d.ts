import { Repository } from 'typeorm';
import { ChatMessage } from './entities/chat-message.entity';
import { ChatPreset } from './entities/chat-preset.entity';
export declare class ChatService {
    private readonly messageRepo;
    private readonly presetRepo;
    constructor(messageRepo: Repository<ChatMessage>, presetRepo: Repository<ChatPreset>);
    sendMessage(missionId: string, senderId: string, content: string, isPreset: boolean): Promise<ChatMessage>;
    getMessages(missionId: string): Promise<ChatMessage[]>;
    getFlaggedMessages(): Promise<ChatMessage[]>;
    getPresets(category?: string): Promise<ChatPreset[]>;
    approveMessage(messageId: string): Promise<ChatMessage>;
    deleteMessage(messageId: string): Promise<void>;
    seedPresets(): Promise<void>;
}
