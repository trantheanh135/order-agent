package com.orderagent.repository;

import com.orderagent.model.ChatConversation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ChatConversationRepository extends JpaRepository<ChatConversation, UUID> {

    Optional<ChatConversation> findByCustomer_Id(UUID customerId);

    // Staff inbox: only threads that actually have a message, newest activity first.
    List<ChatConversation> findByLastMessageAtIsNotNullOrderByLastMessageAtDesc();
}
