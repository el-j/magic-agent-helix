# Kotlin Specific Instructions

## Language Features

### Null Safety
```kotlin
// Use nullable types explicitly
val name: String? = null
val length = name?.length ?: 0

// Safe calls
user?.address?.city
```

### Data Classes
```kotlin
data class User(
    val id: Long,
    val name: String,
    val email: String
)
```

### Extension Functions
```kotlin
fun String.toSnakeCase(): String = 
    this.replace(Regex("([a-z])([A-Z])"), "$1_$2").lowercase()
```

### Coroutines (Async)
```kotlin
suspend fun fetchData(): Data {
    return withContext(Dispatchers.IO) {
        // IO operation
    }
}
```

## Spring Boot with Kotlin

### Controller Example
```kotlin
@RestController
@RequestMapping("/api/users")
class UserController(private val userService: UserService) {
    
    @GetMapping("/{id}")
    fun getUser(@PathVariable id: Long): User {
        return userService.findById(id)
    }
}
```

### Service with Coroutines
```kotlin
@Service
class UserService(private val repository: UserRepository) {
    
    suspend fun findAllAsync(): List<User> = 
        withContext(Dispatchers.IO) {
            repository.findAll()
        }
}
```

## Best Practices

- Use `val` over `var` for immutability
- Leverage sealed classes for state management
- Use `when` expressions instead of multiple `if-else`
- Apply scope functions appropriately (let, run, apply, also, with)
- Use destructuring for data classes
- Prefer sequences for large collections

## Build Configuration

### build.gradle.kts
```kotlin
plugins {
    kotlin("jvm") version "1.9.20"
    kotlin("plugin.spring") version "1.9.20"
}

dependencies {
    implementation("org.jetbrains.kotlin:kotlin-stdlib")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core")
}
```
