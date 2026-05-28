package com.vnpay.springboot.payment.service;

import com.vnpay.springboot.Config.VNPayConfig;
import com.vnpay.springboot.Util.VNPayUtils;
import com.vnpay.springboot.payment.entity.PaymentOrder;
import com.vnpay.springboot.payment.entity.PaymentStatus;
import com.vnpay.springboot.payment.repository.PaymentOrderEventRepository;
import com.vnpay.springboot.payment.repository.PaymentOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class VNPayServiceTest {

    private VNPayConfig config;
    private PaymentOrderRepository orderRepository;
    private PaymentOrderEventRepository eventRepository;
    private VNPayService service;

    @BeforeEach
    void setUp() {
        config = new VNPayConfig();
        config.setTmnCode("TEST_TMN");
        config.setSecretKey("HCDEW5K3A4PLRDZIIYJX5RN3VTZ0ASF7");
        config.setPayUrl("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html");
        config.setReturnUrl("http://localhost:9999/vnpay/vnpay-return");
        config.setApiUrl("https://sandbox.vnpayment.vn/merchant_webapi/api/transaction");

        orderRepository = mock(PaymentOrderRepository.class);
        eventRepository = mock(PaymentOrderEventRepository.class);
        service = new VNPayService(config, orderRepository, eventRepository);
    }

    @Test
    void createOrder_shouldThrowWhenTxnRefExists() {
        when(orderRepository.existsByTxnRef("DUP001")).thenReturn(true);

        assertThatThrownBy(() -> service.createOrder(
                10000, "Test", "", "billpayment", "", "DUP001", "127.0.0.1"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("đã tồn tại");

        verify(orderRepository, never()).save(any(PaymentOrder.class));
    }

    @Test
    void createOrder_shouldReturnPayUrlAndSaveOrder() throws Exception {
        when(orderRepository.existsByTxnRef("NEW001")).thenReturn(false);
        when(orderRepository.save(any(PaymentOrder.class))).thenAnswer(inv -> inv.getArgument(0));

        String url = service.createOrder(
                10000, "Thanh toan don hang", "NCB", "billpayment", "", "NEW001", "127.0.0.1");

        assertThat(url).contains(config.getPayUrl());
        assertThat(url).contains("vnp_TxnRef=NEW001");
        assertThat(url).contains("vnp_SecureHash=");
        assertThat(url).contains("vnp_Amount=1000000");

        verify(orderRepository).save(argThat(o -> "NEW001".equals(o.getTxnRef()) && o.getAmount() == 10000));
    }

    @Test
    void processVnPayReturn_shouldReturnNegative1WhenInvalidSignature() {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_TxnRef", "TEST001");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_Amount", "100000");
        params.put("vnp_SecureHash", "invalid_hash");

        int result = service.processVnPayReturn(params);

        assertThat(result).isEqualTo(-1);
        verify(eventRepository).save(any());
    }

    @Test
    void processVnPayReturn_shouldReturn0WhenOrderNotFound() throws Exception {
        Map<String, String> params = buildValidReturnParams("NOTFOUND", 100000);
        when(orderRepository.findByTxnRef("NOTFOUND")).thenReturn(Optional.empty());

        int result = service.processVnPayReturn(params);

        assertThat(result).isEqualTo(0);
    }

    @Test
    void processVnPayReturn_shouldReturn1WhenSuccess() throws Exception {
        Map<String, String> params = buildValidReturnParams("SUCCESS001", 1000000); // 10000 VND * 100
        PaymentOrder order = new PaymentOrder();
        order.setTxnRef("SUCCESS001");
        order.setAmount(10000); // 10000 VND -> minor = 1000000
        order.setStatus(PaymentStatus.PENDING);
        when(orderRepository.findByTxnRef("SUCCESS001")).thenReturn(Optional.of(order));
        when(orderRepository.save(any(PaymentOrder.class))).thenAnswer(inv -> inv.getArgument(0));

        int result = service.processVnPayReturn(params);

        assertThat(result).isEqualTo(1);
        verify(orderRepository).save(argThat(o -> o.getStatus() == PaymentStatus.SUCCESS));
    }

    @Test
    void processVnPayIpn_shouldReturn01WhenOrderNotFound() throws Exception {
        Map<String, String> params = buildValidReturnParams("IPN_NF", 100000);
        when(orderRepository.findByTxnRef("IPN_NF")).thenReturn(Optional.empty());

        Map<String, String> resp = service.processVnPayIpn(params);

        assertThat(resp.get("RspCode")).isEqualTo("01");
        assertThat(resp.get("Message")).contains("Order not Found");
    }

    @Test
    void processVnPayIpn_shouldReturn97WhenInvalidSignature() {
        Map<String, String> params = new HashMap<>();
        params.put("vnp_TxnRef", "IPN001");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_Amount", "100000");
        params.put("vnp_SecureHash", "invalid");

        Map<String, String> resp = service.processVnPayIpn(params);

        assertThat(resp.get("RspCode")).isEqualTo("97");
        assertThat(resp.get("Message")).contains("Invalid");
    }

    private Map<String, String> buildValidReturnParams(String txnRef, long amountMinor) throws Exception {
        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Amount", String.valueOf(amountMinor));
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_TransactionNo", "12345");
        params.put("vnp_PayDate", "20260304120000");

        StringBuilder hashData = new StringBuilder();
        for (Map.Entry<String, String> e : params.entrySet()) {
            String enc = URLEncoder.encode(e.getValue(), StandardCharsets.UTF_8.toString());
            hashData.append(e.getKey()).append('=').append(enc).append('&');
        }
        if (hashData.length() > 0) hashData.setLength(hashData.length() - 1);
        String hash = VNPayUtils.hmacSHA512(config.getSecretKey(), hashData.toString());
        params.put("vnp_SecureHash", hash);
        return new HashMap<>(params);
    }
}
