# Etapa 1: Compilación con Maven (el proyecto usa Java 21 y Spring Boot 4.x)
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Se copia primero el pom para aprovechar la caché de capas de Docker
COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests -B

# Etapa 2: Imagen de ejecución ligera (solo JRE)
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
