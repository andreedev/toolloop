export interface ChatRoomDTO {
  roomId: number;
  toolId: number;
  toolName: string;
  otherUserId: number;
  otherUserName: string;
  otherUserPhoto: string | null;
  toolPhotoKey: string;
  unreadCount: number;
  lastMessageDate: string;
  isCurrentUserBlockedByOtherUser: boolean;
}