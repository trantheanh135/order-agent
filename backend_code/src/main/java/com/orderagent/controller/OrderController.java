package com.orderagent.controller;

import com.orderagent.dto.OrderItemQuantityRequest;
import com.orderagent.dto.OrderItemRequest;
import com.orderagent.dto.OrderResponse;
import com.orderagent.service.OrderService;
import com.orderagent.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

// Customer endpoints (ROLE_CUSTOMER, see SecurityConfig). The customer works on ONE open order
// ("current", status NEW) and confirms it when done; only then do staff see it.
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping("/current")
    public OrderResponse current() {
        return orderService.getCurrent(SecurityUtil.getCurrentUserId());
    }

    @PostMapping("/current/items")
    public OrderResponse addItem(@Valid @RequestBody OrderItemRequest request) {
        return orderService.addItem(SecurityUtil.getCurrentUserId(), request);
    }

    @PatchMapping("/current/items/{itemId}")
    public OrderResponse updateItem(@PathVariable UUID itemId, @Valid @RequestBody OrderItemQuantityRequest request) {
        return orderService.updateItemQuantity(SecurityUtil.getCurrentUserId(), itemId, request.getQuantity());
    }

    @DeleteMapping("/current/items/{itemId}")
    public OrderResponse removeItem(@PathVariable UUID itemId) {
        return orderService.removeItem(SecurityUtil.getCurrentUserId(), itemId);
    }

    @DeleteMapping("/current")
    public OrderResponse discard() {
        return orderService.discardCurrent(SecurityUtil.getCurrentUserId());
    }

    @PostMapping("/current/confirm")
    public OrderResponse confirm() {
        return orderService.confirm(SecurityUtil.getCurrentUserId());
    }

    /** "I have paid": the order becomes visible to staff. */
    @PostMapping("/{orderId}/paid")
    public OrderResponse paid(@PathVariable UUID orderId) {
        return orderService.reportPaid(SecurityUtil.getCurrentUserId(), orderId);
    }

    /** Give up on an order that is still waiting for payment. */
    @PostMapping("/{orderId}/cancel")
    public OrderResponse cancelUnpaid(@PathVariable UUID orderId) {
        return orderService.cancelUnpaid(SecurityUtil.getCurrentUserId(), orderId);
    }

    @GetMapping("/me")
    public List<OrderResponse> mine() {
        return orderService.listMine(SecurityUtil.getCurrentUserId());
    }
}
