package com.toolloop.model.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
public class ChatMessageDTO {
    private Long messageId;
    private Long roomId;
    private String text;
    private LocalDateTime createdAt;
    @JsonProperty("isMine")
    private boolean isMine;
}