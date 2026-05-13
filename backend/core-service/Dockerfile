FROM maven:3.9.9-eclipse-temurin-23-alpine AS build
WORKDIR /app
COPY pom.xml ./
COPY auth-service/pom.xml auth-service/pom.xml
COPY api-gateway/pom.xml  api-gateway/pom.xml
COPY core-service/pom.xml core-service/pom.xml
COPY core-service/src core-service/src
RUN --mount=type=cache,target=/root/.m2 \
    mvn -f core-service/pom.xml package -DskipTests -q

FROM eclipse-temurin:23-jre-alpine
WORKDIR /app
COPY --from=build /app/core-service/target/*.jar app.jar
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
