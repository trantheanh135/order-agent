package com.orderagent.dto;

import com.orderagent.model.CartItem;
import com.orderagent.model.CartItemStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private UUID id;
    private String site;
    private String url;
    private String title;
    private BigDecimal price;
    private String currency;
    private Integer quantity;
    private String category;
    private CartItemStatus status;
    private String staffNotes;
    private String trackingNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime purchasedAt;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;

    // Only populated on staff-facing responses.
    private String customerName;
    private String customerEmail;

    public static CartItemResponse fromEntity(CartItem item, boolean includeCustomer) {
        CartItemResponse.CartItemResponseBuilder b = CartItemResponse.builder()
                .id(item.getId())
                .site(item.getSite())
                .url(item.getProductUrl())
                .title(item.getTitle())
                .price(item.getPrice())
                .currency(item.getCurrency())
                .quantity(item.getQuantity())
                .category(item.getCategory())
                .status(item.getStatus())
                .staffNotes(item.getStaffNotes())
                .trackingNumber(item.getTrackingNumber())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .purchasedAt(item.getPurchasedAt())
                .shippedAt(item.getShippedAt())
                .deliveredAt(item.getDeliveredAt());

        if (includeCustomer && item.getCustomer() != null) {
            b.customerName(item.getCustomer().getName());
            b.customerEmail(item.getCustomer().getEmail());
        }
        return b.build();
    }
}
