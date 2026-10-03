package com.orderagent.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemCreateRequest {

    @NotBlank(message = "site is required")
    private String site;

    @NotBlank(message = "url is required")
    private String url;

    @NotBlank(message = "title is required")
    private String title;

    private BigDecimal price;

    private String category;

    private String clickedLabel;

    private Integer quantity;
}
