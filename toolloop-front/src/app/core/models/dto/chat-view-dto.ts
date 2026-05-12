import { ChatMessageDTO } from './chat-message-dto';
import { ChatRoomDTO } from './chat-room-dto';

export interface ChatViewDTO {
    roomDetails: ChatRoomDTO;
    messages: ChatMessageDTO[];
}