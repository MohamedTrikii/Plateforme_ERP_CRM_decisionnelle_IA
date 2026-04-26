package com.erp.core;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Core Service – Entry Point
 * Manages Customers, Products, Orders, Stock, SystemConfig and AuditLogs.
 */
@SpringBootApplication
@EnableJpaAuditing
public class CoreServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CoreServiceApplication.class, args);
    }
}
