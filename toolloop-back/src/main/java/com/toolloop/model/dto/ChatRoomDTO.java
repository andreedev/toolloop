package com.toolloop.model.dto;

import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@RegisterForReflection
public class ChatRoomDTO {
    private Long roomId;
    private Long toolId;
    private String toolName;
    private String otherUserName;
    private String otherUserPhoto;
    private String toolPhotoKey;
    private Long unreadCount;
}