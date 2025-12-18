# State: RxJS
- **ALWAYS** suffix Observable variables with a `$` (e.g., `users$`).
- **ALWAYS** use `BehaviorSubject` for state that needs to be "replayed" to new subscribers.
- **ALWAYS** `pipe()` operators. Do not use chained `.` operators.
- **NEVER** forget to `unsubscribe()`. Manage subscriptions in a central way, e.g., a `destroy$` Subject that completes `onComponentDestroy`.
- **PREFER** `switchMap` for handling new inner observables (like HTTP requests) and `mergeMap` for parallel operations.