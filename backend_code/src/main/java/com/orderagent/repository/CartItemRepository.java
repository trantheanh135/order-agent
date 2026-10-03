package com.orderagent.repository;

import com.orderagent.model.CartItem;
import com.orderagent.model.CartItemStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CartItemRepository extends JpaRepository<CartItem, UUID> {
    List<CartItem> findByCustomer_IdOrderByCreatedAtDesc(UUID customerId);
    List<CartItem> findAllByOrderByCreatedAtDesc();
    List<CartItem> findByStatusOrderByCreatedAtDesc(CartItemStatus status);
}
