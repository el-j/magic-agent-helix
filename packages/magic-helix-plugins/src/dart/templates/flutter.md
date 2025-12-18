# Flutter Development Guidelines

## Architecture & Structure

### Project Organization
```
lib/
├── main.dart
├── app.dart
├── core/
│   ├── constants/
│   ├── theme/
│   └── utils/
├── features/
│   ├── auth/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   └── home/
└── shared/
    ├── widgets/
    └── models/
```

## Widget Best Practices

### StatelessWidget
```dart
class UserCard extends StatelessWidget {
  const UserCard({
    super.key,
    required this.user,
    this.onTap,
  });

  final User user;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        title: Text(user.name),
        subtitle: Text(user.email),
        onTap: onTap,
      ),
    );
  }
}
```

### StatefulWidget
```dart
class Counter extends StatefulWidget {
  const Counter({super.key});

  @override
  State<Counter> createState() => _CounterState();
}

class _CounterState extends State<Counter> {
  int _count = 0;

  @override
  void dispose() {
    // Clean up resources
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Count: $_count'),
        ElevatedButton(
          onPressed: () => setState(() => _count++),
          child: const Text('Increment'),
        ),
      ],
    );
  }
}
```

## State Management

### Riverpod (Recommended)
```dart
final userProvider = StateNotifierProvider<UserNotifier, AsyncValue<User>>((ref) {
  return UserNotifier();
});

class UserNotifier extends StateNotifier<AsyncValue<User>> {
  UserNotifier() : super(const AsyncValue.loading());

  Future<void> fetchUser(String id) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() => api.getUser(id));
  }
}

// Usage in widget
class UserProfile extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final userState = ref.watch(userProvider);
    
    return userState.when(
      data: (user) => Text(user.name),
      loading: () => CircularProgressIndicator(),
      error: (err, stack) => Text('Error: $err'),
    );
  }
}
```

### Bloc Pattern
```dart
class UserBloc extends Bloc<UserEvent, UserState> {
  UserBloc() : super(UserInitial()) {
    on<LoadUser>(_onLoadUser);
  }

  Future<void> _onLoadUser(LoadUser event, Emitter<UserState> emit) async {
    emit(UserLoading());
    try {
      final user = await repository.getUser(event.id);
      emit(UserLoaded(user));
    } catch (e) {
      emit(UserError(e.toString()));
    }
  }
}
```

## Navigation

### Named Routes
```dart
// Define routes
final routes = {
  '/': (context) => HomeScreen(),
  '/profile': (context) => ProfileScreen(),
  '/settings': (context) => SettingsScreen(),
};

// Navigate
Navigator.pushNamed(context, '/profile');

// With arguments
Navigator.pushNamed(
  context,
  '/profile',
  arguments: {'userId': '123'},
);
```

### Go Router (Modern)
```dart
final router = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => HomeScreen(),
    ),
    GoRoute(
      path: '/profile/:id',
      builder: (context, state) {
        final id = state.pathParameters['id']!;
        return ProfileScreen(userId: id);
      },
    ),
  ],
);

// Navigate
context.go('/profile/123');
context.push('/settings');
```

## Performance Optimization

### const Constructors
```dart
// Use const wherever possible
const Text('Hello');
const Padding(padding: EdgeInsets.all(8.0));
const SizedBox(height: 16);
```

### ListView.builder
```dart
// For large lists, use builder
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    return ListTile(title: Text(items[index]));
  },
);
```

### Keys
```dart
// Use keys for widgets that need to preserve state
ListView(
  children: items.map((item) => 
    ListTile(
      key: ValueKey(item.id),
      title: Text(item.name),
    )
  ).toList(),
);
```

## Responsive Design

### MediaQuery
```dart
final size = MediaQuery.of(context).size;
final isPortrait = size.height > size.width;

if (size.width > 600) {
  // Tablet layout
} else {
  // Mobile layout
}
```

### LayoutBuilder
```dart
LayoutBuilder(
  builder: (context, constraints) {
    if (constraints.maxWidth > 600) {
      return WideLayout();
    }
    return NarrowLayout();
  },
);
```

## Testing

### Widget Tests
```dart
testWidgets('Counter increments', (tester) async {
  await tester.pumpWidget(
    MaterialApp(home: Counter()),
  );

  expect(find.text('0'), findsOneWidget);
  
  await tester.tap(find.byType(ElevatedButton));
  await tester.pump();
  
  expect(find.text('1'), findsOneWidget);
});
```

### Integration Tests
```dart
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Complete user flow', (tester) async {
    await tester.pumpWidget(MyApp());
    
    // Login
    await tester.enterText(find.byKey(Key('email')), 'test@test.com');
    await tester.tap(find.byKey(Key('login')));
    await tester.pumpAndSettle();
    
    // Verify home screen
    expect(find.text('Welcome'), findsOneWidget);
  });
}
```

## Best Practices

### Widget Composition
- Break large widgets into smaller, reusable components
- Extract complex logic into separate methods or classes
- Use const constructors to improve performance

### Error Handling
- Use ErrorWidget.builder for custom error widgets
- Wrap risky operations in try-catch
- Provide meaningful error messages to users

### Asset Management
```yaml
# pubspec.yaml
flutter:
  assets:
    - assets/images/
    - assets/icons/
  fonts:
    - family: Roboto
      fonts:
        - asset: fonts/Roboto-Regular.ttf
```

### Platform-Specific Code
```dart
import 'dart:io' show Platform;

if (Platform.isAndroid) {
  // Android-specific
} else if (Platform.isIOS) {
  // iOS-specific
}
```

## Common Patterns

### Dependency Injection
```dart
class MyApp extends StatelessWidget {
  final ApiService apiService;
  final AuthService authService;

  const MyApp({
    required this.apiService,
    required this.authService,
  });
}
```

### Service Locator
```dart
final getIt = GetIt.instance;

void setupLocator() {
  getIt.registerSingleton<ApiService>(ApiService());
  getIt.registerLazySingleton<AuthService>(() => AuthService());
}

// Usage
final api = getIt<ApiService>();
```
