package com.orderagent.controller;

import com.orderagent.dto.OrderResponse;
import com.orderagent.dto.OrderUpdateRequest;
import com.orderagent.model.OrderStatus;
import com.orderagent.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

// Restricted to ROLE_STAFF / ROLE_ADMIN by SecurityConfig ("/api/staff/**").
// Staff only see orders the customer has confirmed; open (NEW) orders are never exposed.
@RestController
@RequestMapping("/api/staff/orders")
@RequiredArgsConstructor
public class StaffOrderController {

    private final OrderService orderService;

    @GetMapping
    public List<OrderResponse> list(@RequestParam(required = false) OrderStatus status) {
        return orderService.listForStaff(status);
    }

    @GetMapping("/{id}")
    public OrderResponse get(@PathVariable UUID id) {
        return orderService.getForStaff(id);
    }

    @PatchMapping("/{id}")
    public OrderResponse update(@PathVariable UUID id, @RequestBody OrderUpdateRequest request) {
        return orderService.updateByStaff(id, request);
    }
}
