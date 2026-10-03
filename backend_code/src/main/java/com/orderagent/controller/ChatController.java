package com.orderagent.controller;

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
import java.util.Map;

// Customer side of the support chat (ROLE_CUSTOMER, see SecurityConfig).
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    /** `after` = cursor for polling; `markRead=true` while the chat window is open. */
    @GetMapping
    public ChatThreadResponse thread(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime after,
            @RequestParam(defaultValue = "false") boolean markRead) {
        return chatService.customerThread(SecurityUtil.getCurrentUserId(), after, markRead);
    }

    @PostMapping("/messages")
    public ChatMessageResponse send(@Valid @RequestBody ChatSendRequest request) {
        return chatService.customerSend(SecurityUtil.getCurrentUserId(), request.getContent());
    }

    @GetMapping("/unread")
    public Map<String, Long> unread() {
        return Map.of("unread", chatService.customerUnread(SecurityUtil.getCurrentUserId()));
    }
}
