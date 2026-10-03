package com.orderagent.dto;

import com.orderagent.model.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private UUID id;
    private String site;
    private String url;
    private String title;
    private String imageUrl;
    private BigDecimal price;
    private String currency;
    private Integer quantity;
    private String category;
    private String customerNote;

    public static OrderItemResponse fromEntity(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .site(item.getSite())
                .url(item.getProductUrl())
                .title(item.getTitle())
                .imageUrl(item.getImageUrl())
                .price(item.getPrice())
                .currency(item.getCurrency())
                .quantity(item.getQuantity())
                .category(item.getCategory())
                .customerNote(item.getCustomerNote())
                .build();
    }
}
