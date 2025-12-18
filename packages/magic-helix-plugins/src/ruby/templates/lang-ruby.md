# Ruby Language Instructions

## Project Type
- Language: Ruby
- Package Manager: Bundler (Gemfile)
- Framework: {Rails|Sinatra|None}

## Build Commands

```bash
bundle install          # Install dependencies
bundle exec ruby app.rb # Run application
bundle exec rake test   # Run tests
bundle update          # Update dependencies
```

## Code Conventions

### Ruby Style
```ruby
# Use descriptive variable names
user_name = "John Doe"
users = User.where(active: true)

# Prefer blocks and enumerables
users.each do |user|
  puts user.name
end

# Use symbols for hash keys
options = { name: "John", age: 30 }

# Prefer string interpolation
puts "Hello, #{user.name}!"
```

### Classes and Modules
```ruby
class User
  attr_accessor :name, :email
  attr_reader :id
  
  def initialize(name:, email:)
    @name = name
    @email = email
    @id = SecureRandom.uuid
  end
  
  def full_profile
    "#{name} <#{email}>"
  end
end

module Authenticatable
  def authenticate(password)
    # authentication logic
  end
end

class Admin < User
  include Authenticatable
end
```

### Blocks and Procs
```ruby
# Block
numbers.map { |n| n * 2 }

# Multiline block
numbers.each do |n|
  puts n
  log_number(n)
end

# Proc
double = ->(x) { x * 2 }
double.call(5) # => 10
```

## Testing with RSpec

```ruby
# spec/models/user_spec.rb
require 'rails_helper'

RSpec.describe User, type: :model do
  describe '#full_profile' do
    it 'returns formatted name and email' do
      user = User.new(name: 'John', email: 'john@example.com')
      expect(user.full_profile).to eq('John <john@example.com>')
    end
  end
  
  describe 'validations' do
    it { should validate_presence_of(:name) }
    it { should validate_presence_of(:email) }
  end
end
```

## Docker Optimization

### Multi-stage Dockerfile
```dockerfile
FROM ruby:3.2-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache build-base postgresql-dev

# Install gems
COPY Gemfile Gemfile.lock ./
RUN bundle config --local deployment true && \
    bundle config --local without development:test && \
    bundle install -j4

# Runtime stage
FROM ruby:3.2-alpine
WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache postgresql-client tzdata

# Copy installed gems
COPY --from=builder /usr/local/bundle /usr/local/bundle
COPY . .

# Non-root user
RUN adduser -D -u 1000 appuser && chown -R appuser /app
USER appuser

EXPOSE 3000
CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
```

### Docker Compose
```yaml
services:
  web:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db/myapp
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

## Dependency Management

```bash
# Add a gem
bundle add puma

# Remove a gem
bundle remove old_gem

# Update specific gem
bundle update rails

# Check for outdated gems
bundle outdated

# Audit for security vulnerabilities
bundle audit
```

## Performance Tips

- Use `pluck` instead of `map` for database queries
- Eager load associations to avoid N+1 queries
- Use background jobs (Sidekiq) for slow operations
- Cache expensive operations
- Use `find_each` for large datasets
- Profile with rack-mini-profiler
- Use Ruby 3.x for YJIT performance improvements

## Security

- Always use strong parameters in Rails
- Use `SecureRandom` for tokens
- Validate user input
- Use parameterized queries (ActiveRecord does this)
- Keep dependencies updated with `bundle audit`
- Set secure headers
- Use HTTPS in production

## Common Gems

- **puma**: Web server
- **sidekiq**: Background jobs
- **rspec**: Testing framework
- **rubocop**: Linter
- **devise**: Authentication
- **cancancan**: Authorization
- **kaminari**: Pagination
- **jbuilder**: JSON API builder
