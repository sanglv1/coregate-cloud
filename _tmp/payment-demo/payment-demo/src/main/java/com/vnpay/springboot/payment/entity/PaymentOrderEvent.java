package com.vnpay.springboot.payment.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_order_events", indexes = {
        @Index(name = "idx_payment_order_events_txn_ref_created", columnList = "txn_ref, created_at"),
        @Index(name = "idx_payment_order_events_event_type", columnList = "event_type"),
        @Index(name = "idx_payment_order_events_signature_valid", columnList = "signature_valid")
})
public class PaymentOrderEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "txn_ref", nullable = false, length = 64)
    private String txnRef;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 10)
    private PaymentOrderEventType eventType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_order_id")
    private PaymentOrder paymentOrder;

    @Column(name = "signature_valid", nullable = false)
    private boolean signatureValid;

    @Column(name = "amount_minor")
    private Long amountMinor;

    @Column(name = "response_code", length = 10)
    private String responseCode;

    @Column(name = "transaction_no", length = 32)
    private String transactionNo;

    @Column(name = "pay_date", length = 20)
    private String payDate;

    @Column(name = "bank_code", length = 30)
    private String bankCode;

    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    @Lob
    @Column(name = "raw_params", columnDefinition = "TEXT")
    private String rawParams;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getTxnRef() {
        return txnRef;
    }

    public void setTxnRef(String txnRef) {
        this.txnRef = txnRef;
    }

    public PaymentOrderEventType getEventType() {
        return eventType;
    }

    public void setEventType(PaymentOrderEventType eventType) {
        this.eventType = eventType;
    }

    public PaymentOrder getPaymentOrder() {
        return paymentOrder;
    }

    public void setPaymentOrder(PaymentOrder paymentOrder) {
        this.paymentOrder = paymentOrder;
    }

    public boolean isSignatureValid() {
        return signatureValid;
    }

    public void setSignatureValid(boolean signatureValid) {
        this.signatureValid = signatureValid;
    }

    public Long getAmountMinor() {
        return amountMinor;
    }

    public void setAmountMinor(Long amountMinor) {
        this.amountMinor = amountMinor;
    }

    public String getResponseCode() {
        return responseCode;
    }

    public void setResponseCode(String responseCode) {
        this.responseCode = responseCode;
    }

    public String getTransactionNo() {
        return transactionNo;
    }

    public void setTransactionNo(String transactionNo) {
        this.transactionNo = transactionNo;
    }

    public String getPayDate() {
        return payDate;
    }

    public void setPayDate(String payDate) {
        this.payDate = payDate;
    }

    public String getBankCode() {
        return bankCode;
    }

    public void setBankCode(String bankCode) {
        this.bankCode = bankCode;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public String getRawParams() {
        return rawParams;
    }

    public void setRawParams(String rawParams) {
        this.rawParams = rawParams;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}

