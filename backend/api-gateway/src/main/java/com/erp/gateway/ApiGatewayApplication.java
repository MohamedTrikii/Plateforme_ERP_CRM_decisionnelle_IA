package com.erp.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * API Gateway – single entry point for the ERP platform.
 *
 * Routes all /api/v1/* traffic to the appropriate microservice.
 * Provides: routing, CORS, rate limiting, load balancing.
 */
@SpringBootApplication
public class ApiGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
