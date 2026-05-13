FROM maven:3.9.9-eclipse-temurin-23-alpine AS build
WORKDIR /app
COPY pom.xml ./
COPY auth-service/pom.xml auth-service/pom.xml
COPY api-gateway/pom.xml  api-gateway/pom.xml
COPY core-service/pom.xml core-service/pom.xml
COPY api-gateway/src api-gateway/src
RUN --mount=type=cache,target=/root/.m2 \
    mvn -f api-gateway/pom.xml package -DskipTests -q

FROM eclipse-temurin:23-jre-alpine
WORKDIR /app
COPY --from=build /app/api-gateway/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
