# Ruby on Rails Framework Instructions

## Project Structure
```
app/
├── models/          # Database models
├── controllers/     # Request handlers
├── views/          # Templates
├── jobs/           # Background jobs
├── mailers/        # Email templates
└── channels/       # WebSocket channels
config/
├── routes.rb       # URL routing
├── database.yml    # Database config
└── application.rb  # App config
db/
├── migrate/        # Database migrations
└── schema.rb       # Current schema
```

## MVC Pattern

### Model
```ruby
class User < ApplicationRecord
  has_many :posts
  validates :email, presence: true, uniqueness: true
  validates :name, presence: true
  
  scope :active, -> { where(active: true) }
  
  def full_name
    "#{first_name} #{last_name}"
  end
end
```

### Controller
```ruby
class UsersController < ApplicationController
  before_action :set_user, only: [:show, :update, :destroy]
  before_action :authenticate_user!
  
  def index
    @users = User.active.page(params[:page])
    render json: @users
  end
  
  def create
    @user = User.new(user_params)
    
    if @user.save
      render json: @user, status: :created
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end
  
  private
  
  def set_user
    @user = User.find(params[:id])
  end
  
  def user_params
    params.require(:user).permit(:name, :email)
  end
end
```

### View (ERB)
```erb
<h1>Users</h1>

<% @users.each do |user| %>
  <div class="user">
    <h2><%= user.name %></h2>
    <p><%= user.email %></p>
    <%= link_to 'Show', user_path(user) %>
  </div>
<% end %>

<%= paginate @users %>
```

## Routing

```ruby
# config/routes.rb
Rails.application.routes.draw do
  root 'home#index'
  
  resources :users do
    resources :posts
  end
  
  namespace :api do
    namespace :v1 do
      resources :users, only: [:index, :show, :create]
    end
  end
  
  get '/health', to: 'health#index'
end
```

## Database Migrations

```bash
rails generate migration CreateUsers name:string email:string
rails db:migrate
rails db:rollback
rails db:migrate:status
```

```ruby
class CreateUsers < ActiveRecord::Migration[7.0]
  def change
    create_table :users do |t|
      t.string :name, null: false
      t.string :email, null: false
      t.boolean :active, default: true
      
      t.timestamps
    end
    
    add_index :users, :email, unique: true
  end
end
```

## Active Record Queries

```ruby
# Find
User.find(1)
User.find_by(email: 'user@example.com')

# Where
User.where(active: true)
User.where('created_at > ?', 1.week.ago)

# Joins
User.joins(:posts).where(posts: { published: true })

# Eager loading (avoid N+1)
User.includes(:posts).all

# Aggregations
User.count
User.average(:age)
User.group(:country).count
```

## Background Jobs (Sidekiq)

```ruby
class UserMailerJob < ApplicationJob
  queue_as :default
  
  def perform(user_id)
    user = User.find(user_id)
    UserMailer.welcome_email(user).deliver_now
  end
end

# Enqueue job
UserMailerJob.perform_later(user.id)
```

## API Development

### JSON API
```ruby
class Api::V1::UsersController < ApplicationController
  def index
    users = User.active
    render json: users, each_serializer: UserSerializer
  end
end

class UserSerializer < ActiveModel::Serializer
  attributes :id, :name, :email, :created_at
  
  has_many :posts
end
```

### Jbuilder
```ruby
# app/views/users/index.json.jbuilder
json.array! @users do |user|
  json.id user.id
  json.name user.name
  json.email user.email
  json.posts user.posts, :id, :title
end
```

## Testing with RSpec

```ruby
# spec/requests/users_spec.rb
require 'rails_helper'

RSpec.describe 'Users API', type: :request do
  describe 'GET /api/v1/users' do
    it 'returns all active users' do
      create_list(:user, 3, active: true)
      
      get '/api/v1/users'
      
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body).size).to eq(3)
    end
  end
end

# spec/models/user_spec.rb
require 'rails_helper'

RSpec.describe User, type: :model do
  it { should validate_presence_of(:email) }
  it { should have_many(:posts) }
  
  describe '.active' do
    it 'returns only active users' do
      active_user = create(:user, active: true)
      create(:user, active: false)
      
      expect(User.active).to eq([active_user])
    end
  end
end
```

## Configuration

### Database (config/database.yml)
```yaml
production:
  adapter: postgresql
  url: <%= ENV['DATABASE_URL'] %>
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
```

### Credentials
```bash
rails credentials:edit
```

```yaml
# config/credentials.yml.enc
secret_key_base: xxx
aws:
  access_key_id: xxx
  secret_access_key: xxx
```

```ruby
# Access in code
Rails.application.credentials.aws[:access_key_id]
```

## Docker Production Setup

```dockerfile
FROM ruby:3.2-alpine
WORKDIR /app

RUN apk add --no-cache postgresql-client tzdata

COPY --from=builder /usr/local/bundle /usr/local/bundle
COPY . .

RUN adduser -D -u 1000 rails && chown -R rails /app
USER rails

ENV RAILS_ENV=production
ENV RAILS_SERVE_STATIC_FILES=true
ENV RAILS_LOG_TO_STDOUT=true

EXPOSE 3000

CMD ["bundle", "exec", "puma", "-C", "config/puma.rb"]
```

## Performance Best Practices

- Use database indexes strategically
- Eager load associations with `includes`
- Use `pluck` for simple data extraction
- Cache expensive operations
- Use fragment caching for views
- Optimize database queries (N+1 detection)
- Use background jobs for slow operations
- Enable YJIT in Ruby 3.x
- Use ActionCable for real-time features

## Security Best Practices

- Use strong parameters
- Enable CSRF protection (default)
- Use `has_secure_password` for authentication
- Set secure headers
- Use SSL in production
- Sanitize user input
- Use parameterized queries (ActiveRecord default)
- Keep dependencies updated
