package com.orderagent.dto;

import com.orderagent.model.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Staff update of a confirmed order. All fields optional: send only what changes.
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderUpdateRequest {
    private OrderStatus status;
    private String staffNotes;
    private String trackingNumber;
}
