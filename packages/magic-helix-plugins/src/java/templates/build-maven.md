# Maven Build Tool Instructions

## Project Structure
```
project/
├── pom.xml
├── src/
│   ├── main/
│   │   ├── java/
│   │   └── resources/
│   └── test/
│       ├── java/
│       └── resources/
└── target/
```

## Common Commands

```bash
# Build lifecycle
./mvnw clean              # Clean build artifacts
./mvnw compile            # Compile source code
./mvnw test               # Run tests
./mvnw package            # Package as JAR/WAR
./mvnw install            # Install to local repo
./mvnw deploy             # Deploy to remote repo

# Spring Boot
./mvnw spring-boot:run    # Run application

# Dependency management
./mvnw dependency:tree    # Show dependency tree
./mvnw dependency:resolve # Download dependencies
./mvnw versions:display-dependency-updates  # Check for updates
```

## Docker Optimization

### Layer Caching Strategy
```dockerfile
# Download dependencies in separate layer
FROM maven:3.9-eclipse-temurin-17 AS deps
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline

# Build application
FROM deps AS build
COPY src ./src
RUN mvn package -DskipTests

# Runtime
FROM eclipse-temurin:17-jre-alpine
COPY --from=build /app/target/*.jar app.jar
CMD ["java", "-jar", "app.jar"]
```

## Best Practices

- Use Maven Wrapper (./mvnw) for consistent builds
- Define dependency versions in `<dependencyManagement>`
- Use Spring Boot BOM for version management
- Leverage profiles for different environments
- Keep plugins up to date

## POM Configuration Tips

```xml
<properties>
    <java.version>17</java.version>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
</properties>

<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-dependencies</artifactId>
            <version>${spring-boot.version}</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```
