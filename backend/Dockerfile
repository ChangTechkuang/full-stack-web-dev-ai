# syntax=docker/dockerfile:1.7

# --- Build stage --------------------------------------------------------------
# Uses the Gradle wrapper already in the repo so the host toolchain doesn't matter.
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /workspace

# Cache Gradle deps independently of source changes.
COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle
RUN chmod +x gradlew && ./gradlew --no-daemon dependencies > /dev/null 2>&1 || true

COPY src ./src
RUN ./gradlew --no-daemon clean bootJar -x test

# --- Runtime stage ------------------------------------------------------------
# JRE-only image keeps the final layer small (~230 MB vs ~450 MB for JDK).
FROM eclipse-temurin:17-jre-jammy AS runtime
WORKDIR /app

# Non-root user for runtime — Spring Boot doesn't need root.
RUN useradd --create-home --shell /bin/bash taskflow
USER taskflow

COPY --from=build /workspace/build/libs/*-SNAPSHOT.jar app.jar

# Render injects $PORT; bind to 0.0.0.0 so the platform health probe reaches us.
# JVM flags tuned for 512 MB free-tier containers: serial GC + small stacks
# keep the resident set under the limit, otherwise Render OOM-kills on boot.
ENV JAVA_TOOL_OPTIONS="\
    -XX:+UseSerialGC \
    -XX:MaxRAMPercentage=75 \
    -Xss512k \
    -Djava.security.egd=file:/dev/./urandom"

EXPOSE 8080

# SERVER_PORT is read by application.yml; default Render port is 10000.
ENTRYPOINT ["sh", "-c", "java $JAVA_TOOL_OPTIONS -jar /app/app.jar --server.port=${PORT:-8080}"]
