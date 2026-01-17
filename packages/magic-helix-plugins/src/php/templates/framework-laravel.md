# Laravel Framework Guidelines

## Overview
This project uses Laravel framework. Follow Laravel conventions and best practices.

## Artisan Commands
- Serve application: `php artisan serve`
- Run migrations: `php artisan migrate`
- Create migration: `php artisan make:migration <name>`
- Create model: `php artisan make:model <name>`
- Create controller: `php artisan make:controller <name>`
- Clear cache: `php artisan cache:clear`
- List routes: `php artisan route:list`

## Directory Structure
- `app/` - Application core code
- `app/Http/Controllers/` - Controllers
- `app/Models/` - Eloquent models
- `app/Services/` - Business logic services
- `routes/` - Route definitions
- `database/migrations/` - Database migrations
- `resources/views/` - Blade templates
- `config/` - Configuration files

## Eloquent ORM
- Use Eloquent models for database interactions
- Define relationships in models
- Use query scopes for reusable queries
- Use accessors and mutators for attribute transformation
- Eager load relationships to avoid N+1 queries

## Routing
- Define routes in `routes/web.php` or `routes/api.php`
- Use resource controllers: `Route::resource('posts', PostController::class)`
- Use route model binding for automatic model injection
- Group related routes with middleware
- Name your routes for easier URL generation

## Controllers
- Keep controllers thin - delegate to services
- Use single action controllers for simple endpoints
- Return views or JSON responses appropriately
- Use form requests for validation
- Use resource controllers for CRUD operations

## Blade Templates
- Use Blade templating engine
- Extend layouts: `@extends('layouts.app')`
- Define sections: `@section('content') ... @endsection`
- Include partials: `@include('partials.header')`
- Use components for reusable UI elements
- Escape output: `{{ $variable }}` (automatic)
- Raw output (use cautiously): `{!! $html !!}`

## Validation
- Use Form Requests for complex validation
- Define rules in controller or Form Request
- Use built-in validation rules
- Create custom validation rules when needed
- Return validation errors automatically

## Database
- Use migrations for schema changes
- Use seeders for test data
- Use factories for model generation
- Write raw queries only when necessary
- Use database transactions for multiple operations

## Authentication
- Use Laravel Breeze or Jetstream for scaffolding
- Use middleware for route protection: `auth`, `guest`
- Use gates and policies for authorization
- Hash passwords with `Hash::make()`
- Use sanctum for API authentication

## Testing
- Write Feature tests in `tests/Feature/`
- Write Unit tests in `tests/Unit/`
- Use `php artisan test` to run tests
- Use factories for test data generation
- Use `RefreshDatabase` trait for database tests

## Queues & Jobs
- Use queues for slow operations
- Create jobs: `php artisan make:job <name>`
- Dispatch jobs: `dispatch(new JobName())`
- Run queue worker: `php artisan queue:work`
- Use different queues for priority

## Events & Listeners
- Use events for decoupled communication
- Create events: `php artisan make:event <name>`
- Create listeners: `php artisan make:listener <name>`
- Register in `EventServiceProvider`
- Dispatch events: `event(new EventName())`

## API Development
- Use API resources for JSON responses
- Version your API routes
- Use rate limiting middleware
- Return proper HTTP status codes
- Use Sanctum or Passport for authentication

## Best Practices
- Use dependency injection in constructors
- Keep business logic in service classes
- Use repository pattern for complex data access
- Follow single responsibility principle
- Write tests for all features
- Use environment variables for configuration
- Never commit `.env` file
- Use Laravel's built-in features before third-party packages
