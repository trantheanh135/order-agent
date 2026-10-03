package com.orderagent.controller;

import com.orderagent.dto.CartItemResponse;
import com.orderagent.dto.CartItemUpdateRequest;
import com.orderagent.model.CartItemStatus;
import com.orderagent.service.CartItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

// Restricted to ROLE_STAFF / ROLE_ADMIN by SecurityConfig ("/api/staff/**").
@RestController
@RequestMapping("/api/staff/cart-items")
@RequiredArgsConstructor
public class StaffCartItemController {

    private final CartItemService cartItemService;

    @GetMapping
    public List<CartItemResponse> list(@RequestParam(required = false) CartItemStatus status) {
        return cartItemService.listForStaff(status);
    }

    @GetMapping("/{id}")
    public CartItemResponse get(@PathVariable UUID id) {
        return cartItemService.getForStaff(id);
    }

    @PatchMapping("/{id}")
    public CartItemResponse update(@PathVariable UUID id, @RequestBody CartItemUpdateRequest request) {
        return cartItemService.updateByStaff(id, request);
    }
}
