package com.orderagent.controller;

import com.orderagent.dto.CartItemCreateRequest;
import com.orderagent.dto.CartItemResponse;
import com.orderagent.service.CartItemService;
import com.orderagent.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// Customer-scoped endpoints. POST is called by the browser extension when the
// logged-in customer adds something to their cart on 1688.com/taobao.com.
@RestController
@RequestMapping("/api/cart-items")
@RequiredArgsConstructor
public class CartItemController {

    private final CartItemService cartItemService;

    @PostMapping
    public ResponseEntity<CartItemResponse> track(@Valid @RequestBody CartItemCreateRequest request) {
        CartItemResponse response = cartItemService.track(SecurityUtil.getCurrentUserId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/me")
    public ResponseEntity<List<CartItemResponse>> listMine() {
        return ResponseEntity.ok(cartItemService.listMine(SecurityUtil.getCurrentUserId()));
    }
}
