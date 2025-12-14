# Gradle Build Tool Instructions

## Project Structure
```
project/
├── build.gradle or build.gradle.kts
├── settings.gradle or settings.gradle.kts
├── gradle/
│   └── wrapper/
├── src/
│   ├── main/
│   │   ├── java/ or kotlin/
│   │   └── resources/
│   └── test/
│       ├── java/ or kotlin/
│       └── resources/
└── build/
```

## Common Commands

```bash
# Build lifecycle
./gradlew clean           # Clean build artifacts
./gradlew build           # Full build with tests
./gradlew assemble        # Build without tests
./gradlew test            # Run tests
./gradlew check           # Run all checks

# Spring Boot
./gradlew bootRun         # Run application
./gradlew bootJar         # Create executable JAR

# Dependency management
./gradlew dependencies    # Show dependency tree
./gradlew dependencyUpdates  # Check for updates (with plugin)
```

## Docker Optimization

### Layer Caching Strategy
```dockerfile
# Download dependencies in separate layer
FROM gradle:8.5-jdk17 AS deps
WORKDIR /app
COPY build.gradle.kts settings.gradle.kts ./
COPY gradle ./gradle
RUN gradle dependencies --no-daemon

# Build application
FROM deps AS build
COPY src ./src
RUN gradle bootJar --no-daemon

# Runtime
FROM eclipse-temurin:17-jre-alpine
COPY --from=build /app/build/libs/*.jar app.jar
CMD ["java", "-jar", "app.jar"]
```

## Kotlin DSL (build.gradle.kts)

```kotlin
plugins {
    id("org.springframework.boot") version "3.2.0"
    id("io.spring.dependency-management") version "1.1.4"
    kotlin("jvm") version "1.9.20"
    kotlin("plugin.spring") version "1.9.20"
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.springframework.boot:spring-boot-starter-web")
    implementation("org.jetbrains.kotlin:kotlin-reflect")
    testImplementation("org.springframework.boot:spring-boot-starter-test")
}

tasks.withType<Test> {
    useJUnitPlatform()
}
```

## Best Practices

- Use Gradle Wrapper (./gradlew) for consistent builds
- Prefer Kotlin DSL for type safety
- Use version catalogs for dependency management
- Leverage buildSrc for shared build logic
- Enable Gradle daemon for faster builds
- Use `--parallel` for multi-module projects

## Performance Tips

```kotlin
// gradle.properties
org.gradle.caching=true
org.gradle.parallel=true
org.gradle.jvmargs=-Xmx2g -XX:MaxMetaspaceSize=512m
```
