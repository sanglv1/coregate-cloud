package com.vnpay.springboot.payment.controller;

import com.vnpay.springboot.audit.entity.VNPayAuditFlow;
import com.vnpay.springboot.audit.service.VNPayAuditLogService;
import com.vnpay.springboot.payment.dto.PaymentRequest;
import com.vnpay.springboot.payment.dto.QueryRequest;
import com.vnpay.springboot.payment.dto.RefundRequest;
import com.vnpay.springboot.payment.service.VNPayService;
import com.vnpay.springboot.payment.service.VNPayQuery;
import com.vnpay.springboot.payment.service.VNPayRefund;
import com.vnpay.springboot.Util.VNPayUtils;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.validation.BindingResult;

import jakarta.validation.Valid;

import java.io.UnsupportedEncodingException;
import java.util.*;

@Controller
@RequestMapping("/vnpay")
public class VNPayController {

    private static final Logger log = LoggerFactory.getLogger(VNPayController.class);
    private final VNPayService vnPayService;
    private final VNPayQuery vnPayQuery;
    private final VNPayRefund vnPayRefund;
    private final VNPayAuditLogService auditLogService;

    public VNPayController(
            VNPayService vnPayService,
            VNPayQuery vnPayQuery,
            VNPayRefund vnPayRefund,
            VNPayAuditLogService auditLogService) {
        this.vnPayService = vnPayService;
        this.vnPayQuery = vnPayQuery;
        this.vnPayRefund = vnPayRefund;
        this.auditLogService = auditLogService;
    }

    // ------------------- 1. FORM -------------------
    @GetMapping("/pay")
    public String showPayForm() {
        return "vnpay_pay";
    }

    @GetMapping("/query")
    public String querydr() {
        return "vnpay_querydr";
    }

    @GetMapping("/refund")
    public String refund() {
        return "vnpay_refund";
    }

    // ------------------- 2. TẠO ĐƠN HÀNG -------------------
    @PostMapping("/submitOrder")
    public String submitOrder(
            @Valid PaymentRequest paymentRequest,
            BindingResult bindingResult,
            HttpServletRequest request,
            Model model) {

        if (bindingResult.hasErrors()) {
            model.addAttribute("error", "Vui lòng kiểm tra lại thông tin đơn hàng.");
            return "vnpay_pay";
        }

        String clientIp = VNPayUtils.getIpAddress(request);

        try {
            String vnpayUrl = vnPayService.createOrder(
                    paymentRequest.getAmount(),
                    paymentRequest.getOrderInfo(),
                    paymentRequest.getBankcode(),
                    paymentRequest.getOrdertype(),
                    paymentRequest.getPromocode(),
                    paymentRequest.getTxnRef(),
                    clientIp
            );
            auditLogService.logOutbound(
                    VNPayAuditFlow.PAYMENT,
                    "PAYMENT_REDIRECT",
                    paymentRequest.getTxnRef(),
                    vnpayUrl,
                    "REDIRECT",
                    "amount=" + paymentRequest.getAmount()
                            + ", orderInfo=" + paymentRequest.getOrderInfo()
                            + ", bankCode=" + paymentRequest.getBankcode()
                            + ", orderType=" + paymentRequest.getOrdertype()
                            + ", promoCode=" + paymentRequest.getPromocode()
                            + ", clientIp=" + clientIp,
                    null,
                    null,
                    null,
                    null
            );
            log.info("Redirecting user to VNPAY URL: {}", vnpayUrl);
            return "redirect:" + vnpayUrl;

        } catch (IllegalArgumentException e) {
            log.warn("Validation error: {}", e.getMessage());
            model.addAttribute("error", e.getMessage());
            return "vnpay_pay";
        } catch (UnsupportedEncodingException e) {
            log.error("Error creating VNPAY URL", e);
            model.addAttribute("error", "Lỗi mã hóa URL, vui lòng thử lại.");
            return "vnpay_pay";
        }
    }

    // ------------------- 3. TRANG RETURN DUY NHẤT  -------------------
    @GetMapping("/vnpay-return")
    public String handleVnPayReturn(HttpServletRequest request, Model model) {

        Map<String, String> vnpParams = new HashMap<>();
        Enumeration<String> params = request.getParameterNames();
        while (params.hasMoreElements()) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            vnpParams.put(fieldName, fieldValue);
        }

        auditLogService.logInbound(
                VNPayAuditFlow.PAYMENT,
                "PAYMENT_RETURN",
                vnpParams.get("vnp_TxnRef"),
                VNPayUtils.getFullRequestUrl(request),
                request.getMethod(),
                VNPayUtils.getIpAddress(request),
                Optional.ofNullable(request.getHeader("User-Agent")).orElse("Unknown"),
                vnpParams
        );

        int paymentStatus = vnPayService.processVnPayReturn(vnpParams);

        String vnpAmountStr = vnpParams.get("vnp_Amount");

        if (vnpAmountStr != null && !vnpAmountStr.isEmpty()) {
            try {
                long vnpAmountLong = Long.parseLong(vnpAmountStr);
                model.addAttribute("vnp_Amount", vnpAmountLong);
            } catch (NumberFormatException e) {
                log.error("Error parsing vnp_Amount: {} to Long. Using default 0.", vnpAmountStr, e);
                model.addAttribute("vnp_Amount", 0L);
            }
        } else {
            model.addAttribute("vnp_Amount", 0L);
        }
        // ------------------------------------

        // Lấy các tham số VNPAY còn lại (không cần chuyển đổi)
        model.addAttribute("vnp_TxnRef", vnpParams.get("vnp_TxnRef"));
        model.addAttribute("vnp_OrderInfo", vnpParams.get("vnp_OrderInfo"));
        model.addAttribute("vnp_BankCode", vnpParams.get("vnp_BankCode"));
        model.addAttribute("vnp_PayDate", vnpParams.get("vnp_PayDate"));
        model.addAttribute("vnp_TransactionNo", vnpParams.get("vnp_TransactionNo"));
        model.addAttribute("vnp_TransactionStatus", vnpParams.get("vnp_TransactionStatus"));
        String responseCode = vnpParams.get("vnp_ResponseCode");
        model.addAttribute("vnp_ResponseCode", responseCode);

        model.addAttribute("signatureValid", paymentStatus != -1);

        if (paymentStatus == -1) {
            model.addAttribute("status", "fail");
            model.addAttribute("message", "Lỗi xác thực dữ liệu (Invalid Signature).");
        } else if (paymentStatus == 1) {
            model.addAttribute("status", "success");
            model.addAttribute("message", "Thanh toán thành công!");
        } else { // paymentStatus == 0 hoặc các mã lỗi khác
            model.addAttribute("status", "fail");
            model.addAttribute("message", "Giao dịch không thành công. Mã lỗi VNPAY: " + responseCode);
        }

        return "vnpay_return";
    }
    @RequestMapping(value = "/vnpay-ipn", method = {RequestMethod.GET, RequestMethod.POST})
    @ResponseBody
    public Map<String, String> handleVnPayIpn(HttpServletRequest request) {

        // 1. Lấy IP thực từ request (đã xử lý X-FORWARDED-FOR)
        String remoteIp = VNPayUtils.getIpAddress(request);

        // 1.1. Kiểm tra whitelist IP VNPAY
        if (!VNPayUtils.isTrustedVnPayIp(remoteIp)) {
            Map<String, String> vnpParams = new HashMap<>();
            Enumeration<String> paramsEnum = request.getParameterNames();
            while (paramsEnum.hasMoreElements()) {
                String fieldName = paramsEnum.nextElement();
                vnpParams.put(fieldName, request.getParameter(fieldName));
            }

            auditLogService.logInbound(
                    VNPayAuditFlow.PAYMENT,
                    "PAYMENT_IPN_REJECTED_IP",
                    vnpParams.get("vnp_TxnRef"),
                    VNPayUtils.getFullRequestUrl(request),
                    request.getMethod(),
                    remoteIp,
                    Optional.ofNullable(request.getHeader("User-Agent")).orElse("Unknown"),
                    vnpParams
            );

            Map<String, String> resp = new HashMap<>();
            resp.put("RspCode", "97");
            resp.put("Message", "IP Address not allowed");
            return resp;
        }

        // 2. Lấy tất cả tham số từ request
        Map<String, String> vnpParams = new HashMap<>();
        Enumeration<String> params = request.getParameterNames();
        while (params.hasMoreElements()) {
            String fieldName = params.nextElement();
            String fieldValue = request.getParameter(fieldName);
            vnpParams.put(fieldName, fieldValue);
        }

        auditLogService.logInbound(
                VNPayAuditFlow.PAYMENT,
                "PAYMENT_IPN",
                vnpParams.get("vnp_TxnRef"),
                VNPayUtils.getFullRequestUrl(request),
                request.getMethod(),
                remoteIp,
                Optional.ofNullable(request.getHeader("User-Agent")).orElse("Unknown"),
                vnpParams
        );

        log.info("Received VNPAY IPN Request: {}", vnpParams);

        // 2. Chuyển logic xử lý và cập nhật DB vào Service
        Map<String, String> ipnResponse = vnPayService.processVnPayIpn(vnpParams);

        // 3. Trả về JSON Response
        return ipnResponse;
    }


    // ------------------- 4. QUERY -------------------
    @PostMapping("/process-query")
    public String processQuery(
            @Valid QueryRequest queryRequest,
            BindingResult bindingResult,
            HttpServletRequest request,
            Model model) {

        if (bindingResult.hasErrors()) {
            model.addAttribute("error", "Vui lòng kiểm tra lại thông tin truy vấn.");
            return "vnpay_querydr";
        }

        String clientIp = VNPayUtils.getIpAddress(request);
        String resultJson = vnPayQuery.processQuery(
                queryRequest.getTxnRef(),
                queryRequest.getTransDate(),
                clientIp,
                queryRequest.getTransactionNo()
        );
        model.addAttribute("queryResult", resultJson);
        return "vnpay_query_result";
    }

    // ------------------- 5. REFUND -------------------
    @PostMapping("/process-refund")
    public String processRefund(
            @Valid RefundRequest refundRequest,
            BindingResult bindingResult,
            HttpServletRequest request,
            Model model) {

        if (bindingResult.hasErrors()) {
            model.addAttribute("error", "Vui lòng kiểm tra lại thông tin hoàn tiền.");
            return "vnpay_refund";
        }

        String clientIp = VNPayUtils.getIpAddress(request);
        String resultJson = vnPayRefund.sendRefundRequest(
                refundRequest.getTxnRef(),
                refundRequest.getTransactionNo(),
                refundRequest.getAmount(),
                refundRequest.getTransType(),
                refundRequest.getCreateBy(),
                refundRequest.getTransDate(),
                clientIp
        );
        model.addAttribute("refundResult", resultJson);
        return "vnpay_refund_result";
    }
}
