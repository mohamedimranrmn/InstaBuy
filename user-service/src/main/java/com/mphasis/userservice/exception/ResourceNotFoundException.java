package com.mphasis.userservice.exception;

public class ResourceNotFoundException extends BaseException {

    public ResourceNotFoundException(String resource) {
        super(resource + " not found", "NOT_FOUND", 404);
    }
}
