package com.orderagent.model;

/**
 * Lifecycle of a customer order.
 *
 * NEW              - the customer's open order ("giỏ"): they can still add / change / remove items.
 *                    Only the customer sees it; staff never do.
 * AWAITING_PAYMENT - the customer confirmed the order and must now pay (QR code + transfer details).
 *                    Still invisible to staff, and no longer editable.
 * CONFIRMED        - the customer reported that they paid. From here on the order is visible to staff, who check
 *                    the money arrived (payment verification) and then process it.
 * PURCHASED        - staff bought the goods on 1688 / Taobao (only after the payment is verified).
 * SHIPPED          - in transit.
 * DELIVERED        - received by the customer.
 * CANCELLED        - cancelled: by the customer before paying, or by staff afterwards.
 */
public enum OrderStatus {
    NEW,
    AWAITING_PAYMENT,
    CONFIRMED,
    PURCHASED,
    SHIPPED,
    DELIVERED,
    CANCELLED
}
