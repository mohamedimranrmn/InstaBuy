package com.mphasis.userservice.util;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
public class LogClient {

    private final RestTemplate restTemplate;

    public LogClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void sendLog(String action, String user, String entity, Long id, String details) {

        Map<String, Object> log = new HashMap<>();
        log.put("service", "user-service");
        log.put("action", action);
        log.put("username", user);
        log.put("entity", entity);
        log.put("entityId", id);
        log.put("details", details);

        restTemplate.postForObject("http://localhost:8085/logs", log, Object.class);
    }
}