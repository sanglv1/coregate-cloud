package com.vnpay.springboot.Config;

import com.vnpay.springboot.audit.entity.VNPayAuditFlow;
import com.vnpay.springboot.audit.service.VNPayUrlConfigService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

/**
 * Logs Return URL and IPN URL for this standalone demo.
 */
@Component
@Order(1)
public class VNPayUrlStartupLogger implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(VNPayUrlStartupLogger.class);

    private final VNPayConfig vnPayConfig;
    private final VNPayUrlConfigService urlConfigService;

    public VNPayUrlStartupLogger(VNPayConfig vnPayConfig, VNPayUrlConfigService urlConfigService) {
        this.vnPayConfig = vnPayConfig;
        this.urlConfigService = urlConfigService;
    }

    @Override
    public void run(ApplicationArguments args) {
        String returnUrl = vnPayConfig.getReturnUrl();
        String ipnUrl = returnUrl.replace("/vnpay-return", "/vnpay-ipn");
        urlConfigService.saveUrlConfig(VNPayAuditFlow.PAYMENT, returnUrl, ipnUrl);
        log.info("=== VNPAY PAY Demo Return URL & IPN URL ===");
        log.info("Return URL: {}", returnUrl);
        log.info("IPN URL:    {}", ipnUrl);
    }
}