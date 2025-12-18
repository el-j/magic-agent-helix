# Dart Development Guidelines

## Language Overview
Dart is a client-optimized language for fast apps on any platform. It's the programming language behind Flutter and supports strong typing with null safety.

## Code Style & Conventions

### Naming
- **Classes/Enums/Typedefs**: PascalCase (`UserModel`, `ColorState`)
- **Functions/Variables**: camelCase (`getUserData`, `userName`)
- **Constants**: lowerCamelCase (`defaultTimeout`, `maxRetries`)
- **Private members**: Prefix with underscore (`_privateMethod`, `_internalState`)

### Null Safety
```dart
// Non-nullable by default
String name;  // Must be initialized
String? optionalName;  // Can be null

// Null-aware operators
String? maybeValue;
final length = maybeValue?.length ?? 0;  // Default value
final value = maybeValue!;  // Null assertion (use carefully)
```

### Collections
```dart
// Use const for immutable collections
const colors = ['red', 'green', 'blue'];

// Type-safe collections
final List<User> users = [];
final Map<String, int> scores = {};
final Set<String> uniqueNames = {};

// Collection operators
final adults = users.where((u) => u.age >= 18).toList();
final names = users.map((u) => u.name).toList();
```

## Object-Oriented Programming

### Classes
```dart
class User {
  final String id;
  final String name;
  final int age;

  // Constructor with named parameters
  const User({
    required this.id,
    required this.name,
    required this.age,
  });

  // Named constructor
  User.guest() : this(id: 'guest', name: 'Guest', age: 0);

  // Factory constructor
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      age: json['age'],
    );
  }

  // Copyhold
  User copyWith({String? name, int? age}) {
    return User(
      id: id,
      name: name ?? this.name,
      age: age ?? this.age,
    );
  }
}
```

### Mixins
```dart
mixin LoggerMixin {
  void log(String message) {
    print('[${DateTime.now()}] $message');
  }
}

class MyService with LoggerMixin {
  void doSomething() {
    log('Doing something');
  }
}
```

## Async Programming

### Futures
```dart
Future<User> fetchUser(String id) async {
  final response = await http.get(Uri.parse('/users/$id'));
  return User.fromJson(json.decode(response.body));
}

// Error handling
try {
  final user = await fetchUser('123');
} catch (e) {
  print('Error: $e');
}
```

### Streams
```dart
Stream<int> countStream(int max) async* {
  for (int i = 1; i <= max; i++) {
    await Future.delayed(Duration(seconds: 1));
    yield i;
  }
}

// Usage
await for (final count in countStream(5)) {
  print(count);
}
```

## Testing

### Unit Tests
```dart
import 'package:test/test.dart';

void main() {
  group('User', () {
    test('creates from JSON', () {
      final json = {'id': '1', 'name': 'John', 'age': 30};
      final user = User.fromJson(json);
      
      expect(user.id, '1');
      expect(user.name, 'John');
      expect(user.age, 30);
    });

    test('copyWith preserves unchanged fields', () {
      final user = User(id: '1', name: 'John', age: 30);
      final updated = user.copyWith(name: 'Jane');
      
      expect(updated.id, user.id);
      expect(updated.name, 'Jane');
      expect(updated.age, user.age);
    });
  });
}
```

## Best Practices

### Performance
- Use `const` constructors when possible
- Prefer `final` over `var` for immutability
- Use collection literals instead of constructors
- Avoid unnecessary rebuilds

### Code Organization
- One class per file (generally)
- Group related files in directories
- Use barrel files (index.dart) for clean exports
- Separate models, services, and utilities

### Error Handling
- Use exceptions for exceptional cases
- Return `Result<T, E>` types for expected failures
- Validate input early
- Provide meaningful error messages

## Common Patterns

### Singleton
```dart
class ApiService {
  static final ApiService _instance = ApiService._internal();
  factory ApiService() => _instance;
  ApiService._internal();
}
```

### Factory Pattern
```dart
abstract class Shape {
  factory Shape(String type) {
    switch (type) {
      case 'circle':
        return Circle();
      case 'square':
        return Square();
      default:
        throw ArgumentError('Unknown shape: $type');
    }
  }
}
```

### Repository Pattern
```dart
abstract class UserRepository {
  Future<User> getUser(String id);
  Future<void> saveUser(User user);
}

class ApiUserRepository implements UserRepository {
  @override
  Future<User> getUser(String id) async {
    // Implementation
  }
}
```

## Tools & Commands
```bash
# Format code
dart format .

# Analyze code
dart analyze

# Run tests
dart test

# Pub commands
dart pub get
dart pub upgrade
dart pub outdated
```
