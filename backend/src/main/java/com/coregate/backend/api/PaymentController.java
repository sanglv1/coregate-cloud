package com.coregate.backend.api;

import com.coregate.backend.api.dto.PaymentDtos;
import com.coregate.backend.service.VnpayService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final VnpayService vnpayService;

    public PaymentController(VnpayService vnpayService) {
        this.vnpayService = vnpayService;
    }

    @PostMapping("/vnpay")
    public PaymentDtos.CreatePaymentResponse createVnpayPayment(@Valid @RequestBody PaymentDtos.CreatePaymentRequest request) {
        return vnpayService.createPayment(request);
    }

    @GetMapping("/vnpay/return-verify")
    public PaymentDtos.VerifyReturnResponse verifyVnpayReturn(@RequestParam Map<String, String> params) {
        return vnpayService.verifyReturn(params);
    }
}
