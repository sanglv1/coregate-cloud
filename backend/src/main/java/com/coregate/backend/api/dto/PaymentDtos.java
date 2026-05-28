package com.coregate.backend.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PaymentDtos {

    public record CreatePaymentRequest(
        @NotBlank String orderId,
        @NotNull @Min(1) Long amount,
        @NotBlank String description,
        @NotBlank String returnUrl
    ) {}

    public record CreatePaymentResponse(String paymentUrl, String txnRef) {}

    public record VerifyReturnResponse(
        boolean validSignature,
        boolean success,
        String orderId,
        String txnRef,
        String message
    ) {}
}
