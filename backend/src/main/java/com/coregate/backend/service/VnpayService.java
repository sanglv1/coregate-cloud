package com.coregate.backend.service;

import com.coregate.backend.api.dto.PaymentDtos;
import com.coregate.backend.domain.PaymentEntity;
import com.coregate.backend.domain.PaymentStatus;
import com.coregate.backend.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class VnpayService {
    private final PaymentRepository paymentRepository;
    private final OrderService orderService;
    private final DownloadService downloadService;
    private final String tmnCode;
    private final String hashSecret;
    private final String payUrl;
    private final String defaultReturnUrl;
    private final String defaultIpAddr;
    private final ZoneId vnpZoneId;

    public VnpayService(
        PaymentRepository paymentRepository,
        OrderService orderService,
        DownloadService downloadService,
        @Value("${app.vnpay.tmn-code}") String tmnCode,
        @Value("${app.vnpay.hash-secret}") String hashSecret,
        @Value("${app.vnpay.pay-url}") String payUrl,
        @Value("${app.vnpay.return-url}") String defaultReturnUrl,
        @Value("${app.vnpay.ip-address:127.0.0.1}") String defaultIpAddr,
        @Value("${app.vnpay.timezone:Asia/Ho_Chi_Minh}") String timezone
    ) {
        this.paymentRepository = paymentRepository;
        this.orderService = orderService;
        this.downloadService = downloadService;
        this.tmnCode = tmnCode;
        this.hashSecret = hashSecret;
        this.payUrl = payUrl;
        this.defaultReturnUrl = defaultReturnUrl;
        this.defaultIpAddr = defaultIpAddr;
        this.vnpZoneId = resolveZoneId(timezone);
    }

    @Transactional
    public PaymentDtos.CreatePaymentResponse createPayment(PaymentDtos.CreatePaymentRequest request) {
        if (tmnCode == null || tmnCode.isBlank() || hashSecret == null || hashSecret.isBlank()) {
            throw new IllegalStateException("VNPAY is not configured. Please set VNPAY_TMN_CODE and VNPAY_HASH_SECRET.");
        }

        UUID orderId = UUID.fromString(request.orderId());
        String txnRef = "CG" + System.currentTimeMillis();

        PaymentEntity payment = new PaymentEntity();
        payment.setId(UUID.randomUUID());
        payment.setOrderId(orderId);
        payment.setTxnRef(txnRef);
        payment.setProvider("VNPAY");
        payment.setStatus(PaymentStatus.PENDING);
        payment.setAmount(request.amount());
        paymentRepository.save(payment);

        Map<String, String> fields = new TreeMap<>();
        fields.put("vnp_Version", "2.1.1");
        fields.put("vnp_Command", "pay");
        fields.put("vnp_TmnCode", tmnCode);
        fields.put("vnp_Amount", String.valueOf(request.amount() * 100));
        fields.put("vnp_CurrCode", "VND");
        fields.put("vnp_TxnRef", txnRef);
        fields.put("vnp_OrderInfo", request.description());
        fields.put("vnp_OrderType", "other");
        fields.put("vnp_Locale", "vn");
        fields.put("vnp_ReturnUrl", request.returnUrl().isBlank() ? defaultReturnUrl : request.returnUrl());
        fields.put("vnp_IpAddr", defaultIpAddr);

        ZonedDateTime now = ZonedDateTime.now(vnpZoneId);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        fields.put("vnp_CreateDate", now.format(formatter));
        fields.put("vnp_ExpireDate", now.plusMinutes(15).format(formatter));

        String query = buildQuery(fields);
        String secureHash = hmacSHA512(hashSecret, query);
        String paymentUrl = UriComponentsBuilder.fromHttpUrl(payUrl)
            .query(query)
            .queryParam("vnp_SecureHash", secureHash)
            .build(true)
            .toUriString();

        return new PaymentDtos.CreatePaymentResponse(paymentUrl, txnRef);
    }

    @Transactional
    public String handleIpn(Map<String, String> params) {
        VerificationResult verification = verifySignature(params);
        if (!verification.validSignature()) {
            return "{\"RspCode\":\"97\",\"Message\":\"Invalid signature\"}";
        }

        String txnRef = getParam(params, "vnp_TxnRef", "vnp_txn_ref");
        String responseCode = getParam(params, "vnp_ResponseCode", "vnp_response_code");
        String transactionStatus = getParam(params, "vnp_TransactionStatus", "vnp_transaction_status");
        Long amountMinor = parseLongSafe(getParam(params, "vnp_Amount", "vnp_amount"));
        PaymentEntity payment = paymentRepository.findByTxnRef(txnRef).orElse(null);
        if (payment == null) {
            return "{\"RspCode\":\"01\",\"Message\":\"Order not found\"}";
        }

        if (amountMinor == null || amountMinor != payment.getAmount() * 100) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setRawResponse(params.toString());
            paymentRepository.save(payment);
            return "{\"RspCode\":\"04\",\"Message\":\"Invalid amount\"}";
        }

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return "{\"RspCode\":\"02\",\"Message\":\"Order already confirmed\"}";
        }

        boolean isSuccess = "00".equals(responseCode) && (transactionStatus == null || "00".equals(transactionStatus));
        if (isSuccess) {
            payment.setStatus(PaymentStatus.SUCCESS);
            orderService.markOrderCompleted(payment.getOrderId());
            downloadService.issueLinksForCompletedOrder(payment.getOrderId());
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            orderService.markOrderFailed(payment.getOrderId());
        }
        payment.setRawResponse(params.toString());
        paymentRepository.save(payment);
        return "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}";
    }

    @Transactional
    public PaymentDtos.VerifyReturnResponse verifyReturn(Map<String, String> params) {
        VerificationResult verification = verifySignature(params);
        if (!verification.validSignature()) {
            return new PaymentDtos.VerifyReturnResponse(false, false, null, null, "Invalid signature");
        }

        String txnRef = getParam(params, "vnp_TxnRef", "vnp_txn_ref");
        String responseCode = getParam(params, "vnp_ResponseCode", "vnp_response_code");
        String transactionStatus = getParam(params, "vnp_TransactionStatus", "vnp_transaction_status");
        Long amountMinor = parseLongSafe(getParam(params, "vnp_Amount", "vnp_amount"));

        if (txnRef == null || txnRef.isBlank()) {
            return new PaymentDtos.VerifyReturnResponse(true, false, null, null, "Missing txnRef");
        }

        PaymentEntity payment = paymentRepository.findByTxnRef(txnRef).orElse(null);
        if (payment == null) {
            return new PaymentDtos.VerifyReturnResponse(true, false, null, txnRef, "Order not found");
        }

        if (amountMinor == null || amountMinor != payment.getAmount() * 100) {
            boolean wasSuccess = payment.getStatus() == PaymentStatus.SUCCESS;
            if (!wasSuccess) {
                payment.setStatus(PaymentStatus.FAILED);
                orderService.markOrderFailed(payment.getOrderId());
            }
            payment.setRawResponse(params.toString());
            paymentRepository.save(payment);
            return new PaymentDtos.VerifyReturnResponse(true, false, payment.getOrderId().toString(), txnRef, "Invalid amount");
        }

        boolean isSuccess = "00".equals(responseCode) && (transactionStatus == null || "00".equals(transactionStatus));
        if (isSuccess) {
            if (payment.getStatus() != PaymentStatus.SUCCESS) {
                payment.setStatus(PaymentStatus.SUCCESS);
                orderService.markOrderCompleted(payment.getOrderId());
                downloadService.issueLinksForCompletedOrder(payment.getOrderId());
            }
            payment.setRawResponse(params.toString());
            paymentRepository.save(payment);
            return new PaymentDtos.VerifyReturnResponse(true, true, payment.getOrderId().toString(), txnRef, "Payment successful");
        }

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            payment.setStatus(PaymentStatus.FAILED);
            orderService.markOrderFailed(payment.getOrderId());
        }
        payment.setRawResponse(params.toString());
        paymentRepository.save(payment);
        return new PaymentDtos.VerifyReturnResponse(true, false, payment.getOrderId().toString(), txnRef, "Payment failed");
    }

    private String buildQuery(Map<String, String> fields) {
        StringBuilder builder = new StringBuilder();
        List<String> names = new ArrayList<>(fields.keySet());
        Collections.sort(names);
        for (String name : names) {
            String value = fields.get(name);
            if (value == null || value.isBlank()) {
                continue;
            }
            if (builder.length() > 0) {
                builder.append("&");
            }
            builder.append(URLEncoder.encode(name, StandardCharsets.UTF_8));
            builder.append("=");
            builder.append(URLEncoder.encode(value, StandardCharsets.UTF_8));
        }
        return builder.toString();
    }

    private Map<String, String> extractSignableVnpFields(Map<String, String> fields) {
        Map<String, String> signable = new TreeMap<>();
        for (Map.Entry<String, String> entry : fields.entrySet()) {
            String key = entry.getKey();
            if (key == null || !key.toLowerCase(Locale.ROOT).startsWith("vnp_")) {
                continue;
            }
            if ("vnp_SecureHash".equalsIgnoreCase(key) || "vnp_SecureHashType".equalsIgnoreCase(key)) {
                continue;
            }
            signable.put(key, entry.getValue());
        }
        return signable;
    }

    private VerificationResult verifySignature(Map<String, String> params) {
        String secureHash = getParam(params, "vnp_SecureHash", "vnp_secure_hash");
        if (secureHash == null || secureHash.isBlank()) {
            return new VerificationResult(false);
        }
        Map<String, String> signable = extractSignableVnpFields(params);
        String signedData = buildQuery(signable);
        String computedHash = hmacSHA512(hashSecret, signedData);
        return new VerificationResult(computedHash.equalsIgnoreCase(secureHash));
    }

    private String getParam(Map<String, String> params, String... keys) {
        for (String key : keys) {
            String value = params.get(key);
            if (value != null) {
                return value;
            }
        }
        for (Map.Entry<String, String> entry : params.entrySet()) {
            for (String key : keys) {
                if (key.equalsIgnoreCase(entry.getKey())) {
                    return entry.getValue();
                }
            }
        }
        return null;
    }

    private Long parseLongSafe(String value) {
        try {
            return value == null || value.isBlank() ? null : Long.parseLong(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private ZoneId resolveZoneId(String timezone) {
        try {
            return ZoneId.of(timezone);
        } catch (Exception ignored) {
            return ZoneId.of("Asia/Ho_Chi_Minh");
        }
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] bytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder();
            for (byte b : bytes) {
                hash.append(String.format("%02x", b));
            }
            return hash.toString();
        } catch (Exception e) {
            throw new IllegalStateException("Could not sign VNPAY payload", e);
        }
    }

    private record VerificationResult(boolean validSignature) {}
}
