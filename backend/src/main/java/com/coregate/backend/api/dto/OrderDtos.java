package com.coregate.backend.api.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public class OrderDtos {

    public record CreateOrderRequest(
        @NotEmpty List<@Valid OrderItemInput> items,
        @Email String customerEmail
    ) {}

    public record OrderItemInput(
        @NotBlank String productId,
        @NotNull @Min(1) Integer quantity
    ) {}

    public record OrderItemResponse(String productId, Integer quantity, Long unitPrice) {}

    public record OrderResponse(
        UUID id,
        String customerId,
        String customerEmail,
        String status,
        Long totalAmount,
        String currency,
        List<OrderItemResponse> items
    ) {}

    public record CreateOrderResponse(List<OrderResponse> orders) {}
}
