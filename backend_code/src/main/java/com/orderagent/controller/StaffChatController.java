package com.orderagent.controller;

import com.orderagent.dto.ChatConversationSummary;
import com.orderagent.dto.ChatMessageResponse;
import com.orderagent.dto.ChatSendRequest;
import com.orderagent.dto.ChatThreadResponse;
import com.orderagent.service.ChatService;
import com.orderagent.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

// Staff / admin side of the support chat. Restricted to ROLE_STAFF / ROLE_ADMIN by "/api/staff/**".
@RestController
@RequestMapping("/api/staff/chat")
@RequiredArgsConstructor
public class StaffChatController {

    private final ChatService chatService;

    @GetMapping("/conversations")
    public List<ChatConversationSummary> inbox() {
        return chatService.staffInbox();
    }

    @GetMapping("/conversations/{id}/messages")
    public ChatThreadResponse thread(
            @PathVariable UUID id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime after,
            @RequestParam(defaultValue = "false") boolean markRead) {
        return chatService.staffThread(id, after, markRead);
    }

    @PostMapping("/conversations/{id}/messages")
    public ChatMessageResponse send(@PathVariable UUID id, @Valid @RequestBody ChatSendRequest request) {
        return chatService.staffSend(SecurityUtil.getCurrentUserId(), id, request.getContent());
    }

    /** Number of conversations waiting for a staff reply (badge in the staff menu). */
    @GetMapping("/unread")
    public Map<String, Long> unread() {
        return Map.of("unread", chatService.staffUnreadConversations());
    }
}
