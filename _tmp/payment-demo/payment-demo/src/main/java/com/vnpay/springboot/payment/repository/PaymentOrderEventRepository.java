package com.vnpay.springboot.payment.repository;

import com.vnpay.springboot.payment.entity.PaymentOrderEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentOrderEventRepository extends JpaRepository<PaymentOrderEvent, Long> {
    List<PaymentOrderEvent> findTop50ByTxnRefOrderByCreatedAtDesc(String txnRef);
}

