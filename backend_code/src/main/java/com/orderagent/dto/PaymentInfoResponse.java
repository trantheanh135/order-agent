package com.orderagent.dto;

import com.orderagent.model.PaymentSettings;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// What a customer needs to pay (and what the admin edits).
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInfoResponse {
    private String qrImage;          // data URL, or null while not configured
    private String instructions;
    private BigDecimal exchangeRate; // VND per 1 CNY, or null
    private LocalDateTime updatedAt;
    private boolean configured;      // true once there is a QR image or instructions

    public static PaymentInfoResponse fromEntity(PaymentSettings s) {
        boolean hasQr = s.getQrImage() != null && !s.getQrImage().isBlank();
        boolean hasText = s.getInstructions() != null && !s.getInstructions().isBlank();
        return PaymentInfoResponse.builder()
                .qrImage(hasQr ? s.getQrImage() : null)
                .instructions(s.getInstructions())
                .exchangeRate(s.getExchangeRate())
                .updatedAt(s.getUpdatedAt())
                .configured(hasQr || hasText)
                .build();
    }
}
