package com.mphasis.paymentservice.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ErrorResponse> handleBaseException(BaseException ex) {
        return ResponseEntity.status(ex.getStatus())
                .body(new ErrorResponse(
                        ex.getErrorCode(),
                        ex.getMessage(),
                        System.currentTimeMillis()
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        return ResponseEntity.status(500)
                .body(new ErrorResponse(
                        "INTERNAL_SERVER_ERROR",
                        "Something went wrong",
                        System.currentTimeMillis()
                ));
    }
}