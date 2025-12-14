# Blazor Framework Instructions

## Blazor Modes

### Blazor WebAssembly (Client-side)
- Runs in browser via WebAssembly
- Full .NET runtime in browser
- Offline capable after initial load
- Slower initial load time

### Blazor Server (Server-side)
- UI updates via SignalR connection
- Fast initial load
- Less client resources needed
- Requires persistent connection

### Blazor Hybrid (.NET MAUI)
- Native desktop/mobile apps
- Uses platform WebView
- Full .NET access

## Component Structure

### Basic Component
```razor
@page "/users"
@inject UserService UserService

<h3>Users</h3>

@if (users == null) {
    <p>Loading...</p>
} else {
    <ul>
        @foreach (var user in users) {
            <li>@user.Name - @user.Email</li>
        }
    </ul>
}

@code {
    private List<User>? users;

    protected override async Task OnInitializedAsync() {
        users = await UserService.GetUsersAsync();
    }
}
```

### Component with Parameters
```razor
@* UserCard.razor *@
<div class="card">
    <h4>@User.Name</h4>
    <p>@User.Email</p>
    <button @onclick="OnDeleteClick">Delete</button>
</div>

@code {
    [Parameter]
    public User User { get; set; } = null!;
    
    [Parameter]
    public EventCallback<User> OnDelete { get; set; }
    
    private async Task OnDeleteClick() {
        await OnDelete.InvokeAsync(User);
    }
}
```

## Data Binding

### Two-way Binding
```razor
<input @bind="username" />
<input @bind="username" @bind:event="oninput" />

@code {
    private string username = "";
}
```

### Form Validation
```razor
<EditForm Model="user" OnValidSubmit="HandleSubmit">
    <DataAnnotationsValidator />
    <ValidationSummary />
    
    <InputText @bind-Value="user.Name" />
    <ValidationMessage For="@(() => user.Name)" />
    
    <InputText @bind-Value="user.Email" type="email" />
    <ValidationMessage For="@(() => user.Email)" />
    
    <button type="submit">Submit</button>
</EditForm>

@code {
    private UserDto user = new();
    
    private async Task HandleSubmit() {
        await UserService.CreateUserAsync(user);
    }
}

public class UserDto {
    [Required]
    [StringLength(100)]
    public string Name { get; set; } = "";
    
    [Required]
    [EmailAddress]
    public string Email { get; set; } = "";
}
```

## Dependency Injection

```csharp
// Program.cs (Blazor WebAssembly)
builder.Services.AddScoped<UserService>();
builder.Services.AddScoped(sp => new HttpClient { 
    BaseAddress = new Uri(builder.HostEnvironment.BaseAddress) 
});

// Program.cs (Blazor Server)
builder.Services.AddScoped<UserService>();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));
```

## JavaScript Interop

```razor
@inject IJSRuntime JS

<button @onclick="ShowAlert">Show Alert</button>

@code {
    private async Task ShowAlert() {
        await JS.InvokeVoidAsync("alert", "Hello from Blazor!");
    }
}
```

```javascript
// wwwroot/js/app.js
window.blazorHelpers = {
    focusElement: (elementId) => {
        document.getElementById(elementId)?.focus();
    }
};
```

```csharp
await JS.InvokeVoidAsync("blazorHelpers.focusElement", "myInput");
```

## State Management

### Cascading Parameters
```razor
<CascadingValue Value="theme">
    <ChildComponent />
</CascadingValue>

@code {
    private string theme = "dark";
}

// In child component
@code {
    [CascadingParameter]
    public string Theme { get; set; } = "";
}
```

### Scoped Service for State
```csharp
public class AppState {
    public event Action? OnChange;
    private string? _currentUser;
    
    public string? CurrentUser {
        get => _currentUser;
        set {
            _currentUser = value;
            NotifyStateChanged();
        }
    }
    
    private void NotifyStateChanged() => OnChange?.Invoke();
}

// Register as scoped
builder.Services.AddScoped<AppState>();

// Use in component
@implements IDisposable
@inject AppState AppState

@code {
    protected override void OnInitialized() {
        AppState.OnChange += StateHasChanged;
    }
    
    public void Dispose() {
        AppState.OnChange -= StateHasChanged;
    }
}
```

## Performance Optimization

### Virtualization
```razor
<Virtualize Items="@users" Context="user">
    <UserCard User="user" />
</Virtualize>
```

### Lazy Loading
```razor
@page "/admin"
@attribute [Authorize(Roles = "Admin")]

<h3>Admin Panel</h3>
```

```csharp
// Program.cs
builder.Services.AddScoped<LazyAssemblyLoader>();

// Load assemblies on demand
await LazyAssemblyLoader.LoadAssembliesAsync(new[] { "AdminModule.dll" });
```

## Docker Deployment

### Blazor WebAssembly
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -o /app/publish

FROM nginx:alpine
COPY --from=build /app/publish/wwwroot /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
```

### Blazor Server
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "BlazorApp.dll"]
```

## Best Practices

- Use `@key` for list items to improve rendering performance
- Avoid unnecessary re-renders with `ShouldRender()`
- Use `StateHasChanged()` sparingly
- Implement proper error boundaries
- Use streaming rendering for improved perceived performance
- Minimize JS interop calls
- Use virtual scrolling for large lists
- Implement proper loading states
