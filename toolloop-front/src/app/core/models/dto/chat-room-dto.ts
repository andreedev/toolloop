export interface ChatRoomDTO {
  roomId: number;
  toolName: string;
  otherUserName: string;
  otherUserPhoto: string | null;
  toolPhotoKey: string;
  unreadCount: number;
}