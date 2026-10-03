package com.orderagent.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

// One product line of an order. Everything here is read from the shop page by the extension.
@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
public class OrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "UUID")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private CustomerOrder order;

    @Column(nullable = false)
    private String site;

    @Column(name = "product_url", columnDefinition = "TEXT")
    private String productUrl;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String title;

    @Column(name = "image_url", columnDefinition = "TEXT")
    private String imageUrl;

    private BigDecimal price;

    @Column(nullable = false)
    private String currency = "CNY";

    @Column(nullable = false)
    private Integer quantity = 1;

    private String category;

    // Variant / remarks read from the shop page (e.g. "Màu sắc: Đen; Kích cỡ: L").
    @Column(name = "customer_note", columnDefinition = "TEXT")
    private String customerNote;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
