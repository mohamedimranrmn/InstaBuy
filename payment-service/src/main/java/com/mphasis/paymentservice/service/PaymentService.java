package com.mphasis.paymentservice.service;

import com.mphasis.paymentservice.client.OrderClient;
import com.mphasis.paymentservice.model.*;
import com.mphasis.paymentservice.exception.*;
import com.mphasis.paymentservice.dao.PaymentRepository;
import com.mphasis.paymentservice.dto.*;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import jakarta.transaction.Transactional;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository repo;
    private final RazorpayClient razorpayClient;
    private final OrderClient orderClient;

    @Value("${razorpay.secret}")
    private String razorpaySecret;

    public PaymentService(PaymentRepository repo,
                          RazorpayClient razorpayClient,
                          OrderClient orderClient) {
        this.repo = repo;
        this.razorpayClient = razorpayClient;
        this.orderClient = orderClient;
    }

    private void disableSSLVerification() {
        try {
            javax.net.ssl.TrustManager[] trustAllCerts = new javax.net.ssl.TrustManager[]{
                    new javax.net.ssl.X509TrustManager() {
                        public java.security.cert.X509Certificate[] getAcceptedIssuers() { return null; }
                        public void checkClientTrusted(java.security.cert.X509Certificate[] certs, String authType) {}
                        public void checkServerTrusted(java.security.cert.X509Certificate[] certs, String authType) {}
                    }
            };

            javax.net.ssl.SSLContext sc = javax.net.ssl.SSLContext.getInstance("TLS");
            sc.init(null, trustAllCerts, new java.security.SecureRandom());
            javax.net.ssl.HttpsURLConnection.setDefaultSSLSocketFactory(sc.getSocketFactory());
            javax.net.ssl.HttpsURLConnection.setDefaultHostnameVerifier((hostname, session) -> true);

            log.warn("SSL validation DISABLED (DEV MODE)");

        } catch (Exception e) {
            throw new ExternalServiceException("SSL configuration failed");
        }
    }

    private String hmacSHA256(String data, String secret) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            mac.init(new javax.crypto.spec.SecretKeySpec(secret.getBytes(), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes());
            return new String(org.apache.commons.codec.binary.Hex.encodeHex(hash));
        } catch (Exception e) {
            throw new PaymentException("Signature generation failed");
        }
    }

    public List<PaymentResponse> getAllPayments() {

        return repo.findAll()
                .stream()
                .map(p -> new PaymentResponse(
                        p.getId(),
                        p.getOrderId(),
                        p.getStatus().name(),
                        p.getTransactionId(),
                        "Fetched",
                        p.getAmount()
                ))
                .toList();
    }

    public PaymentResponse getPaymentByOrderId(Long orderId) {

        Payment payment = repo.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentNotFoundException(orderId));

        return new PaymentResponse(
                payment.getId(),
                payment.getOrderId(),
                payment.getStatus().name(),
                payment.getTransactionId(),
                "Fetched",
                payment.getAmount()
        );
    }

    public PaymentResponse createRazorpayOrder(PaymentRequest request) {

        Long orderId = request.getOrderId();

        log.info("Fetching order from OrderService: {}", orderId);

        OrderResponse order = orderClient.getOrder(orderId);

        if (!"PAYMENT_PENDING".equals(order.getStatus())) {
            throw new InvalidPaymentStateException("Order not in PAYMENT_PENDING state");
        }

        var existing = repo.findByOrderId(orderId);

        if (existing.isPresent()) {
            Payment p = existing.get();

            log.warn("Payment already exists for orderId={} with status={}", orderId, p.getStatus());

            if (p.getStatus() == PaymentStatus.SUCCESS) {
                return new PaymentResponse(p.getId(),
                        p.getOrderId(),
                        "SUCCESS",
                        p.getTransactionId(),
                        "Payment already completed",
                        p.getAmount()
                );
            }

            return new PaymentResponse(
                    p.getId(),
                    p.getOrderId(),
                    "PENDING",
                    p.getTransactionId(),
                    "Reusing existing payment",
                    p.getAmount()
            );
        }

        Payment payment = new Payment();
        payment.setOrderId(orderId);
        payment.setUserId(order.getUserId());
        payment.setAmount(order.getTotalAmount());
        payment.setStatus(PaymentStatus.INITIATED);
        payment.setCreatedAt(LocalDateTime.now());

        repo.save(payment);

        try {
            JSONObject options = new JSONObject();
            options.put("amount", (int) (order.getTotalAmount() * 100));
            options.put("currency", "INR");
            options.put("receipt", "order_" + orderId);

            disableSSLVerification();

            Order razorOrder = razorpayClient.orders.create(options);

            String razorpayOrderId = razorOrder.get("id");

            payment.setTransactionId(razorpayOrderId);
            repo.save(payment);

            log.info("Razorpay order created: {}", razorpayOrderId);

            return new PaymentResponse(
                    payment.getId(),
                    payment.getOrderId(),
                    "PENDING",
                    razorpayOrderId,
                    "Order created",
                    order.getTotalAmount()
            );

        } catch (Exception e) {
            log.error("Razorpay error", e);

            payment.setStatus(PaymentStatus.FAILED);
            repo.save(payment);
            orderClient.failOrder(orderId);
            throw new ExternalServiceException("Razorpay error");
        }
    }

    public void confirmPayment(ConfirmRequest request) {

        Payment payment = repo.findByOrderId(request.getOrderId())
                .orElseThrow(() -> new PaymentNotFoundException(request.getOrderId()));

        try {
            String data = request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId();

            String generatedSignature = hmacSHA256(data, razorpaySecret);

            if (!generatedSignature.equals(request.getRazorpaySignature())) {
                throw new InvalidSignatureException();
            }

            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setTransactionId(request.getRazorpayPaymentId());
            repo.save(payment);

            log.info("Payment SUCCESS for order {}", request.getOrderId());

            orderClient.confirmOrder(request.getOrderId());

        } catch (InvalidSignatureException ex) {
            throw ex;

        } catch (Exception e) {

            log.error("Payment verification failed for order {}", request.getOrderId(), e);

            payment.setStatus(PaymentStatus.FAILED);
            repo.save(payment);
            orderClient.failOrder(request.getOrderId());

            throw new PaymentException("Payment verification failed");
        }
    }

    @Transactional
    public void refund(Long orderId) {

        Payment payment = repo.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentNotFoundException(orderId));

        if (payment.getStatus() == PaymentStatus.REFUNDED) {
            log.info("Already refunded {}", orderId);
            return;
        }

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new InvalidPaymentStateException(
                    "Cannot refund payment in state: " + payment.getStatus()
            );
        }

        try {
            log.info("Refund initiated for order {}", orderId);

            payment.setStatus(PaymentStatus.REFUNDED);
            repo.save(payment);

            log.info("Refund completed for order {}", orderId);

        } catch (Exception e) {
            log.error("Refund failed for order {}", orderId, e);
            throw new PaymentException("Refund failed");
        }
    }

    public void handlePaymentFailure(Long orderId) {

        Payment payment = repo.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentNotFoundException(orderId));

        payment.setStatus(PaymentStatus.FAILED);
        repo.save(payment);

        orderClient.failOrder(orderId);

        log.info("Payment failed handled for order {}", orderId);
    }

    public void reversePayment(Long orderId) {

        Payment payment = repo.findByOrderId(orderId)
                .orElseThrow(() -> new PaymentNotFoundException(orderId));

        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new InvalidPaymentStateException("Cannot reverse non-success payment");
        }

        payment.setStatus(PaymentStatus.REVERSED);
        repo.save(payment);
    }
}
