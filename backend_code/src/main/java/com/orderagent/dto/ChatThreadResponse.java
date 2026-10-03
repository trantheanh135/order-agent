package com.orderagent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

// A chat thread as seen by one side. `unread` is how many messages from the OTHER side that viewer has not read.
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatThreadResponse {
    private UUID conversationId; // null while the customer has never written
    private List<ChatMessageResponse> messages;
    private long unread;
}
