package com.orderagent.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

// A product the customer adds to their open order (sent by the browser extension).
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemRequest {

    @NotBlank(message = "site is required")
    private String site;

    @NotBlank(message = "url is required")
    private String url;

    @NotBlank(message = "title is required")
    private String title;

    private BigDecimal price;

    private String category;

    @Min(value = 1, message = "quantity must be at least 1")
    @Max(value = 99999, message = "quantity is too large")
    private Integer quantity;

    @Size(max = 1000, message = "customerNote must be at most 1000 characters")
    private String customerNote;

    @Size(max = 2000, message = "imageUrl is too long")
    @Pattern(regexp = "^https?://.*", message = "imageUrl must be an http(s) URL")
    private String imageUrl;
}
