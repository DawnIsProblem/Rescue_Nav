FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

COPY gradlew ./
COPY gradle ./gradle
COPY build.gradle settings.gradle ./
COPY src ./src

RUN chmod +x ./gradlew \
    && ./gradlew bootJar -x test --no-daemon

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=builder /app/build/libs/*.jar /app/app.jar
COPY data/output/iksan_current/road_graph_snapshot.json.gz /app/data/output/iksan_current/road_graph_snapshot.json.gz
COPY data/output/iksan_current/validation_report.json /app/data/output/iksan_current/validation_report.json

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java ${JAVA_OPTS} -XX:MaxRAMPercentage=75 -jar /app/app.jar"]
