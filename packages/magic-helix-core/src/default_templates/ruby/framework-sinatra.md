# Sinatra Framework Instructions

## Minimal Web Framework

Sinatra is a lightweight Ruby web framework for quick web applications and APIs.

## Basic Application

```ruby
require 'sinatra'
require 'json'

# Simple route
get '/' do
  'Hello World!'
end

# Route with parameters
get '/users/:id' do
  user = User.find(params[:id])
  user.to_json
end

# POST request
post '/users' do
  request.body.rewind
  data = JSON.parse(request.body.read)
  user = User.create(data)
  status 201
  user.to_json
end
```

## Modular Application

```ruby
# app.rb
require 'sinatra/base'

class MyApp < Sinatra::Base
  configure do
    set :show_exceptions, false
    set :raise_errors, true
  end
  
  before do
    content_type :json
  end
  
  get '/api/users' do
    User.all.to_json
  end
  
  error 404 do
    { error: 'Not Found' }.to_json
  end
  
  run! if app_file == $0
end
```

## Configuration

### config.ru
```ruby
require './app'

use Rack::Logger
use Rack::Session::Cookie, secret: ENV['SESSION_SECRET']

run MyApp
```

## Middleware

```ruby
class MyApp < Sinatra::Base
  use Rack::Auth::Basic do |username, password|
    username == 'admin' && password == 'secret'
  end
  
  use Rack::Cors do
    allow do
      origins '*'
      resource '*', headers: :any, methods: [:get, :post]
    end
  end
end
```

## Helpers

```ruby
class MyApp < Sinatra::Base
  helpers do
    def authenticated?
      session[:user_id].present?
    end
    
    def current_user
      @current_user ||= User.find(session[:user_id]) if authenticated?
    end
    
    def require_authentication!
      halt 401, { error: 'Unauthorized' }.to_json unless authenticated?
    end
  end
  
  before '/api/*' do
    require_authentication!
  end
end
```

## Templates (ERB)

```ruby
get '/users/:id' do
  @user = User.find(params[:id])
  erb :user
end
```

```erb
<!-- views/user.erb -->
<h1><%= @user.name %></h1>
<p><%= @user.email %></p>
```

## Testing with RSpec

```ruby
# spec/app_spec.rb
require 'rack/test'
require './app'

RSpec.describe 'MyApp' do
  include Rack::Test::Methods
  
  def app
    MyApp
  end
  
  describe 'GET /api/users' do
    it 'returns all users' do
      create_list(:user, 3)
      
      get '/api/users'
      
      expect(last_response.status).to eq(200)
      expect(JSON.parse(last_response.body).size).to eq(3)
    end
  end
end
```

## Docker Setup

```dockerfile
FROM ruby:3.2-alpine
WORKDIR /app

RUN apk add --no-cache build-base

COPY Gemfile Gemfile.lock ./
RUN bundle install --without development test

COPY . .

RUN adduser -D -u 1000 sinatra && chown -R sinatra /app
USER sinatra

EXPOSE 4567

CMD ["ruby", "app.rb", "-o", "0.0.0.0"]
```

## Running the Application

```bash
# Development
ruby app.rb

# With Puma
bundle exec puma config.ru

# Production (Puma)
bundle exec puma -C config/puma.rb
```

## Common Extensions

```ruby
# Gemfile
gem 'sinatra'
gem 'sinatra-contrib'  # Reloader, JSON helpers
gem 'puma'             # Web server
gem 'activerecord'     # Database ORM
gem 'rack-cors'        # CORS support
gem 'rack-protection'  # Security
```

## Best Practices

- Use modular style for larger apps
- Implement proper error handling
- Use middleware for cross-cutting concerns
- Keep routes organized
- Use helpers for common logic
- Implement authentication/authorization
- Use environment variables for config
- Add logging
- Implement health checks

## When to Use Sinatra

✅ **Good for:**
- Simple APIs
- Microservices
- Prototypes
- Lightweight web services

❌ **Use Rails instead for:**
- Large applications
- Complex business logic
- Need for convention over configuration
- Built-in admin interfaces
