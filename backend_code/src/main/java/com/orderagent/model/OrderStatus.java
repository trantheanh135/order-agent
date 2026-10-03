package com.orderagent.model;

/**
 * Lifecycle of a customer order.
 *
 * NEW        - the customer's open order ("giỏ"): they can still add / change / remove items.
 *              Only the customer sees it; staff never do.
 * CONFIRMED  - the customer pressed "confirm". From here on the order is visible to staff, who process it.
 * PURCHASED  - staff bought the goods on 1688 / Taobao.
 * SHIPPED    - in transit.
 * DELIVERED  - received by the customer.
 * CANCELLED  - cancelled (by staff) at any point after confirmation.
 */
public enum OrderStatus {
    NEW,
    CONFIRMED,
    PURCHASED,
    SHIPPED,
    DELIVERED,
    CANCELLED
}
