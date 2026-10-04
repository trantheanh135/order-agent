package com.orderagent.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// Single-row table: how customers pay. The admin uploads the bank QR image and the transfer instructions.
@Entity
@Table(name = "payment_settings")
@Getter
@Setter
@NoArgsConstructor
public class PaymentSettings {

    public static final long SINGLETON_ID = 1L;

    @Id
    private Long id = SINGLETON_ID;

    // data:image/...;base64,... (kept small: the admin page resizes it before uploading)
    @Column(name = "qr_image", columnDefinition = "TEXT")
    private String qrImage;

    // Free text shown next to the QR: bank name, account number, account holder, notes...
    @Column(columnDefinition = "TEXT")
    private String instructions;

    // VND per 1 CNY (optional): lets the UI show an estimated amount to transfer.
    @Column(name = "exchange_rate")
    private BigDecimal exchangeRate;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;
}
