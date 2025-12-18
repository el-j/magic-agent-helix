# Elixir Development Guidelines

## Language Overview
Elixir is a functional, concurrent programming language built on the Erlang VM (BEAM). It's designed for building scalable, maintainable applications with excellent support for distributed systems.

## Code Style & Conventions

### Naming
- **Modules**: PascalCase (`MyApp.UserController`)
- **Functions/Variables**: snake_case (`create_user`, `user_id`)
- **Atoms**: snake_case (`:ok`, `:error`, `:user_not_found`)
- **Constants**: snake_case module attributes (`@default_timeout`)

### Pattern Matching
```elixir
# Use pattern matching extensively
def process({:ok, result}), do: result
def process({:error, reason}), do: Logger.error(reason)

# Guards for additional constraints
def divide(a, b) when b != 0, do: {:ok, a / b}
def divide(_, 0), do: {:error, :division_by_zero}
```

### Pipe Operator
```elixir
# Chain operations with |>
user
|> validate_user()
|> create_record()
|> send_welcome_email()
```

## OTP Patterns

### GenServer
```elixir
defmodule MyApp.Worker do
  use GenServer

  def start_link(opts) do
    GenServer.start_link(__MODULE__, opts, name: __MODULE__)
  end

  def init(state) do
    {:ok, state}
  end

  def handle_call({:get, key}, _from, state) do
    {:reply, Map.get(state, key), state}
  end
end
```

### Supervision
```elixir
children = [
  {MyApp.Repo, []},
  {MyApp.Worker, []},
  {Phoenix.PubSub, name: MyApp.PubSub}
]

Supervisor.start_link(children, strategy: :one_for_one)
```

## Phoenix Framework

### Controllers
```elixir
defmodule MyAppWeb.UserController do
  use MyAppWeb, :controller

  def create(conn, %{"user" => user_params}) do
    case Accounts.create_user(user_params) do
      {:ok, user} ->
        conn
        |> put_status(:created)
        |> render("show.json", user: user)

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> render("error.json", changeset: changeset)
    end
  end
end
```

### Contexts
- Group related functionality in contexts
- Keep controllers thin, business logic in contexts
- Use Ecto changesets for validation

## Ecto Database

### Schemas
```elixir
defmodule MyApp.User do
  use Ecto.Schema
  import Ecto.Changeset

  schema "users" do
    field :email, :string
    field :name, :string
    has_many :posts, MyApp.Post

    timestamps()
  end

  def changeset(user, attrs) do
    user
    |> cast(attrs, [:email, :name])
    |> validate_required([:email])
    |> validate_format(:email, ~r/@/)
    |> unique_constraint(:email)
  end
end
```

## Testing

### ExUnit
```elixir
defmodule MyApp.UserTest do
  use MyApp.DataCase

  test "creates user with valid attrs" do
    attrs = %{email: "test@example.com", name: "Test"}
    assert {:ok, user} = Accounts.create_user(attrs)
    assert user.email == "test@example.com"
  end
end
```

## Error Handling
- Use tagged tuples: `{:ok, result}`, `{:error, reason}`
- Pattern match on results
- Use `with` for complex error handling
- Leverage supervisor restart strategies

## Best Practices
- Keep functions pure when possible
- Use immutable data structures
- Leverage concurrency with Task and GenServer
- Follow "let it crash" philosophy
- Use telemetry for observability
- Run `mix format` before committing
