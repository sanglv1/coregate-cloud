package com.vnpay.springboot.payment.controller;

import com.vnpay.springboot.Util.VNPayUtils;
import com.vnpay.springboot.payment.entity.PaymentOrder;
import com.vnpay.springboot.payment.entity.PaymentStatus;
import com.vnpay.springboot.payment.repository.PaymentOrderEventRepository;
import com.vnpay.springboot.payment.repository.PaymentOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:h2:mem:vnpay_test;MODE=PostgreSQL;DB_CLOSE_DELAY=-1;DATABASE_TO_LOWER=TRUE",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.show-sql=false",
        "vnpay.tmn-code=TEST_TMN",
        "vnpay.secret-key=TEST_SECRET_KEY_123",
        "vnpay.return-url=http://localhost:9999/vnpay/vnpay-return",
        "vnpay.pay-url=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
        "vnpay.api-url=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction"
})
class VNPayReturnIpnDbIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PaymentOrderRepository paymentOrderRepository;

    @Autowired
    private PaymentOrderEventRepository paymentOrderEventRepository;

    @BeforeEach
    void clean() {
        paymentOrderEventRepository.deleteAll();
        paymentOrderRepository.deleteAll();
    }

    @Test
    void returnFlow_shouldUpdateOrderToSuccess_whenSignatureAndAmountValid() throws Exception {
        String txnRef = "RET_OK_001";
        PaymentOrder order = createPendingOrder(txnRef, 10000);
        paymentOrderRepository.save(order);

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Amount", "1000000");
        params.put("vnp_BankCode", "NCB");
        params.put("vnp_OrderInfo", "Return integration");
        params.put("vnp_PayDate", "20260409120000");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TmnCode", "TEST_TMN");
        params.put("vnp_TransactionNo", "123456789");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_TransactionStatus", "00");
        params.put("vnp_SecureHash", buildSecureHash(params, "TEST_SECRET_KEY_123"));

        mockMvc.perform(get("/vnpay/vnpay-return").params(toMultiValueMap(params)))
                .andExpect(status().isOk());

        PaymentOrder updated = paymentOrderRepository.findByTxnRef(txnRef).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(updated.getVnpResponseCode()).isEqualTo("00");
        assertThat(updated.getVnpTransactionNo()).isEqualTo("123456789");
    }

    @Test
    void ipnFlow_shouldUpdateOrderAndReturnRsp00_whenValidAndTrustedIp() throws Exception {
        String txnRef = "IPN_OK_001";
        PaymentOrder order = createPendingOrder(txnRef, 15000);
        paymentOrderRepository.save(order);

        Map<String, String> params = new HashMap<>();
        params.put("vnp_Amount", "1500000");
        params.put("vnp_BankCode", "NCB");
        params.put("vnp_OrderInfo", "IPN integration");
        params.put("vnp_PayDate", "20260409120100");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TmnCode", "TEST_TMN");
        params.put("vnp_TransactionNo", "987654321");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_TransactionStatus", "00");
        params.put("vnp_SecureHash", buildSecureHash(params, "TEST_SECRET_KEY_123"));

        mockMvc.perform(post("/vnpay/vnpay-ipn")
                        .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                        .header("X-FORWARDED-FOR", "113.160.92.202")
                        .params(toMultiValueMap(params)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.RspCode").value("00"))
                .andExpect(jsonPath("$.Message").value("Confirm Success"));

        PaymentOrder updated = paymentOrderRepository.findByTxnRef(txnRef).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo(PaymentStatus.SUCCESS);
        assertThat(updated.getVnpResponseCode()).isEqualTo("00");
    }

    private PaymentOrder createPendingOrder(String txnRef, long amount) {
        PaymentOrder order = new PaymentOrder();
        order.setTxnRef(txnRef);
        order.setAmount(amount);
        order.setOrderInfo("Integration test order");
        order.setOrderType("billpayment");
        order.setStatus(PaymentStatus.PENDING);
        order.setIpAddress("127.0.0.1");
        return order;
    }

    private String buildSecureHash(Map<String, String> params, String secretKey) {
        List<String> fieldNames = new ArrayList<>(params.keySet());
        fieldNames.sort(String::compareTo);
        StringBuilder hashData = new StringBuilder();
        for (String key : fieldNames) {
            if ("vnp_SecureHash".equalsIgnoreCase(key) || "vnp_SecureHashType".equalsIgnoreCase(key)) {
                continue;
            }
            String value = params.get(key);
            if (value == null || value.isEmpty()) {
                continue;
            }
            String encoded = URLEncoder.encode(value, StandardCharsets.UTF_8);
            hashData.append(key).append("=").append(encoded).append("&");
        }
        if (hashData.length() > 0) {
            hashData.setLength(hashData.length() - 1);
        }
        return VNPayUtils.hmacSHA512(secretKey, hashData.toString());
    }

    private MultiValueMap<String, String> toMultiValueMap(Map<String, String> params) {
        MultiValueMap<String, String> out = new LinkedMultiValueMap<>();
        params.forEach(out::add);
        return out;
    }
}
