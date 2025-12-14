# Java/Kotlin Language Instructions

## Project Type
- Language: Java/Kotlin
- Build Tool: {Maven|Gradle}
- Framework: {Spring Boot|Micronaut|Quarkus|None}

## Build Commands

### Maven
```bash
./mvnw clean install    # Build project
./mvnw test            # Run tests
./mvnw spring-boot:run # Run Spring Boot app
```

### Gradle
```bash
./gradlew build        # Build project
./gradlew test         # Run tests
./gradlew bootRun      # Run Spring Boot app
```

## Code Conventions

### Java
- Follow Java naming conventions (PascalCase for classes, camelCase for methods)
- Use meaningful variable names
- Prefer immutability where possible
- Use Optional for nullable values
- Handle exceptions appropriately

### Kotlin
- Use data classes for DTOs
- Leverage null safety features
- Use extension functions appropriately
- Prefer immutability (val over var)
- Use scope functions (let, apply, run, with)

## Docker Optimization

### Multi-stage Dockerfile Example (Maven)
```dockerfile
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### JVM Tuning for Containers
```bash
# Use container-aware JVM flags
java -XX:+UseContainerSupport \
     -XX:MaxRAMPercentage=75.0 \
     -XX:InitialRAMPercentage=50.0 \
     -jar app.jar
```

## Testing

- Use JUnit 5 for unit tests
- Use Mockito for mocking
- Use Testcontainers for integration tests
- Maintain test coverage >80%

## Dependencies

- Keep dependencies up to date
- Use dependency management (Maven BOM, Gradle platform)
- Scan for vulnerabilities regularly
