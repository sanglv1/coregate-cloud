package com.coregate.backend.service;

import com.coregate.backend.api.dto.DownloadDtos;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final boolean mailEnabled;
    private final String fromEmail;

    public EmailService(
        JavaMailSender mailSender,
        @Value("${app.mail.enabled:false}") boolean mailEnabled,
        @Value("${app.mail.from:no-reply@coregate.local}") String fromEmail
    ) {
        this.mailSender = mailSender;
        this.mailEnabled = mailEnabled;
        this.fromEmail = fromEmail;
    }

    public void sendDownloadLinks(String recipient, String orderId, List<DownloadDtos.DownloadLinkResponse> links) {
        if (!mailEnabled || recipient == null || recipient.isBlank() || links.isEmpty()) {
            return;
        }
        StringBuilder body = new StringBuilder();
        body.append("Cam on ban da thanh toan thanh cong don hang ").append(orderId).append(".\n\n");
        body.append("Danh sach link tai source code:\n");
        for (DownloadDtos.DownloadLinkResponse link : links) {
            body.append("- ").append(link.productId()).append(": ").append(link.downloadUrl()).append("\n");
        }
        body.append("\nLuu y: Link co han su dung den ").append(links.getFirst().expiresAt()).append(".");

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(recipient);
            message.setSubject("CoreGate - Link download source code");
            message.setText(body.toString());
            mailSender.send(message);
        } catch (Exception ex) {
            log.warn("Failed to send download email to {}", recipient, ex);
        }
    }

    public void sendDownloadAccessCode(String recipient, String orderId, String accessCode, java.time.Instant expiresAt) {
        if (!mailEnabled || recipient == null || recipient.isBlank()) {
            return;
        }
        String body = "Cam on ban da thanh toan thanh cong don hang " + orderId + ".\n\n"
            + "Ma nhan source code cua ban: " + accessCode + "\n"
            + "Han su dung ma: " + expiresAt + "\n\n"
            + "Vao trang nhap ma tren CoreGate de lay link tai file.";
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(recipient);
            message.setSubject("CoreGate - Ma nhan source code");
            message.setText(body);
            mailSender.send(message);
        } catch (Exception ex) {
            log.warn("Failed to send download access code to {}", recipient, ex);
        }
    }
}
