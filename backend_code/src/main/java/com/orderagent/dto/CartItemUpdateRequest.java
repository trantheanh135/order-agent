package com.orderagent.dto;

import com.orderagent.model.CartItemStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// All fields optional — staff sends only what's changing.
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemUpdateRequest {
    private CartItemStatus status;
    private String staffNotes;
    private String trackingNumber;
}
