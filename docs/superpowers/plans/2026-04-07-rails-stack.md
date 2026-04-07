# Rails API Stack Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Ruby on Rails (API-only) implementation of the Atlas Academy class scheduler under `api/ruby/`, exposing the same HTTP contract as the Python/TypeScript/Java/.NET stacks so the existing `web/` frontend works against it unchanged.

**Architecture:** Hand-curated minimal Rails 7.1 API-only app (no `rails new` scaffold — only the files we need). ActiveRecord with native Ruby migrations, RSpec request specs, Puma on port 4000, Postgres via `DATABASE_URL`. A new `docker-compose.ruby.yml` mirrors `docker-compose.python.yml`. All work happens on a feature branch in a git worktree at `.worktrees/feature-rails-stack/`.

**Tech Stack:** Ruby 3.3, Rails 7.1 (API-only), ActiveRecord, `pg` gem, `rack-cors`, `puma`, `rspec-rails`. PostgreSQL 16.

**Source-of-truth for the contract:** `api/python/routes/{classes,parents,registrations}.py`. When in doubt about a response shape or status code, read those files — they are the canonical reference. The plan repeats the relevant snippets so you don't have to.

---

## Conventions used in this plan

- **Run commands from the repo root** (`/Users/travisfrisinger/Documents/projects/pairing-exercise`) unless a step says otherwise.
- **Tests run inside Docker.** The plan assumes you do not have Ruby installed locally. Each test step uses `docker compose -f docker-compose.ruby.yml run --rm api bundle exec rspec ...`. The first such command will trigger a `docker compose build` if the image isn't built yet.
- **Each task ends with a commit.** Commit messages are imperative, ≤72 chars on the first line.
- **TDD where useful**: for endpoints, write the spec first, see it fail, then implement. For pure boilerplate (Gemfile, Dockerfile, config), there is no test — those tasks just create files and verify they parse / boot.

---

## Task 0: Create feature branch and worktree

**Files:**
- New worktree directory: `.worktrees/feature-rails-stack/`

- [ ] **Step 1: Verify clean working tree on main**

Run from repo root:
```bash
git status
```
Expected: `On branch main` and `nothing to commit, working tree clean`. If there are uncommitted changes, stop and ask the user how to proceed.

- [ ] **Step 2: Create the feature branch and worktree**

```bash
git worktree add -b feature/rails-stack .worktrees/feature-rails-stack main
```
Expected output: `Preparing worktree (new branch 'feature/rails-stack')` then `HEAD is now at <sha> ...`.

- [ ] **Step 3: Switch into the worktree for all subsequent work**

```bash
cd .worktrees/feature-rails-stack
pwd
```
Expected: path ends with `.worktrees/feature-rails-stack`. **All remaining tasks run from this directory.** If a command says "from repo root", it means the repo root of this worktree.

- [ ] **Step 4: Verify branch**

```bash
git branch --show-current
```
Expected: `feature/rails-stack`.

---

## Task 1: Scaffold api/ruby/ skeleton (Gemfile, config, bin)

**Files:**
- Create: `api/ruby/Gemfile`
- Create: `api/ruby/config.ru`
- Create: `api/ruby/Rakefile`
- Create: `api/ruby/bin/rails`
- Create: `api/ruby/bin/rake`
- Create: `api/ruby/config/boot.rb`
- Create: `api/ruby/config/application.rb`
- Create: `api/ruby/config/environment.rb`
- Create: `api/ruby/config/database.yml`
- Create: `api/ruby/config/puma.rb`
- Create: `api/ruby/config/routes.rb`
- Create: `api/ruby/config/environments/development.rb`
- Create: `api/ruby/config/environments/test.rb`
- Create: `api/ruby/config/environments/production.rb`
- Create: `api/ruby/config/initializers/cors.rb`
- Create: `api/ruby/.gitignore`

- [ ] **Step 1: Create the directory tree**

```bash
mkdir -p api/ruby/{bin,config/environments,config/initializers,app/controllers,app/models,db/migrate,spec/requests}
```

- [ ] **Step 2: Write `api/ruby/Gemfile`**

```ruby
source "https://rubygems.org"

ruby "3.3.0"

gem "rails", "~> 7.1.0"
gem "pg", "~> 1.5"
gem "puma", "~> 6.4"
gem "rack-cors", "~> 2.0"
gem "bootsnap", "~> 1.18", require: false

group :development, :test do
  gem "rspec-rails", "~> 6.1"
end
```

- [ ] **Step 3: Write `api/ruby/config.ru`**

```ruby
require_relative "config/environment"

run Rails.application
```

- [ ] **Step 4: Write `api/ruby/Rakefile`**

```ruby
require_relative "config/application"

Rails.application.load_tasks
```

- [ ] **Step 5: Write `api/ruby/bin/rails`**

```ruby
#!/usr/bin/env ruby
APP_PATH = File.expand_path("../config/application", __dir__)
require_relative "../config/boot"
require "rails/commands"
```

Then:
```bash
chmod +x api/ruby/bin/rails
```

- [ ] **Step 6: Write `api/ruby/bin/rake`**

```ruby
#!/usr/bin/env ruby
require_relative "../config/boot"
require "rake"
Rake.application.run
```

Then:
```bash
chmod +x api/ruby/bin/rake
```

- [ ] **Step 7: Write `api/ruby/config/boot.rb`**

```ruby
ENV["BUNDLE_GEMFILE"] ||= File.expand_path("../Gemfile", __dir__)

require "bundler/setup"
require "bootsnap/setup"
```

- [ ] **Step 8: Write `api/ruby/config/application.rb`**

```ruby
require_relative "boot"

require "rails"
require "active_model/railtie"
require "active_record/railtie"
require "action_controller/railtie"
require "rails/test_unit/railtie"

Bundler.require(*Rails.groups)

module AtlasAcademy
  class Application < Rails::Application
    config.load_defaults 7.1
    config.api_only = true
  end
end
```

- [ ] **Step 9: Write `api/ruby/config/environment.rb`**

```ruby
require_relative "application"

Rails.application.initialize!
```

- [ ] **Step 10: Write `api/ruby/config/database.yml`**

```yaml
default: &default
  adapter: postgresql
  encoding: unicode
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>
  url: <%= ENV.fetch("DATABASE_URL", "postgresql://atlas:atlas@localhost:5432/atlas_academy") %>

development:
  <<: *default

test:
  <<: *default
  url: <%= ENV.fetch("DATABASE_URL", "postgresql://atlas:atlas@localhost:5432/atlas_academy") %>

production:
  <<: *default
```

- [ ] **Step 11: Write `api/ruby/config/puma.rb`**

```ruby
max_threads_count = ENV.fetch("RAILS_MAX_THREADS", 5)
min_threads_count = ENV.fetch("RAILS_MIN_THREADS") { max_threads_count }
threads min_threads_count, max_threads_count

port ENV.fetch("PORT", 4000)
environment ENV.fetch("RAILS_ENV", "development")
plugin :tmp_restart
```

- [ ] **Step 12: Write `api/ruby/config/routes.rb`**

```ruby
Rails.application.routes.draw do
  get "/health", to: "health#show"

  resources :classes, only: [:index, :show]
  resources :parents, only: [:index]

  get "/registrations/all", to: "registrations#all"
  resources :registrations, only: [:index, :create, :destroy]
end
```

- [ ] **Step 13: Write the three environment files**

`api/ruby/config/environments/development.rb`:
```ruby
Rails.application.configure do
  config.enable_reloading = true
  config.eager_load = false
  config.consider_all_requests_local = true
  config.active_support.deprecation = :log
  config.active_record.migration_error = :page_load
  config.active_record.verbose_query_logs = true
  config.hosts.clear
end
```

`api/ruby/config/environments/test.rb`:
```ruby
Rails.application.configure do
  config.enable_reloading = false
  config.eager_load = false
  config.cache_classes = true
  config.public_file_server.enabled = true
  config.consider_all_requests_local = true
  config.action_dispatch.show_exceptions = :rescuable
  config.active_support.deprecation = :stderr
  config.hosts.clear
end
```

`api/ruby/config/environments/production.rb`:
```ruby
Rails.application.configure do
  config.enable_reloading = false
  config.eager_load = true
  config.consider_all_requests_local = false
  config.log_level = :info
  config.active_support.deprecation = :notify
  config.hosts.clear
end
```

- [ ] **Step 14: Write `api/ruby/config/initializers/cors.rb`**

```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "*"
    resource "*",
      headers: :any,
      methods: %i[get post put patch delete options head]
  end
end
```

- [ ] **Step 15: Write `api/ruby/.gitignore`**

```
/log/*
/tmp/*
!/log/.keep
!/tmp/.keep
/.bundle
/vendor/bundle
/Gemfile.lock
/spec/examples.txt
.byebug_history
```

Note: `Gemfile.lock` is intentionally gitignored. The Docker build runs `bundle install` and resolves it inside the image. This avoids pinning the lock to whatever local Ruby happens to be present.

- [ ] **Step 16: Commit**

```bash
git add api/ruby/
git commit -m "Add Rails API skeleton (Gemfile, config, bin)"
```

---

## Task 2: Add Dockerfile and docker-compose.ruby.yml

**Files:**
- Create: `api/ruby/Dockerfile`
- Create: `docker-compose.ruby.yml`

- [ ] **Step 1: Write `api/ruby/Dockerfile`**

```dockerfile
FROM ruby:3.3.0-slim

ENV LANG=C.UTF-8 \
    BUNDLE_PATH=/usr/local/bundle \
    BUNDLE_JOBS=4 \
    BUNDLE_RETRY=3

RUN apt-get update -qq && \
    apt-get install -y --no-install-recommends \
      build-essential \
      libpq-dev \
      libyaml-dev \
      git && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY Gemfile ./
RUN bundle install

COPY . .

EXPOSE 4000

CMD ["sh", "-c", "bundle exec rails db:prepare && bundle exec rails db:seed && bundle exec rails server -b 0.0.0.0 -p 4000"]
```

- [ ] **Step 2: Write `docker-compose.ruby.yml`**

```yaml
services:
  api:
    build: ./api/ruby
    ports:
      - "4000:4000"
    environment:
      - PORT=4000
      - DATABASE_URL=postgresql://atlas:atlas@db:5432/atlas_academy
      - RAILS_ENV=development
    depends_on:
      db:
        condition: service_healthy
    volumes:
      - ./api/ruby:/app
      - bundle_cache:/usr/local/bundle

  web:
    build: ./web
    ports:
      - "3001:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:4000
    depends_on:
      - api
    volumes:
      - ./web:/app
      - /app/node_modules
      - /app/.next

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=atlas
      - POSTGRES_PASSWORD=atlas
      - POSTGRES_DB=atlas_academy
    ports:
      - "5432:5432"
    volumes:
      - postgres_data_ruby:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U atlas -d atlas_academy"]
      interval: 2s
      timeout: 5s
      retries: 5

volumes:
  postgres_data_ruby:
  bundle_cache:
```

Note the named bundle cache volume — this avoids re-installing gems on every container restart, and the `postgres_data_ruby` volume name is distinct from the python compose file's `postgres_data` so the two stacks don't share state if you bring them up sequentially.

- [ ] **Step 3: Verify the compose file parses**

```bash
docker compose -f docker-compose.ruby.yml config > /dev/null
```
Expected: exits 0 with no output.

- [ ] **Step 4: Build the api image** (this confirms the Dockerfile + Gemfile are valid before we depend on them in subsequent tasks)

```bash
docker compose -f docker-compose.ruby.yml build api
```
Expected: ends with `[+] Building ... DONE`. If it fails on `bundle install` for a missing system lib, fix the apt-get list in the Dockerfile and re-run.

- [ ] **Step 5: Commit**

```bash
git add api/ruby/Dockerfile docker-compose.ruby.yml
git commit -m "Add Dockerfile and docker-compose.ruby.yml for Rails stack"
```

---

## Task 3: Wire up RSpec

**Files:**
- Create: `api/ruby/spec/spec_helper.rb`
- Create: `api/ruby/spec/rails_helper.rb`
- Create: `api/ruby/.rspec`
- Create: `api/ruby/spec/requests/.keep`

- [ ] **Step 1: Write `api/ruby/.rspec`**

```
--require rails_helper
--format documentation
--color
```

- [ ] **Step 2: Write `api/ruby/spec/spec_helper.rb`**

```ruby
RSpec.configure do |config|
  config.expect_with :rspec do |expectations|
    expectations.include_chain_clauses_in_custom_matcher_descriptions = true
  end

  config.mock_with :rspec do |mocks|
    mocks.verify_partial_doubles = true
  end

  config.shared_context_metadata_behavior = :apply_to_host_groups
  config.filter_run_when_matching :focus
  config.example_status_persistence_file_path = "spec/examples.txt"
  config.disable_monkey_patching!
  config.warnings = false
  config.default_formatter = "doc" if config.files_to_run.one?
  config.profile_examples = 5
  config.order = :random
  Kernel.srand config.seed
end
```

- [ ] **Step 3: Write `api/ruby/spec/rails_helper.rb`**

```ruby
ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"

abort("The Rails environment is running in production mode!") if Rails.env.production?

require "rspec/rails"

Dir[Rails.root.join("spec", "support", "**", "*.rb")].sort.each { |f| require f }

RSpec.configure do |config|
  config.use_transactional_fixtures = true
  config.infer_spec_type_from_file_location!
  config.filter_rails_from_backtrace!

  config.before(:suite) do
    # Ensure migrations are up to date and seed data exists in the test DB.
    ActiveRecord::Migration.maintain_test_schema!
    load Rails.root.join("db", "seeds.rb")
  end
end
```

- [ ] **Step 4: Touch the requests dir**

```bash
touch api/ruby/spec/requests/.keep
```

- [ ] **Step 5: Commit**

```bash
git add api/ruby/.rspec api/ruby/spec/
git commit -m "Wire up RSpec with rails_helper and seed loading"
```

---

## Task 4: Create the database schema migration

**Files:**
- Create: `api/ruby/db/migrate/20260407000001_create_parents_classes_registrations.rb`

- [ ] **Step 1: Write the migration**

```ruby
class CreateParentsClassesRegistrations < ActiveRecord::Migration[7.1]
  def up
    execute <<~SQL
      CREATE TABLE IF NOT EXISTS parents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS classes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        capacity INTEGER NOT NULL CHECK (capacity > 0),
        start_time TIMESTAMPTZ NOT NULL,
        end_time TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS registrations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
        parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
        status VARCHAR(20) NOT NULL DEFAULT 'registered'
          CHECK (status IN ('registered', 'cancelled')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(class_id, parent_id)
      );

      CREATE INDEX IF NOT EXISTS idx_registrations_class ON registrations(class_id);
      CREATE INDEX IF NOT EXISTS idx_registrations_parent ON registrations(parent_id);
    SQL
  end

  def down
    execute <<~SQL
      DROP TABLE IF EXISTS registrations;
      DROP TABLE IF EXISTS classes;
      DROP TABLE IF EXISTS parents;
    SQL
  end
end
```

This is byte-equivalent to the Python `001_initial.py` migration's table-creation block. Seed data lives in `db/seeds.rb` (next task), not in the migration.

- [ ] **Step 2: Bring up Postgres and run the migration to verify it applies**

```bash
docker compose -f docker-compose.ruby.yml up -d db
docker compose -f docker-compose.ruby.yml run --rm api bundle exec rails db:create db:migrate
```
Expected: ends with `== CreateParentsClassesRegistrations: migrated (...) ===`. If it fails because the DB already exists from a previous compose run, that's fine — `db:create` will say `already exists`, and `db:migrate` will still run.

- [ ] **Step 3: Verify schema**

```bash
docker compose -f docker-compose.ruby.yml exec db psql -U atlas -d atlas_academy -c "\dt"
```
Expected output includes `parents`, `classes`, `registrations`, and `schema_migrations` (Rails-managed).

- [ ] **Step 4: Tear the test stack down (we'll bring it back up for tests in later tasks)**

```bash
docker compose -f docker-compose.ruby.yml down
```

- [ ] **Step 5: Commit**

```bash
git add api/ruby/db/migrate/
git commit -m "Add migration for parents, classes, registrations tables"
```

---

## Task 5: Add ActiveRecord models

**Files:**
- Create: `api/ruby/app/models/application_record.rb`
- Create: `api/ruby/app/models/parent.rb`
- Create: `api/ruby/app/models/klass.rb`
- Create: `api/ruby/app/models/registration.rb`

- [ ] **Step 1: Write `api/ruby/app/models/application_record.rb`**

```ruby
class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class
end
```

- [ ] **Step 2: Write `api/ruby/app/models/parent.rb`**

```ruby
class Parent < ApplicationRecord
  self.table_name = "parents"

  has_many :registrations, dependent: :destroy
end
```

- [ ] **Step 3: Write `api/ruby/app/models/klass.rb`**

```ruby
# Maps to the `classes` table. Named `Klass` because `Class` is a Ruby builtin.
class Klass < ApplicationRecord
  self.table_name = "classes"

  has_many :registrations, foreign_key: :class_id, dependent: :destroy
end
```

- [ ] **Step 4: Write `api/ruby/app/models/registration.rb`**

```ruby
class Registration < ApplicationRecord
  self.table_name = "registrations"

  STATUS_REGISTERED = "registered".freeze
  STATUS_CANCELLED  = "cancelled".freeze

  belongs_to :parent
  belongs_to :klass, foreign_key: :class_id

  scope :active, -> { where(status: STATUS_REGISTERED) }
end
```

- [ ] **Step 5: Boot Rails to verify models load cleanly**

```bash
docker compose -f docker-compose.ruby.yml up -d db
docker compose -f docker-compose.ruby.yml run --rm api bundle exec rails runner "puts [Parent, Klass, Registration].map(&:name).join(',')"
```
Expected output: `Parent,Klass,Registration` followed by clean exit. If it errors with "uninitialized constant", check the file paths and class names.

- [ ] **Step 6: Tear down**

```bash
docker compose -f docker-compose.ruby.yml down
```

- [ ] **Step 7: Commit**

```bash
git add api/ruby/app/models/
git commit -m "Add Parent, Klass, Registration ActiveRecord models"
```

---

## Task 6: Add seed data

**Files:**
- Create: `api/ruby/db/seeds.rb`

- [ ] **Step 1: Write `api/ruby/db/seeds.rb`**

```ruby
# Idempotent seed: matches db/init.sql and api/python/migrations/versions/001_initial.py.
# Uses raw SQL with ON CONFLICT so re-running is a no-op.

ActiveRecord::Base.connection.execute <<~SQL
  INSERT INTO parents (id, email, name) VALUES
    ('11111111-1111-1111-1111-111111111111', 'alice@example.com', 'Alice Smith'),
    ('22222222-2222-2222-2222-222222222222', 'bob@example.com',   'Bob Jones'),
    ('33333333-3333-3333-3333-333333333333', 'carol@example.com', 'Carol Lee'),
    ('44444444-4444-4444-4444-444444444444', 'dan@example.com',   'Dan Patel'),
    ('55555555-5555-5555-5555-555555555555', 'eva@example.com',   'Eva Garcia'),
    ('66666666-6666-6666-6666-666666666666', 'frank@example.com', 'Frank Wu'),
    ('77777777-7777-7777-7777-777777777777', 'grace@example.com', 'Grace Kim')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO classes (id, name, description, capacity, start_time, end_time) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Piano for Beginners', 'Learn basic piano',
       2, NOW() + INTERVAL '7 days',  NOW() + INTERVAL '7 days'  + INTERVAL '1 hour'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Chess Club',          'Strategic thinking',
       3, NOW() + INTERVAL '14 days', NOW() + INTERVAL '14 days' + INTERVAL '1 hour'),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Art & Crafts',        'Creative expression',
       4, NOW() + INTERVAL '21 days', NOW() + INTERVAL '21 days' + INTERVAL '1 hour')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO registrations (class_id, parent_id, status) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'registered'),
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'registered')
  ON CONFLICT (class_id, parent_id) DO NOTHING;
SQL

puts "Seeds applied: #{Parent.count} parents, #{Klass.count} classes, #{Registration.count} registrations"
```

- [ ] **Step 2: Verify seeds run cleanly**

```bash
docker compose -f docker-compose.ruby.yml up -d db
docker compose -f docker-compose.ruby.yml run --rm api bundle exec rails db:prepare db:seed
```
Expected last line: `Seeds applied: 7 parents, 3 classes, 2 registrations`.

- [ ] **Step 3: Verify idempotency by running seed again**

```bash
docker compose -f docker-compose.ruby.yml run --rm api bundle exec rails db:seed
```
Expected last line: `Seeds applied: 7 parents, 3 classes, 2 registrations` (same counts, no errors).

- [ ] **Step 4: Tear down**

```bash
docker compose -f docker-compose.ruby.yml down
```

- [ ] **Step 5: Commit**

```bash
git add api/ruby/db/seeds.rb
git commit -m "Add idempotent seed data for parents, classes, registrations"
```

---

## Task 7: ApplicationController + health endpoint (TDD)

**Files:**
- Create: `api/ruby/app/controllers/application_controller.rb`
- Create: `api/ruby/app/controllers/health_controller.rb`
- Create: `api/ruby/spec/requests/health_spec.rb`

- [ ] **Step 1: Write the failing spec**

`api/ruby/spec/requests/health_spec.rb`:
```ruby
require "rails_helper"

RSpec.describe "GET /health", type: :request do
  it "returns ok" do
    get "/health"
    expect(response).to have_http_status(:ok)
    expect(response.parsed_body).to eq("status" => "ok")
  end
end
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
docker compose -f docker-compose.ruby.yml up -d db
docker compose -f docker-compose.ruby.yml run --rm -e RAILS_ENV=test api bundle exec rspec spec/requests/health_spec.rb
```
Expected: failure — either an `ActionController::RoutingError` for `health#show` (controller missing) or `uninitialized constant HealthController`.

- [ ] **Step 3: Write `api/ruby/app/controllers/application_controller.rb`**

```ruby
class ApplicationController < ActionController::API
  rescue_from ActiveRecord::RecordNotFound, with: :render_not_found

  private

  def render_error(message, status)
    render json: { error: message }, status: status
  end

  def render_not_found(exception = nil)
    render_error(exception&.message || "Not found", :not_found)
  end
end
```

- [ ] **Step 4: Write `api/ruby/app/controllers/health_controller.rb`**

```ruby
class HealthController < ApplicationController
  def show
    render json: { status: "ok" }
  end
end
```

- [ ] **Step 5: Run the test to verify it passes**

```bash
docker compose -f docker-compose.ruby.yml run --rm -e RAILS_ENV=test api bundle exec rspec spec/requests/health_spec.rb
```
Expected: `1 example, 0 failures`.

- [ ] **Step 6: Commit**

```bash
git add api/ruby/app/controllers/ api/ruby/spec/requests/health_spec.rb
git commit -m "Add health endpoint with request spec"
```

---

## Task 8: Parents endpoint (TDD)

**Files:**
- Create: `api/ruby/app/controllers/parents_controller.rb`
- Create: `api/ruby/spec/requests/parents_spec.rb`

- [ ] **Step 1: Write the failing spec**

`api/ruby/spec/requests/parents_spec.rb`:
```ruby
require "rails_helper"

RSpec.describe "GET /parents", type: :request do
  it "returns all seeded parents ordered by name" do
    get "/parents"

    expect(response).to have_http_status(:ok)
    body = response.parsed_body
    expect(body).to be_an(Array)
    expect(body.size).to eq(7)
    expect(body.map { |p| p["name"] }).to eq(body.map { |p| p["name"] }.sort)
    expect(body.first.keys).to contain_exactly("id", "email", "name")
  end

  it "includes Alice Smith's seeded record" do
    get "/parents"
    alice = response.parsed_body.find { |p| p["email"] == "alice@example.com" }
    expect(alice).to include(
      "id"    => "11111111-1111-1111-1111-111111111111",
      "email" => "alice@example.com",
      "name"  => "Alice Smith",
    )
  end
end
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
docker compose -f docker-compose.ruby.yml run --rm -e RAILS_ENV=test api bundle exec rspec spec/requests/parents_spec.rb
```
Expected: failures with `uninitialized constant ParentsController`.

- [ ] **Step 3: Write `api/ruby/app/controllers/parents_controller.rb`**

```ruby
class ParentsController < ApplicationController
  def index
    parents = Parent.order(:name)
    render json: parents.map { |p| serialize(p) }
  end

  private

  def serialize(parent)
    {
      id:    parent.id,
      email: parent.email,
      name:  parent.name,
    }
  end
end
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
docker compose -f docker-compose.ruby.yml run --rm -e RAILS_ENV=test api bundle exec rspec spec/requests/parents_spec.rb
```
Expected: `2 examples, 0 failures`.

- [ ] **Step 5: Commit**

```bash
git add api/ruby/app/controllers/parents_controller.rb api/ruby/spec/requests/parents_spec.rb
git commit -m "Add parents index endpoint"
```

---

## Task 9: Classes endpoint (TDD)

**Files:**
- Create: `api/ruby/app/controllers/classes_controller.rb`
- Create: `api/ruby/spec/requests/classes_spec.rb`

- [ ] **Step 1: Write the failing spec**

`api/ruby/spec/requests/classes_spec.rb`:
```ruby
require "rails_helper"

RSpec.describe "Classes API", type: :request do
  describe "GET /classes" do
    it "returns all seeded classes ordered by start_time" do
      get "/classes"

      expect(response).to have_http_status(:ok)
      body = response.parsed_body
      expect(body).to be_an(Array)
      expect(body.size).to eq(3)

      names = body.map { |c| c["name"] }
      expect(names).to eq(["Piano for Beginners", "Chess Club", "Art & Crafts"])
    end

    it "includes registered_count and capacity" do
      get "/classes"
      piano = response.parsed_body.find { |c| c["name"] == "Piano for Beginners" }

      expect(piano).to include(
        "capacity"         => 2,
        "registered_count" => 2,
      )
      expect(piano.keys).to include(
        "id", "name", "description", "capacity",
        "start_time", "end_time", "created_at", "registered_count",
      )
    end
  end

  describe "GET /classes/:id" do
    it "returns a single class with registered_count" do
      get "/classes/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"

      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to include(
        "id"               => "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        "name"             => "Piano for Beginners",
        "registered_count" => 2,
      )
    end

    it "returns 404 for an unknown id" do
      get "/classes/00000000-0000-0000-0000-000000000000"

      expect(response).to have_http_status(:not_found)
      expect(response.parsed_body).to eq("error" => "Class not found")
    end
  end
end
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
docker compose -f docker-compose.ruby.yml run --rm -e RAILS_ENV=test api bundle exec rspec spec/requests/classes_spec.rb
```
Expected: failures with `uninitialized constant ClassesController`.

- [ ] **Step 3: Write `api/ruby/app/controllers/classes_controller.rb`**

```ruby
class ClassesController < ApplicationController
  def index
    klasses = Klass.order(:start_time)
    counts  = registered_counts_for(klasses.pluck(:id))
    render json: klasses.map { |k| serialize(k, counts.fetch(k.id, 0)) }
  end

  def show
    klass = Klass.find_by(id: params[:id])
    return render_error("Class not found", :not_found) unless klass

    count = registered_counts_for([klass.id]).fetch(klass.id, 0)
    render json: serialize(klass, count)
  end

  private

  def registered_counts_for(class_ids)
    return {} if class_ids.empty?

    Registration
      .active
      .where(class_id: class_ids)
      .group(:class_id)
      .count
  end

  def serialize(klass, registered_count)
    {
      id:               klass.id,
      name:             klass.name,
      description:      klass.description,
      capacity:         klass.capacity,
      start_time:       klass.start_time&.iso8601,
      end_time:         klass.end_time&.iso8601,
      created_at:       klass.created_at&.iso8601,
      registered_count: registered_count,
    }
  end
end
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
docker compose -f docker-compose.ruby.yml run --rm -e RAILS_ENV=test api bundle exec rspec spec/requests/classes_spec.rb
```
Expected: `4 examples, 0 failures`.

- [ ] **Step 5: Commit**

```bash
git add api/ruby/app/controllers/classes_controller.rb api/ruby/spec/requests/classes_spec.rb
git commit -m "Add classes index/show endpoints with registered_count"
```

---

## Task 10: Registrations endpoint — read paths (TDD)

**Files:**
- Create: `api/ruby/app/controllers/registrations_controller.rb`
- Create: `api/ruby/spec/requests/registrations_spec.rb`

This task implements `GET /registrations?parentId=` and `GET /registrations/all`. The write paths (`POST` and `DELETE`) are added in Task 11 to keep this commit focused.

- [ ] **Step 1: Write the failing spec**

`api/ruby/spec/requests/registrations_spec.rb`:
```ruby
require "rails_helper"

RSpec.describe "Registrations API (reads)", type: :request do
  let(:alice_id) { "11111111-1111-1111-1111-111111111111" }
  let(:carol_id) { "33333333-3333-3333-3333-333333333333" }
  let(:piano_id) { "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" }

  describe "GET /registrations?parentId=" do
    it "returns the parent's active registrations wrapped in an object" do
      get "/registrations", params: { parentId: alice_id }

      expect(response).to have_http_status(:ok)
      body = response.parsed_body
      expect(body).to have_key("registrations")
      expect(body["registrations"]).to be_an(Array)

      reg = body["registrations"].first
      expect(reg).to include(
        "class_id"   => piano_id,
        "status"     => "registered",
        "class_name" => "Piano for Beginners",
      )
      expect(reg.keys).to contain_exactly("id", "class_id", "status", "class_name")
    end

    it "returns an empty array when the parent has no registrations" do
      get "/registrations", params: { parentId: carol_id }
      expect(response).to have_http_status(:ok)
      expect(response.parsed_body).to eq("registrations" => [])
    end
  end

  describe "GET /registrations/all" do
    it "returns all active registrations as a flat array" do
      get "/registrations/all"

      expect(response).to have_http_status(:ok)
      body = response.parsed_body
      expect(body).to be_an(Array)
      expect(body.size).to be >= 2 # Alice + Bob seeded into Piano

      sample = body.first
      expect(sample.keys).to contain_exactly(
        "id", "class_id", "class_name", "parent_name", "parent_email", "created_at",
      )
    end
  end
end
```

- [ ] **Step 2: Run the test to verify it fails**

```bash
docker compose -f docker-compose.ruby.yml run --rm -e RAILS_ENV=test api bundle exec rspec spec/requests/registrations_spec.rb
```
Expected: failures with `uninitialized constant RegistrationsController`.

- [ ] **Step 3: Write `api/ruby/app/controllers/registrations_controller.rb`**

```ruby
class RegistrationsController < ApplicationController
  def index
    parent_id = params[:parentId]
    rows = Registration
      .active
      .joins(:klass)
      .where(parent_id: parent_id)
      .order("classes.start_time ASC")
      .pluck("registrations.id", "registrations.class_id", "registrations.status", "classes.name")

    payload = rows.map do |id, class_id, status, class_name|
      {
        id:         id,
        class_id:   class_id,
        status:     status,
        class_name: class_name,
      }
    end

    render json: { registrations: payload }
  end

  def all
    rows = Registration
      .active
      .joins(:klass, :parent)
      .order("classes.start_time ASC, parents.name ASC")
      .pluck(
        "registrations.id",
        "registrations.class_id",
        "classes.name",
        "parents.name",
        "parents.email",
        "registrations.created_at",
      )

    payload = rows.map do |id, class_id, class_name, parent_name, parent_email, created_at|
      {
        id:           id,
        class_id:     class_id,
        class_name:   class_name,
        parent_name:  parent_name,
        parent_email: parent_email,
        created_at:   created_at&.iso8601,
      }
    end

    render json: payload
  end
end
```

- [ ] **Step 4: Run the test to verify it passes**

```bash
docker compose -f docker-compose.ruby.yml run --rm -e RAILS_ENV=test api bundle exec rspec spec/requests/registrations_spec.rb
```
Expected: `3 examples, 0 failures`.

- [ ] **Step 5: Commit**

```bash
git add api/ruby/app/controllers/registrations_controller.rb api/ruby/spec/requests/registrations_spec.rb
git commit -m "Add registrations index and all read endpoints"
```

---

## Task 11: Registrations endpoint — write paths (TDD)

**Files:**
- Modify: `api/ruby/app/controllers/registrations_controller.rb`
- Modify: `api/ruby/spec/requests/registrations_spec.rb`

This task adds `POST /registrations` (with row-level lock + upsert behavior) and `DELETE /registrations/:id` (soft delete).

- [ ] **Step 1: Add failing specs to `spec/requests/registrations_spec.rb`**

Append the following inside the existing top-level `RSpec.describe` block, after the existing `describe "GET /registrations/all"` block:

```ruby
  describe "POST /registrations" do
    let(:chess_id) { "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb" }
    let(:art_id)   { "cccccccc-cccc-cccc-cccc-cccccccccccc" }
    let(:dan_id)   { "44444444-4444-4444-4444-444444444444" }
    let(:eva_id)   { "55555555-5555-5555-5555-555555555555" }

    it "creates a registration for an available class and returns 201" do
      post "/registrations", params: { classId: chess_id, parentId: dan_id }, as: :json

      expect(response).to have_http_status(:created)
      expect(response.parsed_body).to eq(
        "status"  => "registered",
        "message" => "Successfully registered for class",
      )

      created = Registration.find_by(class_id: chess_id, parent_id: dan_id)
      expect(created).not_to be_nil
      expect(created.status).to eq("registered")
    end

    it "returns 409 when the class is full" do
      post "/registrations",
           params: { classId: piano_id, parentId: dan_id },
           as: :json

      expect(response).to have_http_status(:conflict)
      expect(response.parsed_body).to eq("error" => "Class is full")
    end

    it "returns 404 when the class does not exist" do
      post "/registrations",
           params: { classId: "00000000-0000-0000-0000-000000000000", parentId: dan_id },
           as: :json

      expect(response).to have_http_status(:not_found)
      expect(response.parsed_body).to eq("error" => "Class not found")
    end

    it "returns 404 when the parent does not exist" do
      post "/registrations",
           params: { classId: chess_id, parentId: "00000000-0000-0000-0000-000000000000" },
           as: :json

      expect(response).to have_http_status(:not_found)
      expect(response.parsed_body).to eq("error" => "Parent not found")
    end

    it "reactivates a previously cancelled registration (upsert)" do
      Registration.create!(class_id: art_id, parent_id: eva_id, status: "cancelled")

      post "/registrations", params: { classId: art_id, parentId: eva_id }, as: :json

      expect(response).to have_http_status(:created)
      rows = Registration.where(class_id: art_id, parent_id: eva_id)
      expect(rows.size).to eq(1)
      expect(rows.first.status).to eq("registered")
    end
  end

  describe "DELETE /registrations/:id" do
    let(:bob_id) { "22222222-2222-2222-2222-222222222222" }

    it "soft-deletes the registration and returns 204" do
      reg = Registration.find_by!(class_id: piano_id, parent_id: bob_id)

      delete "/registrations/#{reg.id}"

      expect(response).to have_http_status(:no_content)
      expect(reg.reload.status).to eq("cancelled")
    end

    it "returns 404 for an already-cancelled registration" do
      reg = Registration.find_by!(class_id: piano_id, parent_id: bob_id)
      reg.update!(status: "cancelled")

      delete "/registrations/#{reg.id}"

      expect(response).to have_http_status(:not_found)
      expect(response.parsed_body).to eq("error" => "Registration not found")
    end

    it "returns 404 for an unknown id" do
      delete "/registrations/00000000-0000-0000-0000-000000000000"

      expect(response).to have_http_status(:not_found)
      expect(response.parsed_body).to eq("error" => "Registration not found")
    end
  end
```

- [ ] **Step 2: Run the new tests to verify they fail**

```bash
docker compose -f docker-compose.ruby.yml run --rm -e RAILS_ENV=test api bundle exec rspec spec/requests/registrations_spec.rb
```
Expected: 8 failures (5 POST + 3 DELETE), all because the actions don't exist yet (`AbstractController::ActionNotFound` or routing errors).

- [ ] **Step 3: Add the `create` and `destroy` actions to the controller**

Replace `api/ruby/app/controllers/registrations_controller.rb` with:

```ruby
class RegistrationsController < ApplicationController
  def index
    parent_id = params[:parentId]
    rows = Registration
      .active
      .joins(:klass)
      .where(parent_id: parent_id)
      .order("classes.start_time ASC")
      .pluck("registrations.id", "registrations.class_id", "registrations.status", "classes.name")

    payload = rows.map do |id, class_id, status, class_name|
      {
        id:         id,
        class_id:   class_id,
        status:     status,
        class_name: class_name,
      }
    end

    render json: { registrations: payload }
  end

  def all
    rows = Registration
      .active
      .joins(:klass, :parent)
      .order("classes.start_time ASC, parents.name ASC")
      .pluck(
        "registrations.id",
        "registrations.class_id",
        "classes.name",
        "parents.name",
        "parents.email",
        "registrations.created_at",
      )

    payload = rows.map do |id, class_id, class_name, parent_name, parent_email, created_at|
      {
        id:           id,
        class_id:     class_id,
        class_name:   class_name,
        parent_name:  parent_name,
        parent_email: parent_email,
        created_at:   created_at&.iso8601,
      }
    end

    render json: payload
  end

  def create
    class_id  = params[:classId]
    parent_id = params[:parentId]

    Registration.transaction do
      klass = Klass.lock.find_by(id: class_id)
      return render_error("Class not found", :not_found) unless klass

      parent = Parent.find_by(id: parent_id)
      return render_error("Parent not found", :not_found) unless parent

      registered_count = Registration.active.where(class_id: class_id).count
      if registered_count >= klass.capacity
        return render_error("Class is full", :conflict)
      end

      existing = Registration.find_by(class_id: class_id, parent_id: parent_id)
      if existing
        existing.update!(status: Registration::STATUS_REGISTERED)
      else
        Registration.create!(
          class_id:  class_id,
          parent_id: parent_id,
          status:    Registration::STATUS_REGISTERED,
        )
      end
    end

    render json: {
      status:  "registered",
      message: "Successfully registered for class",
    }, status: :created
  end

  def destroy
    reg = Registration.active.find_by(id: params[:id])
    return render_error("Registration not found", :not_found) unless reg

    reg.update!(status: Registration::STATUS_CANCELLED)
    head :no_content
  end
end
```

Notes for the engineer:
- `Klass.lock.find_by(id: ...)` issues `SELECT ... FROM classes WHERE id = $1 FOR UPDATE`. The lock is held until the transaction commits or rolls back, preventing two concurrent registrations from both passing the capacity check.
- The `return render_error(...)` pattern inside the transaction works because `render` writes the response and the block exits — the transaction will still commit (which is fine because no writes happened on the error paths). Do not use `raise ActiveRecord::Rollback` here; we want the response to be sent.
- The `STATUS_REGISTERED` / `STATUS_CANCELLED` constants come from `app/models/registration.rb` (Task 5).

- [ ] **Step 4: Run all registration specs to verify they pass**

```bash
docker compose -f docker-compose.ruby.yml run --rm -e RAILS_ENV=test api bundle exec rspec spec/requests/registrations_spec.rb
```
Expected: `11 examples, 0 failures` (3 read + 5 POST + 3 DELETE).

- [ ] **Step 5: Run the full suite to make sure nothing else broke**

```bash
docker compose -f docker-compose.ruby.yml run --rm -e RAILS_ENV=test api bundle exec rspec
```
Expected: `18 examples, 0 failures` (1 health + 2 parents + 4 classes + 11 registrations).

- [ ] **Step 6: Tear down**

```bash
docker compose -f docker-compose.ruby.yml down
```

- [ ] **Step 7: Commit**

```bash
git add api/ruby/app/controllers/registrations_controller.rb api/ruby/spec/requests/registrations_spec.rb
git commit -m "Add registrations create (with row-lock) and soft-delete"
```

---

## Task 12: End-to-end smoke test against running stack

**Files:** none (manual verification)

- [ ] **Step 1: Bring up the full Ruby stack**

```bash
docker compose -f docker-compose.ruby.yml up -d --build
```
Wait ~30 seconds for the api container to finish migrating + seeding + booting Puma. Tail logs if you're impatient:
```bash
docker compose -f docker-compose.ruby.yml logs -f api
```
Look for `Listening on http://0.0.0.0:4000`. Ctrl-C the log tail when you see it.

- [ ] **Step 2: Hit `/health`**

```bash
curl -sS http://localhost:4000/health
```
Expected: `{"status":"ok"}`.

- [ ] **Step 3: Hit `/classes`**

```bash
curl -sS http://localhost:4000/classes | head -c 400
```
Expected: a JSON array with 3 entries; Piano should have `"registered_count":2,"capacity":2`.

- [ ] **Step 4: Hit `/parents`**

```bash
curl -sS http://localhost:4000/parents
```
Expected: 7 parents in name order.

- [ ] **Step 5: Try to register Dan for Piano (should fail with 409)**

```bash
curl -sS -X POST http://localhost:4000/registrations \
  -H "Content-Type: application/json" \
  -d '{"classId":"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa","parentId":"44444444-4444-4444-4444-444444444444"}'
```
Expected: `{"error":"Class is full"}`. Add `-i` to see the status line — should be `HTTP/1.1 409 Conflict`.

- [ ] **Step 6: Register Dan for Chess (should succeed with 201)**

```bash
curl -sS -i -X POST http://localhost:4000/registrations \
  -H "Content-Type: application/json" \
  -d '{"classId":"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb","parentId":"44444444-4444-4444-4444-444444444444"}'
```
Expected: `HTTP/1.1 201 Created` and body `{"status":"registered","message":"Successfully registered for class"}`.

- [ ] **Step 7: Open the web frontend**

In a browser, visit `http://localhost:3001`. Verify the classes page loads, registrations work, and the admin view shows entries. If anything looks wrong, compare the network panel against `http://localhost:3001` running with the python compose file (`docker compose -f docker-compose.python.yml up`).

- [ ] **Step 8: Tear down**

```bash
docker compose -f docker-compose.ruby.yml down
```

- [ ] **Step 9: Commit any cleanup** (probably nothing to commit; this task is verification-only)

If you discovered and fixed a bug during smoke testing, commit it now with a focused message.

---

## Task 13: Update README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Read the current README**

Run from the worktree root:
```bash
git show HEAD:README.md | head -120
```
Note the existing structure: requirements table, "Pick your language" section, URLs, "Run Tests" section, Architecture stack table, Project Structure tree.

- [ ] **Step 2: Add Ruby row to the local-development requirements table**

Find the table that begins `| Project | Requirement |` and add this row after the `.NET API` row:
```
| Ruby API | Ruby 3.3+ |
```

- [ ] **Step 3: Add a Ruby/Rails block to the "Pick your language" section**

After the `**C#/.NET:**` block, add:
````markdown
**Ruby/Rails:**
```bash
docker compose -f docker-compose.ruby.yml up --build
```
````

- [ ] **Step 4: Add a Ruby block to "Run Tests"**

After the `**C#/.NET:**` test block, add:
````markdown
**Ruby/Rails:**
```bash
cd api/ruby && bundle install && bundle exec rspec
```
````

(Or, if you don't have Ruby installed locally, document the Docker fallback:)
````markdown
docker compose -f docker-compose.ruby.yml run --rm api bundle exec rspec
````

Add both — one as the primary, the other as a parenthetical "or".

- [ ] **Step 5: Add Ruby to the Architecture stack table**

Find the table that begins `| Stack | Framework | ORM / Query | Migrations | Test Framework |` and add:
```
| Ruby | Rails 7.1 (API) | ActiveRecord | ActiveRecord migrations | RSpec |
```

- [ ] **Step 6: Add Ruby to the Project Structure tree**

In the code block under "Project Structure", add `│   └── ruby/          # Rails 7.1 API-only, ActiveRecord (Ruby 3.3)` to the `api/` listing (and shift the `└──` markers as needed), and add `├── docker-compose.ruby.yml` to the file list.

- [ ] **Step 7: Verify the README is well-formed**

```bash
git diff README.md
```
Read the diff and confirm: 5 separate additions, all in the right places, no accidental edits to other lines.

- [ ] **Step 8: Commit**

```bash
git add README.md
git commit -m "Document Ruby/Rails stack in README"
```

---

## Task 14: Final verification + branch handoff

- [ ] **Step 1: Run the full test suite one more time from a clean container**

```bash
docker compose -f docker-compose.ruby.yml down -v
docker compose -f docker-compose.ruby.yml up -d db
docker compose -f docker-compose.ruby.yml run --rm -e RAILS_ENV=test api bundle exec rspec
```
Expected: `18 examples, 0 failures`. The `down -v` ensures we're testing against a fresh DB volume.

- [ ] **Step 2: Tear down**

```bash
docker compose -f docker-compose.ruby.yml down -v
```

- [ ] **Step 3: Confirm git state**

```bash
git status
git log --oneline main..HEAD
```
Expected: clean working tree, ~13 commits on `feature/rails-stack` ahead of `main`.

- [ ] **Step 4: Hand off to user**

Print a summary message to the user listing:
- Branch name: `feature/rails-stack`
- Worktree path: `.worktrees/feature-rails-stack/`
- Commit count
- Test count: 18 passing
- Next steps (merge / PR / further review)

Do not merge or push without the user's explicit approval.

---

## Self-review notes (for the plan author, not the executor)

- **Spec coverage:** Every section of the design spec maps to a task. Layout → Task 1. Schema → Task 4. Models → Task 5. Seeds → Task 6. Endpoints → Tasks 7-11. CORS → Task 1 (initializer). Dockerfile + compose → Task 2. Tests → Tasks 7-11 (TDD inline). README → Task 13.
- **No placeholders:** Each step has runnable commands or complete code blocks.
- **Type consistency:** `Klass` (model) maps to `classes` (table) consistently in Tasks 5, 9, 10, 11. Constants `STATUS_REGISTERED` / `STATUS_CANCELLED` are defined in Task 5 and referenced in Task 11.
- **Commit cadence:** ~13 commits, each focused on one logical change.
