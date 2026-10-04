package com.orderagent.dto;

import com.orderagent.model.CustomerOrder;
import com.orderagent.model.OrderItem;
import com.orderagent.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {
    private UUID id;                 // null when the customer has no open order yet
    private String code;             // short human-friendly reference, e.g. "A1B2C3D4"
    private OrderStatus status;
    private List<OrderItemResponse> items;
    private int itemCount;           // number of product lines
    private int totalQuantity;       // sum of quantities
    private BigDecimal estimatedTotal; // sum of price x quantity for lines that have a price (CNY)
    private int unpricedItems;       // lines whose price could not be read from the shop page
    private String currency;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime confirmedAt;   // the customer confirmed the order (payment is now due)
    private LocalDateTime paidAt;        // the customer reported the payment (order becomes visible to staff)
    private String paymentCode;          // transfer content the customer must use, e.g. "HVA1B2C3D4"
    private boolean paymentVerified;     // staff checked that the money arrived
    private LocalDateTime paymentVerifiedAt;
    private LocalDateTime purchasedAt;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private String trackingNumber;
    // Only populated on staff-facing responses.
    private String staffNotes;
    private String paymentVerifiedBy;
    private String customerName;
    private String customerEmail;

    /** The customer has no open order yet: an empty, unsaved NEW order. */
    public static OrderResponse emptyDraft() {
        return OrderResponse.builder()
                .status(OrderStatus.NEW)
                .items(new ArrayList<>())
                .estimatedTotal(BigDecimal.ZERO)
                .currency("CNY")
                .build();
    }

    public static OrderResponse fromEntity(CustomerOrder order, boolean forStaff) {
        List<OrderItemResponse> items = order.getItems().stream().map(OrderItemResponse::fromEntity).toList();
        BigDecimal total = BigDecimal.ZERO;
        int unpriced = 0;
        int quantity = 0;
        for (OrderItem item : order.getItems()) {
            quantity += item.getQuantity();
            if (item.getPrice() == null) {
                unpriced++;
            } else {
                total = total.add(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            }
        }

        OrderResponse.OrderResponseBuilder b = OrderResponse.builder()
                .id(order.getId())
                .code(order.getId().toString().substring(0, 8).toUpperCase())
                .status(order.getStatus())
                .items(items)
                .itemCount(items.size())
                .totalQuantity(quantity)
                .estimatedTotal(total)
                .unpricedItems(unpriced)
                .currency("CNY")
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .confirmedAt(order.getConfirmedAt())
                .paidAt(order.getPaidAt())
                .paymentCode("HV" + order.getId().toString().substring(0, 8).toUpperCase())
                .paymentVerified(order.getPaymentVerifiedAt() != null)
                .paymentVerifiedAt(order.getPaymentVerifiedAt())
                .purchasedAt(order.getPurchasedAt())
                .shippedAt(order.getShippedAt())
                .deliveredAt(order.getDeliveredAt())
                .trackingNumber(order.getTrackingNumber());
        if (forStaff) {
            b.staffNotes(order.getStaffNotes());
            b.paymentVerifiedBy(order.getPaymentVerifiedBy());
            if (order.getCustomer() != null) {
                b.customerName(order.getCustomer().getName());
                b.customerEmail(order.getCustomer().getEmail());
            }
        }
        return b.build();
    }
}
