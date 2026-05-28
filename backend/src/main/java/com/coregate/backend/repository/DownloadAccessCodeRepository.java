package com.coregate.backend.repository;

import com.coregate.backend.domain.DownloadAccessCodeEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface DownloadAccessCodeRepository extends JpaRepository<DownloadAccessCodeEntity, UUID> {
    Optional<DownloadAccessCodeEntity> findByOrderId(UUID orderId);

    Optional<DownloadAccessCodeEntity> findByAccessCode(String accessCode);
}
