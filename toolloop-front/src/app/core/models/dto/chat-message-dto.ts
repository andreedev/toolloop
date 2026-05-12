export interface ChatMessageDTO {
    messageId: number;
    roomId: number;
    text: string;
    createdAt: string;
    isMine: boolean;
}