package com.orderagent.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "cart_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "UUID")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Column(nullable = false)
    private String site;

    @Column(name = "product_url", columnDefinition = "TEXT")
    private String productUrl;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String title;

    private BigDecimal price;

    @Column(nullable = false)
    private String currency = "CNY";

    @Column(nullable = false)
    private Integer quantity = 1;

    private String category;

    @Column(name = "clicked_label")
    private String clickedLabel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CartItemStatus status = CartItemStatus.NEW;

    @Column(name = "staff_notes", columnDefinition = "TEXT")
    private String staffNotes;

    @Column(name = "tracking_number")
    private String trackingNumber;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "purchased_at")
    private LocalDateTime purchasedAt;

    @Column(name = "shipped_at")
    private LocalDateTime shippedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
        if (status == null) {
            status = CartItemStatus.NEW;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
