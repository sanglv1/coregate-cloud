package com.coregate.backend.service;

import com.coregate.backend.api.dto.DownloadDtos;
import com.coregate.backend.domain.DownloadAccessCodeEntity;
import com.coregate.backend.domain.DownloadTokenEntity;
import com.coregate.backend.domain.OrderEntity;
import com.coregate.backend.domain.OrderItemEntity;
import com.coregate.backend.domain.OrderStatus;
import com.coregate.backend.repository.DownloadAccessCodeRepository;
import com.coregate.backend.repository.DownloadTokenRepository;
import com.coregate.backend.repository.OrderItemRepository;
import com.coregate.backend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
public class DownloadService {
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final DownloadAccessCodeRepository downloadAccessCodeRepository;
    private final DownloadTokenRepository downloadTokenRepository;
    private final EmailService emailService;
    private final ProductArchiveService productArchiveService;
    private final String publicBaseUrl;

    public DownloadService(
        OrderRepository orderRepository,
        OrderItemRepository orderItemRepository,
        DownloadAccessCodeRepository downloadAccessCodeRepository,
        DownloadTokenRepository downloadTokenRepository,
        EmailService emailService,
        ProductArchiveService productArchiveService,
        @Value("${app.download.public-base-url:http://localhost:8080}") String publicBaseUrl
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.downloadAccessCodeRepository = downloadAccessCodeRepository;
        this.downloadTokenRepository = downloadTokenRepository;
        this.emailService = emailService;
        this.productArchiveService = productArchiveService;
        this.publicBaseUrl = publicBaseUrl;
    }

    @Transactional
    public DownloadDtos.AccessCodeResponse issueLinksForCompletedOrder(UUID orderId) {
        OrderEntity order = orderRepository.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new IllegalStateException("Order is not completed");
        }

        List<OrderItemEntity> items = orderItemRepository.findByOrderId(orderId);
        Instant expiresAt = Instant.now().plus(7, ChronoUnit.DAYS);
        List<DownloadDtos.DownloadLinkResponse> links = new ArrayList<>();

        for (OrderItemEntity item : items) {
            DownloadTokenEntity tokenEntity = downloadTokenRepository
                .findByOrderIdAndProductId(orderId, item.getProductId())
                .orElseGet(() -> createToken(order, item, expiresAt));

            links.add(toResponse(tokenEntity));
        }

        DownloadAccessCodeEntity accessCodeEntity = downloadAccessCodeRepository.findByOrderId(orderId)
            .orElseGet(() -> createAccessCode(order, expiresAt));
        emailService.sendDownloadAccessCode(
            order.getCustomerEmail(),
            orderId.toString(),
            accessCodeEntity.getAccessCode(),
            accessCodeEntity.getExpiresAt()
        );
        return new DownloadDtos.AccessCodeResponse(
            orderId.toString(),
            accessCodeEntity.getAccessCode(),
            accessCodeEntity.getExpiresAt()
        );
    }

    @Transactional(readOnly = true)
    public DownloadDtos.DownloadLinksPayload listLinks(UUID orderId) {
        List<DownloadDtos.DownloadLinkResponse> links = downloadTokenRepository.findByOrderId(orderId)
            .stream()
            .map(this::toResponse)
            .toList();
        return new DownloadDtos.DownloadLinksPayload(orderId.toString(), links);
    }

    @Transactional(readOnly = true)
    public DownloadDtos.AccessCodeResponse getAccessCode(UUID orderId) {
        DownloadAccessCodeEntity accessCode = downloadAccessCodeRepository.findByOrderId(orderId)
            .orElseThrow(() -> new IllegalArgumentException("Access code not found"));
        if (accessCode.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalStateException("Access code expired");
        }
        return new DownloadDtos.AccessCodeResponse(
            orderId.toString(),
            accessCode.getAccessCode(),
            accessCode.getExpiresAt()
        );
    }

    @Transactional(readOnly = true)
    public DownloadDtos.DownloadLinksPayload redeemCode(String accessCodeInput) {
        DownloadAccessCodeEntity accessCode = downloadAccessCodeRepository.findByAccessCode(accessCodeInput)
            .orElseThrow(() -> new IllegalArgumentException("Invalid access code"));
        if (accessCode.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalStateException("Access code expired");
        }
        return listLinks(accessCode.getOrderId());
    }

    @Transactional(readOnly = true)
    public DownloadTokenEntity getByToken(String token) {
        DownloadTokenEntity entity = downloadTokenRepository.findByToken(token)
            .orElseThrow(() -> new IllegalArgumentException("Download token not found"));
        if (entity.getExpiresAt().isBefore(Instant.now())) {
            throw new IllegalStateException("Download token expired");
        }
        return entity;
    }

    private DownloadTokenEntity createToken(OrderEntity order, OrderItemEntity item, Instant expiresAt) {
        DownloadTokenEntity token = new DownloadTokenEntity();
        token.setId(UUID.randomUUID());
        token.setOrderId(order.getId());
        token.setProductId(item.getProductId());
        token.setToken(UUID.randomUUID().toString().replace("-", ""));
        token.setEmail(order.getCustomerEmail());
        token.setExpiresAt(expiresAt);
        return downloadTokenRepository.save(token);
    }

    private DownloadAccessCodeEntity createAccessCode(OrderEntity order, Instant expiresAt) {
        DownloadAccessCodeEntity accessCode = new DownloadAccessCodeEntity();
        accessCode.setId(UUID.randomUUID());
        accessCode.setOrderId(order.getId());
        accessCode.setEmail(order.getCustomerEmail());
        accessCode.setExpiresAt(expiresAt);
        accessCode.setAccessCode(generateAccessCode());
        return downloadAccessCodeRepository.save(accessCode);
    }

    private DownloadDtos.DownloadLinkResponse toResponse(DownloadTokenEntity tokenEntity) {
        String fileName = resolveArchiveFileName(tokenEntity.getProductId());
        String downloadUrl = publicBaseUrl + "/api/downloads/file/" + tokenEntity.getToken();
        return new DownloadDtos.DownloadLinkResponse(
            tokenEntity.getProductId(),
            fileName,
            tokenEntity.getToken(),
            downloadUrl,
            tokenEntity.getExpiresAt()
        );
    }

    public String resolveArchiveFileName(String productId) {
        return productArchiveService.resolveFileName(productId);
    }

    private String generateAccessCode() {
        String seed = UUID.randomUUID().toString().replace("-", "").toUpperCase(Locale.ROOT);
        return "CG-" + seed.substring(0, 10);
    }
}
