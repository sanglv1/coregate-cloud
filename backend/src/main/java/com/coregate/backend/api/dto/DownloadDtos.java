package com.coregate.backend.api.dto;

import java.time.Instant;
import java.util.List;

public class DownloadDtos {
    public record AccessCodeResponse(
        String orderId,
        String accessCode,
        Instant expiresAt
    ) {}

    public record RedeemCodeRequest(String accessCode) {}

    public record DownloadLinkResponse(
        String productId,
        String fileName,
        String token,
        String downloadUrl,
        Instant expiresAt
    ) {}

    public record DownloadLinksPayload(
        String orderId,
        List<DownloadLinkResponse> items
    ) {}
}
