package com.mphasis.orderservice.config;

import feign.Client;
import okhttp3.OkHttpClient;
import org.springframework.cloud.client.loadbalancer.LoadBalancerClient;
import org.springframework.cloud.loadbalancer.support.LoadBalancerClientFactory;
import org.springframework.cloud.openfeign.loadbalancer.FeignBlockingLoadBalancerClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FeignOkHttpConfig {

    @Bean
    public OkHttpClient okHttpClient() {
        return new OkHttpClient.Builder().build();
    }

    @Bean
    public Client feignClient(LoadBalancerClient loadBalancerClient,
                              LoadBalancerClientFactory loadBalancerClientFactory) {
        feign.okhttp.OkHttpClient okHttpClient =
                new feign.okhttp.OkHttpClient(okHttpClient());

        return new FeignBlockingLoadBalancerClient(
                okHttpClient,
                loadBalancerClient,
                loadBalancerClientFactory
        );
    }
}