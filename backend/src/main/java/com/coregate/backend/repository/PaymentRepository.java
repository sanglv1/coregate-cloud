package com.coregate.backend.repository;

import com.coregate.backend.domain.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<PaymentEntity, UUID> {
    Optional<PaymentEntity> findByTxnRef(String txnRef);
    Optional<PaymentEntity> findByOrderId(UUID orderId);
}
