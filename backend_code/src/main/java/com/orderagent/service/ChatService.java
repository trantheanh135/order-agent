package com.orderagent.service;

import com.orderagent.dto.ChatConversationSummary;
import com.orderagent.dto.ChatMessageResponse;
import com.orderagent.dto.ChatThreadResponse;
import com.orderagent.exception.ResourceNotFoundException;
import com.orderagent.model.ChatConversation;
import com.orderagent.model.ChatMessage;
import com.orderagent.model.User;
import com.orderagent.repository.ChatConversationRepository;
import com.orderagent.repository.ChatMessageRepository;
import com.orderagent.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Support chat between a customer and the Hàng Về team. One thread per customer; any staff / admin
 * can read and answer it. Clients poll with a cursor (`after`) and keep their own read state on the server.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class ChatService {

    private static final LocalDateTime EPOCH = LocalDateTime.of(1970, 1, 1, 0, 0);

    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;

    // ---- customer side -------------------------------------------------------------------------

    /** The customer's thread. `after` = only newer messages (polling); `markRead` = the chat window is open. */
    public ChatThreadResponse customerThread(UUID customerId, LocalDateTime after, boolean markRead) {
        ChatConversation conv = conversationRepository.findByCustomer_Id(customerId).orElse(null);
        if (conv == null) {
            return ChatThreadResponse.builder().messages(new ArrayList<>()).unread(0).build();
        }
        List<ChatMessageResponse> messages = load(conv, after);
        if (markRead) {
            conv.setCustomerLastReadAt(LocalDateTime.now());
            conversationRepository.save(conv);
        }
        return ChatThreadResponse.builder()
                .conversationId(conv.getId())
                .messages(messages)
                .unread(customerUnread(conv))
                .build();
    }

    public ChatMessageResponse customerSend(UUID customerId, String content) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", customerId));
        ChatConversation conv = conversationRepository.findByCustomer_Id(customerId).orElseGet(() -> {
            ChatConversation c = new ChatConversation();
            c.setCustomer(customer);
            return conversationRepository.save(c);
        });
        ChatMessage message = append(conv, false, customer.getName(), content);
        conv.setCustomerLastReadAt(message.getCreatedAt()); // the sender has obviously read the thread so far
        conversationRepository.save(conv);
        return ChatMessageResponse.fromEntity(message);
    }

    @Transactional(readOnly = true)
    public long customerUnread(UUID customerId) {
        return conversationRepository.findByCustomer_Id(customerId).map(this::customerUnread).orElse(0L);
    }

    // ---- staff side ----------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<ChatConversationSummary> staffInbox() {
        return conversationRepository.findByLastMessageAtIsNotNullOrderByLastMessageAtDesc().stream()
                .map(c -> ChatConversationSummary.builder()
                        .id(c.getId())
                        .customerName(c.getCustomer().getName())
                        .customerEmail(c.getCustomer().getEmail())
                        .lastMessagePreview(c.getLastMessagePreview())
                        .lastMessageAt(c.getLastMessageAt())
                        .unread(staffUnread(c))
                        .build())
                .toList();
    }

    public ChatThreadResponse staffThread(UUID conversationId, LocalDateTime after, boolean markRead) {
        ChatConversation conv = findOrThrow(conversationId);
        List<ChatMessageResponse> messages = load(conv, after);
        if (markRead) {
            conv.setStaffLastReadAt(LocalDateTime.now());
            conversationRepository.save(conv);
        }
        return ChatThreadResponse.builder()
                .conversationId(conv.getId())
                .messages(messages)
                .unread(staffUnread(conv))
                .build();
    }

    public ChatMessageResponse staffSend(UUID staffUserId, UUID conversationId, String content) {
        User staff = userRepository.findById(staffUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", staffUserId));
        ChatConversation conv = findOrThrow(conversationId);
        ChatMessage message = append(conv, true, staff.getName(), content);
        conv.setStaffLastReadAt(message.getCreatedAt());
        conversationRepository.save(conv);
        return ChatMessageResponse.fromEntity(message);
    }

    /** How many conversations are waiting for a staff reply / have unread customer messages. */
    @Transactional(readOnly = true)
    public long staffUnreadConversations() {
        return messageRepository.countConversationsAwaitingStaff(EPOCH);
    }

    // ---- helpers -------------------------------------------------------------------------------

    private ChatMessage append(ChatConversation conv, boolean fromStaff, String senderName, String content) {
        String text = content.trim();
        ChatMessage message = new ChatMessage();
        message.setConversation(conv);
        message.setFromStaff(fromStaff);
        message.setSenderName(senderName);
        message.setContent(text);
        message.setCreatedAt(LocalDateTime.now());
        messageRepository.save(message);

        conv.setLastMessageAt(message.getCreatedAt());
        conv.setLastMessagePreview((fromStaff ? "Hàng Về: " : "") + (text.length() > 150 ? text.substring(0, 150) + "…" : text));
        return message;
    }

    private List<ChatMessageResponse> load(ChatConversation conv, LocalDateTime after) {
        List<ChatMessage> messages;
        if (after == null) {
            messages = new ArrayList<>(messageRepository.findTop200ByConversation_IdOrderByCreatedAtDesc(conv.getId()));
            Collections.reverse(messages);
        } else {
            messages = messageRepository.findByConversation_IdAndCreatedAtGreaterThanEqualOrderByCreatedAtAsc(conv.getId(), after);
        }
        return messages.stream().map(ChatMessageResponse::fromEntity).toList();
    }

    private long customerUnread(ChatConversation conv) {
        LocalDateTime since = conv.getCustomerLastReadAt() != null ? conv.getCustomerLastReadAt() : EPOCH;
        return messageRepository.countByConversation_IdAndFromStaffAndCreatedAtAfter(conv.getId(), true, since);
    }

    private long staffUnread(ChatConversation conv) {
        LocalDateTime since = conv.getStaffLastReadAt() != null ? conv.getStaffLastReadAt() : EPOCH;
        return messageRepository.countByConversation_IdAndFromStaffAndCreatedAtAfter(conv.getId(), false, since);
    }

    private ChatConversation findOrThrow(UUID id) {
        return conversationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conversation", "id", id));
    }
}
