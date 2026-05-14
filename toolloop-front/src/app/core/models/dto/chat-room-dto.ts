export interface ChatRoomDTO {
  roomId: number;
  toolId: number;
  toolName: string;
  otherUserName: string;
  otherUserPhoto: string | null;
  toolPhotoKey: string;
  unreadCount: number;
  lastMessageDate: string;
}