package com.vnpay.springboot.payment.controller;

import com.vnpay.springboot.audit.service.VNPayAuditLogService;
import com.vnpay.springboot.payment.service.VNPayQuery;
import com.vnpay.springboot.payment.service.VNPayRefund;
import com.vnpay.springboot.payment.service.VNPayService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = VNPayController.class)
@TestPropertySource(properties = {
        "vnpay.tmn-code=TEST_TMN",
        "vnpay.secret-key=HCDEW5K3A4PLRDZIIYJX5RN3VTZ0ASF7",
        "vnpay.pay-url=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
        "vnpay.return-url=http://localhost:9999/vnpay/vnpay-return",
        "vnpay.api-url=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction"
})
class VNPayControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private VNPayService vnPayService;

    @MockBean
    private VNPayQuery vnPayQuery;

    @MockBean
    private VNPayRefund vnPayRefund;

    @MockBean
    private VNPayAuditLogService auditLogService;

    @Test
    void getPay_shouldReturn200AndView() throws Exception {
        mockMvc.perform(get("/vnpay/pay"))
                .andExpect(status().isOk())
                .andExpect(view().name("vnpay_pay"));
    }

    @Test
    void postSubmitOrder_shouldRedirectWhenValid() throws Exception {
        when(vnPayService.createOrder(anyLong(), anyString(), any(), anyString(), any(), anyString(), anyString()))
                .thenReturn("https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_TxnRef=TEST001");

        mockMvc.perform(post("/vnpay/submitOrder")
                        .param("txnRef", "TEST001")
                        .param("amount", "10000")
                        .param("orderInfo", "Thanh toan don hang")
                        .param("ordertype", "billpayment"))
                .andExpect(status().is3xxRedirection())
                .andExpect(result -> assertThat(result.getResponse().getRedirectedUrl())
                        .contains("sandbox.vnpayment.vn"));
    }

    @Test
    void postSubmitOrder_shouldReturnFormWhenValidationFails() throws Exception {
        mockMvc.perform(post("/vnpay/submitOrder")
                        .param("txnRef", "")
                        .param("amount", "5000")  // below min 10000
                        .param("orderInfo", "Test")
                        .param("ordertype", "billpayment"))
                .andExpect(status().isOk())
                .andExpect(view().name("vnpay_pay"));
    }

    @Test
    void getQuery_shouldReturn200() throws Exception {
        mockMvc.perform(get("/vnpay/query"))
                .andExpect(status().isOk())
                .andExpect(view().name("vnpay_querydr"));
    }

    @Test
    void getRefund_shouldReturn200() throws Exception {
        mockMvc.perform(get("/vnpay/refund"))
                .andExpect(status().isOk())
                .andExpect(view().name("vnpay_refund"));
    }
}
