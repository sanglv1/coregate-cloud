package com.coregate.backend.repository;

import com.coregate.backend.domain.DownloadTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DownloadTokenRepository extends JpaRepository<DownloadTokenEntity, UUID> {
    Optional<DownloadTokenEntity> findByToken(String token);

    Optional<DownloadTokenEntity> findByOrderIdAndProductId(UUID orderId, String productId);

    List<DownloadTokenEntity> findByOrderId(UUID orderId);
}
