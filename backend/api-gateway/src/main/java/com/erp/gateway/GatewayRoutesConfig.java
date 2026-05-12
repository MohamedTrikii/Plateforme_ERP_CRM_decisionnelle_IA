package com.erp.gateway;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRoutesConfig {

    private static final String CORE_SERVICE_URI = "http://localhost:8082";

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("auth-service", r -> r.path("/api/v1/auth/**")
                        .uri("http://localhost:8081"))
                .route("core-service-customers", r -> r.path("/api/v1/customers/**")
                        .uri(CORE_SERVICE_URI))
                .route("core-service-products", r -> r.path("/api/v1/products/**")
                        .uri(CORE_SERVICE_URI))
                .route("core-service-orders", r -> r.path("/api/v1/orders/**")
                        .uri(CORE_SERVICE_URI))
                .route("core-service-stock", r -> r.path("/api/v1/stock/**")
                        .uri(CORE_SERVICE_URI))
                .route("core-service-config", r -> r.path("/api/v1/config/**")
                        .uri(CORE_SERVICE_URI))
                .route("core-service-dashboard", r -> r.path("/api/v1/dashboard/**")
                        .uri(CORE_SERVICE_URI))
                .route("core-service-audit", r -> r.path("/api/v1/audit/**")
                        .uri(CORE_SERVICE_URI))
                .route("ai-service", r -> r.path("/api/v1/ai/**")
                        .filters(f -> f.stripPrefix(3))
                        .uri("http://localhost:8000"))
                .build();
    }
}
