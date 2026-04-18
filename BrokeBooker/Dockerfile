# syntax=docker/dockerfile:1.7

# ---------- Stage 1: build the Spring Boot jar ----------
FROM maven:3.9-eclipse-temurin-21 AS build

WORKDIR /app

# Warm the dependency cache. Copying pom.xml + wrapper first lets Docker reuse
# this layer whenever source code changes but dependencies don't.
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw mvnw
RUN chmod +x mvnw \
 && ./mvnw -q -B -e dependency:go-offline

# Now the source — any change here invalidates only from this layer down.
COPY src src
RUN ./mvnw -q -B -DskipTests package \
 && mv target/BrokeBooker-*.jar target/app.jar


# ---------- Stage 2: slim runtime image ----------
FROM eclipse-temurin:21-jre-jammy AS runtime

# Non-root user for security.
RUN groupadd -r spring && useradd -r -g spring spring

WORKDIR /app
COPY --from=build --chown=spring:spring /app/target/app.jar /app/app.jar

USER spring

# Render (and most PaaS) inject $PORT. application.properties reads it via
# server.port=${PORT:8080}, so nothing more to wire here — Render will route
# inbound HTTPS to this container port.
EXPOSE 8080

# JAVA_OPTS is empty by default; override at runtime to tune memory, e.g.
#   -XX:MaxRAMPercentage=75 -XX:+UseG1GC
ENV JAVA_OPTS=""

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
