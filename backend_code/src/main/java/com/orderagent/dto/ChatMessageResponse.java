package com.orderagent.dto;

import com.orderagent.model.ChatMessage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private UUID id;
    private boolean fromStaff;
    private String senderName;
    private String content;
    private LocalDateTime createdAt;

    public static ChatMessageResponse fromEntity(ChatMessage m) {
        return ChatMessageResponse.builder()
                .id(m.getId())
                .fromStaff(m.isFromStaff())
                .senderName(m.getSenderName())
                .content(m.getContent())
                .createdAt(m.getCreatedAt())
                .build();
    }
}
