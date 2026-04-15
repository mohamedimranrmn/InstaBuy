package com.mphasis.paymentservice.dto;

public class PaymentResponse {

    private String status;
    private String transactionId;
    private String message;
    private double amount;

    public PaymentResponse() {}

    public PaymentResponse(String status, String transactionId, String message) {
        this.status = status;
        this.transactionId = transactionId;
        this.message = message;
    }

    public PaymentResponse(String status, String transactionId, String message, double amount) {
        this.status = status;
        this.transactionId = transactionId;
        this.message = message;
        this.amount = amount;
    }

    public String getStatus() {
        return status;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public String getMessage() {
        return message;
    }

    public double getAmount() {
        return amount;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = transactionId;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }
}