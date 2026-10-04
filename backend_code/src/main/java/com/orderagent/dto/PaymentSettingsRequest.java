package com.orderagent.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentSettingsRequest {

    // data:image/(png|jpeg|webp);base64,... ; empty string removes the QR. Format is checked in the service.
    @Size(max = 1_500_000, message = "qrImage is too large")
    private String qrImage;

    @Size(max = 2000, message = "instructions must be at most 2000 characters")
    private String instructions;

    @DecimalMin(value = "0.0001", message = "exchangeRate must be positive")
    private BigDecimal exchangeRate;
}
