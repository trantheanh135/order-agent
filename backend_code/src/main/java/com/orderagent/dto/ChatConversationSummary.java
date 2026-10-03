package com.orderagent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

// One row of the staff inbox.
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatConversationSummary {
    private UUID id;
    private String customerName;
    private String customerEmail;
    private String lastMessagePreview;
    private LocalDateTime lastMessageAt;
    private long unread; // customer messages no staff member has read yet
}
