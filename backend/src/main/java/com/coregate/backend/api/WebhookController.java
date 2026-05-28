package com.coregate.backend.api;

import com.coregate.backend.service.VnpayService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
public class WebhookController {
    private final VnpayService vnpayService;

    public WebhookController(VnpayService vnpayService) {
        this.vnpayService = vnpayService;
    }

    @PostMapping(value = "/vnpay", produces = MediaType.APPLICATION_JSON_VALUE)
    public String handleVnpayIpn(@RequestParam Map<String, String> params) {
        return vnpayService.handleIpn(params);
    }
}
