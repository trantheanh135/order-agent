package com.orderagent.repository;

import com.orderagent.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {

    // Initial load: the most recent 200 messages (the service puts them back in chronological order).
    List<ChatMessage> findTop200ByConversation_IdOrderByCreatedAtDesc(UUID conversationId);

    // Polling: everything at or after a cursor (inclusive, the client de-duplicates by id so that two
    // messages created in the same instant can never be skipped).
    List<ChatMessage> findByConversation_IdAndCreatedAtGreaterThanEqualOrderByCreatedAtAsc(UUID conversationId, LocalDateTime after);

    long countByConversation_IdAndFromStaffAndCreatedAtAfter(UUID conversationId, boolean fromStaff, LocalDateTime after);

    // Number of conversations that have at least one customer message the staff have not read yet.
    @Query("select count(distinct m.conversation.id) from ChatMessage m "
            + "where m.fromStaff = false and m.createdAt > coalesce(m.conversation.staffLastReadAt, :epoch)")
    long countConversationsAwaitingStaff(@Param("epoch") LocalDateTime epoch);
}
