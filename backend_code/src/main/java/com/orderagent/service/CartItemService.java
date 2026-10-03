package com.orderagent.service;

import com.orderagent.dto.CartItemCreateRequest;
import com.orderagent.dto.CartItemResponse;
import com.orderagent.dto.CartItemUpdateRequest;
import com.orderagent.exception.ResourceNotFoundException;
import com.orderagent.model.CartItem;
import com.orderagent.model.CartItemStatus;
import com.orderagent.model.User;
import com.orderagent.repository.CartItemRepository;
import com.orderagent.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class CartItemService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;

    public CartItemResponse track(UUID customerId, CartItemCreateRequest request) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", customerId));

        CartItem item = new CartItem();
        item.setCustomer(customer);
        item.setSite(request.getSite());
        item.setProductUrl(request.getUrl());
        item.setTitle(request.getTitle());
        item.setPrice(request.getPrice());
        item.setCategory(request.getCategory() != null ? request.getCategory() : "Uncategorized");
        item.setClickedLabel(request.getClickedLabel());
        item.setQuantity(request.getQuantity() != null ? request.getQuantity() : 1);
        item.setCustomerNote(request.getCustomerNote());
        item.setImageUrl(request.getImageUrl());
        item.setStatus(CartItemStatus.NEW);

        cartItemRepository.save(item);
        return CartItemResponse.fromEntity(item, false);
    }

    public List<CartItemResponse> listMine(UUID customerId) {
        return cartItemRepository.findByCustomer_IdOrderByCreatedAtDesc(customerId)
                .stream()
                .map(item -> CartItemResponse.fromEntity(item, false))
                .toList();
    }

    public List<CartItemResponse> listForStaff(CartItemStatus statusFilter) {
        List<CartItem> items = statusFilter != null
                ? cartItemRepository.findByStatusOrderByCreatedAtDesc(statusFilter)
                : cartItemRepository.findAllByOrderByCreatedAtDesc();

        return items.stream()
                .map(item -> CartItemResponse.fromEntity(item, true))
                .toList();
    }

    public CartItemResponse getForStaff(UUID id) {
        return CartItemResponse.fromEntity(findOrThrow(id), true);
    }

    public CartItemResponse updateByStaff(UUID id, CartItemUpdateRequest request) {
        CartItem item = findOrThrow(id);

        if (request.getStatus() != null && request.getStatus() != item.getStatus()) {
            applyStatusTransition(item, request.getStatus());
        }
        if (request.getStaffNotes() != null) {
            item.setStaffNotes(request.getStaffNotes());
        }
        if (request.getTrackingNumber() != null) {
            item.setTrackingNumber(request.getTrackingNumber());
        }

        cartItemRepository.save(item);
        return CartItemResponse.fromEntity(item, true);
    }

    private void applyStatusTransition(CartItem item, CartItemStatus newStatus) {
        item.setStatus(newStatus);
        LocalDateTime now = LocalDateTime.now();
        switch (newStatus) {
            case PURCHASED -> item.setPurchasedAt(now);
            case SHIPPED -> item.setShippedAt(now);
            case DELIVERED -> item.setDeliveredAt(now);
            default -> { /* NEW / CANCELLED — no extra timestamp */ }
        }
    }

    private CartItem findOrThrow(UUID id) {
        return cartItemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", id));
    }
}
