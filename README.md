# Task Manager API
A NestJS + TypeScript task management API with JWT authentication and PostgreSQL persistence.
## What this repository contains
This codebase implements:
- User authentication (`/auth/signup`, `/auth/signin`)
- Auth-protected task CRUD APIs (`/tasks`)
- Request validation with DTOs and `class-validator`
- Data persistence via TypeORM entities and repositories
- Unit tests for core task command/query services
## Key technologies
- **NestJS** 
- **TypeScript**
- **TypeORM** + **PostgreSQL**
- **Passport JWT** (`@nestjs/passport`, `@nestjs/jwt`)
- **class-validator / class-transformer**
- **Jest** + `@nestjs/testing` for tests
- **ESLint** + **Prettier** for code quality/formatting
## Project structure
```text
src/
  main.ts                      # app bootstrap, global pipes/interceptors
  app.module.ts                # root module (wires DB + feature modules)
  transform.interceptor.ts     # class-transformer response serialization
  modules/
    auth/
      auth.module.ts
      auth.controller.ts       # signup/signin endpoints
      auth.service.ts          # credential handling + JWT issuing
      jwt.strategy.ts          # bearer token validation
      user.entity.ts           # User table/entity
      dto/
        auth-credentials.dto.ts
    tasks/
      tasks.module.ts
      tasks.controller.ts      # task endpoints (guarded by JWT)
      tasks.service.ts         # orchestration layer
      domain/
        task.entity.ts
        task-status.enum.ts
      dto/
        create-task.dto.ts
        get-tasks-filter.dto.ts
        update-task-status.dto.ts
      commands/                # write-side use cases
        create-task/
        update-task-status/
        delete-task/
      queries/                 # read-side use cases
        get-tasks/
```
## How the code is organized
### 1) Feature-module layout
The app is split by domain features under `src/modules`:
- `auth` handles user registration, login, and JWT validation.
- `tasks` handles task-related endpoints and business logic.
`src/app.module.ts` composes these modules and configures TypeORM.
### 2) Controller → Service flow
- Controllers define HTTP routes and request/response handling.
- Services execute business logic and data access.
- DTOs validate incoming request payloads.
Example flow for tasks:
`TasksController` → `TasksService` → command/query service → TypeORM repository.
### 3) Command/Query separation inside `tasks`
The `tasks` feature uses a lightweight CQRS-style separation:
- **Commands** (`commands/*`): mutate state (`create`, `update status`, `delete`)
- **Queries** (`queries/*`): read state (`get tasks`, `get task by id`)
`TasksService` acts as an orchestration facade that constructs command/query objects and delegates execution.
### 4) Persistence model
- `User` and `Task` are TypeORM entities.
- Relationship: one `User` has many `Task`s; each `Task` belongs to one `User`.
- Task filtering supports status and search text in query services.
### 5) Cross-cutting concerns
- Global validation pipe in `main.ts` enforces DTO rules.
- Global transform interceptor serializes entities to plain objects.
- JWT guard protects `/tasks` endpoints.
