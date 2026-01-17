# C# / .NET Instructions

## Project Type
- Language: C#
- Framework: {.NET 6|.NET 7|.NET 8}
- App Type: {ASP.NET Core|Console|Library|Blazor|MAUI}

## Build Commands

```bash
dotnet restore           # Restore NuGet packages
dotnet build            # Build project
dotnet test             # Run tests
dotnet run              # Run application
dotnet publish -c Release  # Publish for deployment
```

## Code Conventions

### C# Modern Features
```csharp
// Nullable reference types (C# 8+)
#nullable enable
public class User {
    public string Name { get; set; } = string.Empty;
    public string? Email { get; set; }
}

// Records (C# 9+)
public record Product(int Id, string Name, decimal Price);

// Pattern matching (C# 9+)
var result = value switch {
    null => "null",
    > 0 => "positive",
    < 0 => "negative",
    _ => "zero"
};
```

### Async/Await
```csharp
public async Task<User> GetUserAsync(int id) {
    var user = await _context.Users.FindAsync(id);
    return user ?? throw new NotFoundException();
}
```

### LINQ
```csharp
var activeUsers = users
    .Where(u => u.IsActive)
    .OrderBy(u => u.Name)
    .Select(u => new UserDto(u.Id, u.Name));
```

## Docker Optimization

### Multi-stage Dockerfile
```dockerfile
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["MyApp.csproj", "./"]
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine
WORKDIR /app
COPY --from=build /app/publish .

# Non-root user
RUN adduser -u 1000 -D appuser && chown -R appuser /app
USER appuser

EXPOSE 8080
ENTRYPOINT ["dotnet", "MyApp.dll"]
```

### Docker Compose for Development
```yaml
services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ConnectionStrings__DefaultConnection=Server=db;Database=mydb;
    depends_on:
      - db
  
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: devpassword
```

## Testing

### Unit Tests (xUnit)
```csharp
public class UserServiceTests {
    [Fact]
    public async Task GetUser_ReturnsUser_WhenExists() {
        // Arrange
        var service = new UserService(mockRepo);
        
        // Act
        var result = await service.GetUserAsync(1);
        
        // Assert
        Assert.NotNull(result);
        Assert.Equal("John", result.Name);
    }
}
```

### Integration Tests
```csharp
public class ApiTests : IClassFixture<WebApplicationFactory<Program>> {
    private readonly HttpClient _client;
    
    public ApiTests(WebApplicationFactory<Program> factory) {
        _client = factory.CreateClient();
    }
    
    [Fact]
    public async Task GetUser_ReturnsOk() {
        var response = await _client.GetAsync("/api/users/1");
        response.EnsureSuccessStatusCode();
    }
}
```

## NuGet Package Management

```bash
dotnet add package Microsoft.EntityFrameworkCore
dotnet remove package OldPackage
dotnet list package --outdated
```

## Performance Tips

- Use `Span<T>` and `Memory<T>` for high-performance scenarios
- Enable nullable reference types for better null safety
- Use `ValueTask` for frequently synchronous operations
- Leverage record types for immutable DTOs
- Use source generators to reduce reflection overhead
- Profile with dotnet-trace and dotnet-counters

## Security

- Enable nullable reference types
- Use `IOptions<T>` for configuration
- Implement proper authentication/authorization
- Validate user input
- Use parameterized queries (EF Core does this)
- Keep dependencies updated
