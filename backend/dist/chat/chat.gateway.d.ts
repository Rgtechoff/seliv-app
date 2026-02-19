import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
interface SendMessagePayload {
    missionId: string;
    content: string;
    isPreset?: boolean;
    senderId: string;
}
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly chatService;
    server: Server;
    constructor(chatService: ChatService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinMission(client: Socket, missionId: string): void;
    handleSendMessage(client: Socket, payload: SendMessagePayload): Promise<void>;
    handleTyping(client: Socket, data: {
        missionId: string;
        userId: string;
    }): void;
}
export {};
