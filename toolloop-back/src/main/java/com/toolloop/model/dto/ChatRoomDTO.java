package com.toolloop.model.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.quarkus.runtime.annotations.RegisterForReflection;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@RegisterForReflection
public class ChatRoomDTO {
    private Long roomId;
    private Long toolId;
    private String toolName;
    private Long otherUserId;
    private String otherUserName;
    private String otherUserPhoto;
    private String toolPhotoKey;
    private Long unreadCount;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastMessageDate;
}