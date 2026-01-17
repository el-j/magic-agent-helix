# PHP Development Guidelines

## Overview
This project uses PHP. Follow modern PHP standards (PSR-12) and best practices.

## Code Style
- Follow PSR-12 coding standards
- Use 4 spaces for indentation
- Use `declare(strict_types=1);` at the top of files
- Use type declarations for all parameters and return types
- Use `final` for classes that shouldn't be extended

## PHP Standards Recommendations (PSR)
- PSR-1: Basic Coding Standard
- PSR-4: Autoloading Standard
- PSR-7: HTTP Message Interface
- PSR-12: Extended Coding Style Guide
- PSR-15: HTTP Handlers

## Composer Commands
- Install dependencies: `composer install`
- Update dependencies: `composer update`
- Autoload optimization: `composer dump-autoload -o`
- Run scripts: `composer run-script <script-name>`
- Validate composer.json: `composer validate`

## Type Safety
- Use strict types: `declare(strict_types=1);`
- Add type hints to all parameters
- Add return type declarations
- Use union types in PHP 8+: `string|int`
- Use nullable types: `?string`

## Error Handling
- Use exceptions for error handling
- Create custom exception classes
- Catch specific exceptions, not generic `\Exception`
- Use `finally` blocks for cleanup
- Log errors appropriately

## Object-Oriented Programming
- Follow SOLID principles
- Use dependency injection
- Favor composition over inheritance
- Use interfaces for contracts
- Use abstract classes for shared behavior

## Modern PHP Features (8.x)
- Named arguments: `function(param: $value)`
- Constructor property promotion
- Match expressions instead of switch
- Nullsafe operator: `$obj?->method()`
- Attributes instead of annotations

## Security
- Always validate and sanitize user input
- Use prepared statements for database queries
- Escape output to prevent XSS
- Use CSRF tokens for forms
- Keep dependencies updated
- Use environment variables for sensitive data

## Testing
- Write PHPUnit tests for all classes
- Aim for high code coverage
- Use data providers for multiple test cases
- Mock external dependencies
- Run tests: `vendor/bin/phpunit`

## Code Quality Tools
- PHPStan: Static analysis - `vendor/bin/phpstan analyse`
- Psalm: Static analysis - `vendor/bin/psalm`
- PHP_CodeSniffer: Code style - `vendor/bin/phpcs`
- PHP-CS-Fixer: Auto-fix style - `vendor/bin/php-cs-fixer fix`

## Documentation
- Use PHPDoc blocks for all classes, methods, and properties
- Include `@param`, `@return`, and `@throws` tags
- Document complex logic with inline comments
- Keep documentation up-to-date

## Performance
- Use opcode caching (OPcache)
- Profile with Xdebug or Blackfire
- Optimize database queries
- Use caching (Redis, Memcached)
- Consider asynchronous processing for heavy tasks

## Common Patterns
- Repository pattern for data access
- Service layer for business logic
- Factory pattern for object creation
- Observer pattern for events
- Dependency injection containers
