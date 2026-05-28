package com.vnpay.springboot.payment.service;

import com.vnpay.springboot.Config.VNPayConfig;
import com.vnpay.springboot.payment.entity.PaymentOrder;
import com.vnpay.springboot.payment.entity.PaymentOrderEvent;
import com.vnpay.springboot.payment.entity.PaymentOrderEventType;
import com.vnpay.springboot.payment.entity.PaymentStatus;
import com.vnpay.springboot.payment.repository.PaymentOrderEventRepository;
import com.vnpay.springboot.payment.repository.PaymentOrderRepository;
import com.vnpay.springboot.Util.VNPayUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VNPayService {

    private static final Logger log = LoggerFactory.getLogger(VNPayService.class);
    private final VNPayConfig vnPayConfig;
    private final PaymentOrderRepository paymentOrderRepository;
    private final PaymentOrderEventRepository paymentOrderEventRepository;

    // Constructor Injection
    public VNPayService(
            VNPayConfig vnPayConfig,
            PaymentOrderRepository paymentOrderRepository,
            PaymentOrderEventRepository paymentOrderEventRepository) {
        this.vnPayConfig = vnPayConfig;
        this.paymentOrderRepository = paymentOrderRepository;
        this.paymentOrderEventRepository = paymentOrderEventRepository;
    }

    // ------------------- TẠO URL THANH TOÁN -------------------

    public String createOrder(long total, String orderInfor, String bankcode, String ordertype,
                              String promocode, String txnRef, String clientIp) throws UnsupportedEncodingException {

        if (paymentOrderRepository.existsByTxnRef(txnRef)) {
            throw new IllegalArgumentException("Mã đơn hàng đã tồn tại, vui lòng tạo mã mới.");
        }

        PaymentOrder order = new PaymentOrder();
        order.setTxnRef(txnRef);
        order.setAmount(total);
        order.setOrderInfo(orderInfor);
        order.setOrderType(ordertype);
        order.setBankCode(bankcode);
        order.setPromoCode(promocode);
        order.setStatus(PaymentStatus.PENDING);
        order.setIpAddress(clientIp);
        paymentOrderRepository.save(order);

        Map<String, String> vnp_Params = new HashMap<>();

        vnp_Params.put("vnp_Version", "2.1.1");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnp_Params.put("vnp_Amount", String.valueOf(total * 100));
        vnp_Params.put("vnp_TxnRef", txnRef);
        vnp_Params.put("vnp_OrderInfo", orderInfor);
        vnp_Params.put("vnp_OrderType", ordertype);
//        vnp_Params.put("vnp_IpAddr", clientIp);
        vnp_Params.put("vnp_IpAddr", "103.249.22.188");

        if (bankcode != null && !bankcode.isEmpty()) {
            vnp_Params.put("vnp_BankCode", bankcode);
        }

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 9);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        // Tạo Query String và Hash Data
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (String fieldName : fieldNames) {
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                String encodedFieldName = URLEncoder.encode(fieldName, StandardCharsets.UTF_8.toString());
                String encodedFieldValue = URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString());

                hashData.append(encodedFieldName).append('=').append(encodedFieldValue).append('&');
                query.append(encodedFieldName).append('=').append(encodedFieldValue).append('&');
            }
        }

        if (hashData.length() > 0) {
            hashData.setLength(hashData.length() - 1);
            query.setLength(query.length() - 1);
        }
        String vnp_SecureHash = VNPayUtils.hmacSHA512(vnPayConfig.getSecretKey(), hashData.toString());
        String queryUrl = query.toString() + "&vnp_SecureHash=" + vnp_SecureHash;
        return vnPayConfig.getPayUrl() + "?" + queryUrl;
    }


    // ------------------- 2. XỬ LÝ TRANG TRẢ VỀ (RETURN URL - Đã có) -------------------

    public int processVnPayReturn(Map<String, String> vnpParams) {

        String vnp_SecureHash = vnpParams.get("vnp_SecureHash");
        String vnp_TxnRef = vnpParams.get("vnp_TxnRef");
        String vnp_ResponseCode = vnpParams.get("vnp_ResponseCode");
        String newSecureHash = createNewSecureHash(vnpParams);

        boolean signatureValid = Objects.equals(newSecureHash, vnp_SecureHash);
        if (!signatureValid) {
            log.warn("Invalid VNPAY Signature! TxnRef: {}", vnp_TxnRef);
            savePaymentEvent(
                    PaymentOrderEventType.RETURN,
                    vnp_TxnRef,
                    null,
                    false,
                    parseLongSafe(vnpParams.get("vnp_Amount")),
                    vnpParams,
                    "Invalid Signature");
            return -1;
        }

        Optional<PaymentOrder> orderOpt = paymentOrderRepository.findByTxnRef(vnp_TxnRef);
        if (orderOpt.isEmpty()) {
            log.warn("VNPAY Return: Order not found. TxnRef: {}", vnp_TxnRef);
            savePaymentEvent(
                    PaymentOrderEventType.RETURN,
                    vnp_TxnRef,
                    null,
                    true,
                    parseLongSafe(vnpParams.get("vnp_Amount")),
                    vnpParams,
                    "Order not found");
            return 0;
        }

        PaymentOrder order = orderOpt.get();
        Long vnpAmount = parseLongSafe(vnpParams.get("vnp_Amount"));
        if (vnpAmount == null || vnpAmount != order.getAmount() * 100) {
            log.warn("VNPAY Return: Invalid amount. TxnRef: {}, Amount: {}", vnp_TxnRef, vnpAmount);
            order.setStatus(PaymentStatus.FAILED);
            order.setVnpResponseCode("04");
            paymentOrderRepository.save(order);
            savePaymentEvent(
                    PaymentOrderEventType.RETURN,
                    vnp_TxnRef,
                    order,
                    true,
                    vnpAmount,
                    vnpParams,
                    "Invalid Amount");
            return 0;
        }

        if (order.getStatus() == PaymentStatus.SUCCESS) {
            savePaymentEvent(
                    PaymentOrderEventType.RETURN,
                    vnp_TxnRef,
                    order,
                    true,
                    vnpAmount,
                    vnpParams,
                    "Already confirmed");
            return 1;
        }

        order.setVnpTransactionNo(vnpParams.get("vnp_TransactionNo"));
        order.setVnpPayDate(vnpParams.get("vnp_PayDate"));

        if ("00".equals(vnp_ResponseCode)) {
            order.setStatus(PaymentStatus.SUCCESS);
            order.setVnpResponseCode("00");
            paymentOrderRepository.save(order);
            savePaymentEvent(
                    PaymentOrderEventType.RETURN,
                    vnp_TxnRef,
                    order,
                    true,
                    vnpAmount,
                    vnpParams,
                    null);
            return 1;
        }

        log.warn("VNPAY Transaction Failed. TxnRef: {}, Code: {}", vnp_TxnRef, vnp_ResponseCode);
        order.setStatus(PaymentStatus.FAILED);
        order.setVnpResponseCode(vnp_ResponseCode);
        paymentOrderRepository.save(order);
        savePaymentEvent(
                PaymentOrderEventType.RETURN,
                vnp_TxnRef,
                order,
                true,
                vnpAmount,
                vnpParams,
                "VNPAY response code: " + vnp_ResponseCode);
        return 0;
    }


    // ------------------- 3. XỬ LÝ IPN (INSTANT PAYMENT NOTIFICATION) -------------------

    /**
     * Xử lý IPN (Instant Payment Notification) từ VNPAY.
     * Đây là phương thức nền, chịu trách nhiệm chính trong việc cập nhật trạng thái giao dịch.
     * @param vnpParams Tất cả tham số nhận được từ VNPAY.
     * @return Map JSON phản hồi theo định dạng VNPAY: RspCode và Message.
     */
    @Transactional // Rất quan trọng: đảm bảo tính toàn vẹn DB
    public Map<String, String> processVnPayIpn(Map<String, String> vnpParams) {
        try {
            return processVnPayIpnInternal(vnpParams);
        } catch (Exception ex) {
            String txnRef = null;
            Long amt = null;
            if (vnpParams != null) {
                txnRef = getParam(vnpParams, "vnp_TxnRef", "vnp_txn_ref");
                amt = parseLongSafe(getParam(vnpParams, "vnp_Amount", "vnp_amount"));
            }
            log.error("IPN Unexpected error, TxnRef={}", txnRef, ex);
            savePaymentEvent(
                    PaymentOrderEventType.IPN,
                    txnRef,
                    null,
                    false,
                    amt,
                    vnpParams,
                    "Unexpected error: " + ex.getMessage());
            return createIpnResponse("99", "Unknown error");
        }
    }

    private Map<String, String> processVnPayIpnInternal(Map<String, String> vnpParams) {
        String vnp_SecureHash = getParam(vnpParams, "vnp_SecureHash", "vnp_secure_hash");
        String vnp_TxnRef = getParam(vnpParams, "vnp_TxnRef", "vnp_txn_ref");
        String vnp_ResponseCode = getParam(vnpParams, "vnp_ResponseCode", "vnp_response_code");
        Long vnp_Amount = parseLongSafe(getParam(vnpParams, "vnp_Amount", "vnp_amount"));
        if (vnp_Amount == null) {
            savePaymentEvent(
                    PaymentOrderEventType.IPN,
                    vnp_TxnRef,
                    null,
                    false,
                    null,
                    vnpParams,
                    "Invalid Amount");
            return createIpnResponse("04", "Invalid Amount");
        }

        // 1. TẠO CHUỖI BĂM MỚI VÀ KIỂM TRA CHECKSUM
        String newSecureHash = createNewSecureHash(vnpParams);
        boolean signatureValid = vnp_SecureHash != null && !vnp_SecureHash.isEmpty()
                && Objects.equals(newSecureHash, vnp_SecureHash);
        if (!signatureValid) {
            log.warn("IPN Failed: Invalid Checksum! TxnRef: {}", vnp_TxnRef);
            savePaymentEvent(
                    PaymentOrderEventType.IPN,
                    vnp_TxnRef,
                    null,
                    false,
                    vnp_Amount,
                    vnpParams,
                    "Invalid Checksum");
            return createIpnResponse("97", "Invalid Checksum"); // Sai Checksum -> 97
        }

        // --- CHỮ KÝ HỢP LỆ -> BẮT ĐẦU KIỂM TRA DB VÀ CẬP NHẬT ---

        Optional<PaymentOrder> orderOpt = paymentOrderRepository.findByTxnRef(vnp_TxnRef);
        if (orderOpt.isEmpty()) {
            savePaymentEvent(
                    PaymentOrderEventType.IPN,
                    vnp_TxnRef,
                    null,
                    true,
                    vnp_Amount,
                    vnpParams,
                    "Order not Found");
            return createIpnResponse("01", "Order not Found");
        }

        PaymentOrder order = orderOpt.get();
        if (order.getAmount() * 100 != vnp_Amount) {
            savePaymentEvent(
                    PaymentOrderEventType.IPN,
                    vnp_TxnRef,
                    order,
                    true,
                    vnp_Amount,
                    vnpParams,
                    "Invalid Amount");
            return createIpnResponse("04", "Invalid Amount");
        }

        if (order.getStatus() == PaymentStatus.SUCCESS) {
            savePaymentEvent(
                    PaymentOrderEventType.IPN,
                    vnp_TxnRef,
                    order,
                    true,
                    vnp_Amount,
                    vnpParams,
                    "Order already confirmed");
            return createIpnResponse("02", "Order already confirmed");
        }

        order.setVnpTransactionNo(getParam(vnpParams, "vnp_TransactionNo", "vnp_transaction_no"));
        order.setVnpPayDate(getParam(vnpParams, "vnp_PayDate", "vnp_pay_date"));

        if ("00".equals(vnp_ResponseCode)) {
            order.setStatus(PaymentStatus.SUCCESS);
            order.setVnpResponseCode("00");
            log.info("IPN Success: Order {} updated to PAID.", vnp_TxnRef);
            savePaymentEvent(
                    PaymentOrderEventType.IPN,
                    vnp_TxnRef,
                    order,
                    true,
                    vnp_Amount,
                    vnpParams,
                    null);
        } else {
            order.setStatus(PaymentStatus.FAILED);
            order.setVnpResponseCode(vnp_ResponseCode);
            log.warn("IPN Failed: Order {} updated to FAILED. Code: {}", vnp_TxnRef, vnp_ResponseCode);
            savePaymentEvent(
                    PaymentOrderEventType.IPN,
                    vnp_TxnRef,
                    order,
                    true,
                    vnp_Amount,
                    vnpParams,
                    "VNPAY response code: " + vnp_ResponseCode);
        }

        paymentOrderRepository.save(order);

        // 4. PHẢN HỒI THÀNH CÔNG VỚI VNPAY
        // Trả về 00 chỉ khi bạn đã thành công ghi nhận và xử lý kết quả
        return createIpnResponse("00", "Confirm Success");
    }


    // ------------------- 4. CÁC PHƯƠNG THỨC HỖ TRỢ -------------------

    /**
     * Hàm tái tạo chuỗi Hash (dùng chung cho Return URL và IPN)
     */
    private String createNewSecureHash(Map<String, String> vnpParams) {
        List<String> fieldNames = new ArrayList<>(vnpParams.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();

        for (String fieldName : fieldNames) {
            if (isHashField(fieldName)) continue;
            String fieldValue = vnpParams.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                try {
                    String encodedValue = URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString());
                    hashData.append(fieldName).append('=').append(encodedValue).append('&');
                } catch (UnsupportedEncodingException e) {
                    log.error("Error during URL encoding for VNPAY params: {}", e.getMessage());
                    return "";
                }
            }
        }

        if (hashData.length() > 0) {
            hashData.setLength(hashData.length() - 1);
        }

        return VNPayUtils.hmacSHA512(vnPayConfig.getSecretKey(), hashData.toString());
    }

    private boolean isHashField(String fieldName) {
        return fieldName != null && (
                fieldName.equalsIgnoreCase("vnp_SecureHash") ||
                fieldName.equalsIgnoreCase("vnp_SecureHashType"));
    }

    private String getParam(Map<String, String> params, String... keys) {
        for (String key : keys) {
            String v = params.get(key);
            if (v != null) return v;
        }
        for (Map.Entry<String, String> e : params.entrySet()) {
            for (String key : keys) {
                if (key.equalsIgnoreCase(e.getKey())) return e.getValue();
            }
        }
        return null;
    }

    /**
     * Tạo Map JSON Response theo định dạng VNPAY (chỉ dùng cho IPN)
     */
    private Map<String, String> createIpnResponse(String rspCode, String message) {
        Map<String, String> response = new HashMap<>();
        response.put("RspCode", rspCode);
        response.put("Message", message);
        return response;
    }

    private Long parseLongSafe(String value) {
        try {
            if (value == null || value.isBlank()) {
                return null;
            }
            return Long.parseLong(value);
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private void savePaymentEvent(
            PaymentOrderEventType eventType,
            String txnRef,
            PaymentOrder paymentOrder,
            boolean signatureValid,
            Long amountMinor,
            Map<String, String> vnpParams,
            String errorMessage) {
        try {
            PaymentOrderEvent event = new PaymentOrderEvent();
            event.setEventType(eventType);
            event.setTxnRef(txnRef != null ? txnRef : "");
            event.setPaymentOrder(paymentOrder);
            event.setSignatureValid(signatureValid);
            event.setAmountMinor(amountMinor);
            event.setResponseCode(vnpParams.get("vnp_ResponseCode"));
            event.setTransactionNo(vnpParams.get("vnp_TransactionNo"));
            event.setPayDate(vnpParams.get("vnp_PayDate"));
            event.setBankCode(vnpParams.get("vnp_BankCode"));
            event.setErrorMessage(errorMessage);
            event.setRawParams(toSortedQueryString(vnpParams));
            paymentOrderEventRepository.save(event);
        } catch (Exception ex) {
            log.warn("Failed to save payment event. TxnRef: {}, type: {}, err: {}", txnRef, eventType, ex.getMessage());
        }
    }

    private String toSortedQueryString(Map<String, String> params) {
        if (params == null || params.isEmpty()) {
            return "";
        }
        List<String> keys = new ArrayList<>(params.keySet());
        Collections.sort(keys);
        StringBuilder sb = new StringBuilder();
        for (String key : keys) {
            String value = params.get(key);
            if (sb.length() > 0) {
                sb.append('&');
            }
            sb.append(key).append('=').append(value == null ? "" : value);
        }
        return sb.toString();
    }
}
