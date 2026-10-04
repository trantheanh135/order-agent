package com.orderagent.controller;

import com.orderagent.dto.PaymentInfoResponse;
import com.orderagent.dto.PaymentSettingsRequest;
import com.orderagent.service.PaymentSettingsService;
import com.orderagent.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentSettingsService paymentSettingsService;

    /** Any signed-in user: customers read how to pay, the admin page reads the current values. */
    @GetMapping("/api/payment-info")
    public PaymentInfoResponse info() {
        return paymentSettingsService.get();
    }

    /** Admin only: where the QR code, the transfer instructions and the exchange rate are set. */
    @PutMapping("/api/staff/payment-settings")
    @PreAuthorize("hasRole('ADMIN')")
    public PaymentInfoResponse update(@Valid @RequestBody PaymentSettingsRequest request) {
        return paymentSettingsService.update(SecurityUtil.getCurrentUserId(), request);
    }
}
