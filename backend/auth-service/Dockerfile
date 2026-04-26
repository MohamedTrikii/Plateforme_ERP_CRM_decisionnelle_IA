# Multi-stage build for Spring Boot services
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy parent POM + module POMs first (Docker layer caching)
COPY pom.xml ./
COPY auth-service/pom.xml auth-service/pom.xml
COPY api-gateway/pom.xml  api-gateway/pom.xml
COPY core-service/pom.xml core-service/pom.xml

# Download dependencies
RUN --mount=type=cache,target=/root/.m2 \
    mvn -f pom.xml dependency:go-offline -pl auth-service -am -q 2>/dev/null || true

# Copy source & build
COPY auth-service/src auth-service/src
RUN --mount=type=cache,target=/root/.m2 \
    mvn -f auth-service/pom.xml package -DskipTests -q

# ── Runtime image ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/auth-service/target/*.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "app.jar"]
