# ASP.NET Core Framework Instructions

## Architecture

### Minimal API (Modern)
```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.MapGet("/api/users/{id}", async (int id, UserService service) => {
    var user = await service.GetUserAsync(id);
    return user is not null ? Results.Ok(user) : Results.NotFound();
});

app.Run();
```

### Controller-based API
```csharp
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase {
    private readonly UserService _service;
    
    public UsersController(UserService service) => _service = service;
    
    [HttpGet("{id}")]
    public async Task<ActionResult<User>> GetUser(int id) {
        var user = await _service.GetUserAsync(id);
        return user is not null ? Ok(user) : NotFound();
    }
    
    [HttpPost]
    public async Task<ActionResult<User>> CreateUser(CreateUserRequest request) {
        var user = await _service.CreateUserAsync(request);
        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
    }
}
```

## Dependency Injection

```csharp
// Program.cs
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<UserService>();
builder.Services.AddSingleton<ICacheService, RedisCacheService>();
```

## Entity Framework Core

### DbContext
```csharp
public class AppDbContext : DbContext {
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    
    public DbSet<User> Users => Set<User>();
    public DbSet<Order> Orders => Set<Order>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder) {
        modelBuilder.Entity<User>(entity => {
            entity.HasKey(e => e.Id);
            entity.HasIndex(e => e.Email).IsUnique();
            entity.Property(e => e.Name).HasMaxLength(100).IsRequired();
        });
    }
}
```

### Migrations
```bash
dotnet ef migrations add InitialCreate
dotnet ef database update
dotnet ef migrations remove
```

## Configuration

### appsettings.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=myapp;User Id=sa;Password=P@ssw0rd;"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "JwtSettings": {
    "Secret": "${JWT_SECRET}",
    "ExpirationMinutes": 60
  }
}
```

### Options Pattern
```csharp
public class JwtSettings {
    public string Secret { get; set; } = string.Empty;
    public int ExpirationMinutes { get; set; }
}

// Register
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection("JwtSettings"));

// Use
public class AuthService {
    private readonly JwtSettings _settings;
    
    public AuthService(IOptions<JwtSettings> options) {
        _settings = options.Value;
    }
}
```

## Middleware

```csharp
public class RequestLoggingMiddleware {
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;
    
    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger) {
        _next = next;
        _logger = logger;
    }
    
    public async Task InvokeAsync(HttpContext context) {
        _logger.LogInformation("Request: {Method} {Path}", context.Request.Method, context.Request.Path);
        await _next(context);
    }
}

// Register
app.UseMiddleware<RequestLoggingMiddleware>();
```

## Authentication & Authorization

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options => {
        options.TokenValidationParameters = new TokenValidationParameters {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

builder.Services.AddAuthorization(options => {
    options.AddPolicy("AdminOnly", policy => policy.RequireRole("Admin"));
});
```

## Health Checks

```csharp
builder.Services.AddHealthChecks()
    .AddNpgSql(builder.Configuration.GetConnectionString("DefaultConnection")!)
    .AddRedis(builder.Configuration.GetConnectionString("Redis")!);

app.MapHealthChecks("/health");
```

## Docker Production Setup

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

ENTRYPOINT ["dotnet", "MyApp.dll"]
```

## Performance Best Practices

- Use async/await throughout
- Enable response compression
- Implement caching (ResponseCache, MemoryCache, Redis)
- Use connection pooling for databases
- Minimize allocations in hot paths
- Use `Span<T>` for high-performance scenarios
- Enable HTTP/2 and HTTP/3
- Use output caching (ASP.NET Core 7+)
