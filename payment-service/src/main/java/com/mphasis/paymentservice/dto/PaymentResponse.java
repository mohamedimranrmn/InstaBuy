package com.mphasis.paymentservice.dto;

public class PaymentResponse {

    private Long id;
    private String status;
    private String transactionId;
    private String message;
    private double amount;

    public PaymentResponse(Long id, String status,
                           String transactionId,
                           String message,
                           double amount) {
        this.id = id;
        this.status = status;
        this.transactionId = transactionId;
        this.message = message;
        this.amount = amount;
    }

    public Long getId() { return id; }
    public String getStatus() { return status; }
    public String getTransactionId() { return transactionId; }
    public String getMessage() { return message; }
    public double getAmount() { return amount; }
}