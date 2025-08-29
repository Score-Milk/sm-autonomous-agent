# SM Autonomous Agent

An autonomous agent system built with TypeScript that can engage in conversations and manage different personas. The agent leverages Airtable for persona data management, supports various game instructions, and can adapt its behavior based on different contexts.

## Tools & Technologies

### Runtime & Framework

- **Bun** - Fast JavaScript runtime and package manager
- **Elysia** - Ergonomic web framework for Bun
- **TypeScript** - Type-safe JavaScript development

### AI & Data Sources

- **Alith** - AI/LLM integration library for OpenAI API interactions
- **Airtable** - Cloud-based database for persona, game, and platform data management
  - Used for storing and managing persona templates that define agent behavior
  - Provides structured data for games and platforms the agent can reference
  - Enables dynamic persona updates without code deployments

### Code Quality & Formatting

- **Biome** - Lightning-fast formatter and linter
- **Ultracite** - Strict type safety and code quality enforcement
- **Husky** - Git hooks for automated quality checks
- **lint-staged** - Run linters on staged files

### Data & Validation

- **Zod** - Schema validation and type inference for runtime type safety

## Available Scripts

### Development

```bash
bun run dev
```

Starts the development server with hot reload watching `src/index.ts`

### Production

```bash
bun run start
```

Starts the production server

### Code Quality

```bash
bun run format
```

Formats and lints code using Biome with automatic fixes

```bash
bun run typecheck
```

Runs TypeScript type checking without emitting files

### Testing

```bash
bun run test
```

_Note: Test suite is not yet implemented_

## Project Structure

The `src` folder follows a clean architecture pattern:

```
src/
├── index.ts                    # Application entry point
├── app/                        # Application layer
│   ├── config/
│   │   └── env/               # Environment configuration schemas
│   ├── models/                # Business logic models
│   └── utils/                 # Application utilities
└── infra/                     # Infrastructure layer
    ├── database/              # Database implementations
    │   ├── implementations/   # Concrete database implementations
    │   └── repositories/      # Repository interfaces
    ├── http/                  # HTTP layer & API endpoints
    └── providers/             # External service providers
```

### Key Components

- **Environment Configuration**: Type-safe environment variables using Zod schemas with strict validation
- **Chat System**: HTTP endpoints for chat interaction with persona-aware responses
- **PersonaManager**: Manages agent personas and game instructions with automatic refresh from Airtable
- **AirtableProvider**: Handles integration with Airtable for persona, game, and platform data
- **Clean Architecture**: Clear separation between application logic and infrastructure concerns
- **Utility Functions**: Reusable utilities for caching, retries, platform detection, and URL handling

## Getting Started

1. **Install dependencies**:

   ```bash
   bun install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

   **Required Environment Variables:**
   - `OPENAI_API_KEY` - Your OpenAI API key for AI functionality
   - `AIRTABLE_API_KEY` - Your Airtable Personal Access Token (starts with "pat")
   - `AIRTABLE_BASE_ID` - Your Airtable base ID (starts with "app")
   - `AIRTABLE_PERSONA_TABLE_ID` - Persona table ID (starts with "tbl")
   - `AIRTABLE_GAMES_TABLE_ID` - Games table ID (starts with "tbl")
   - `AIRTABLE_PLATFORMS_TABLE_ID` - Platforms table ID (starts with "tbl")

   **Optional Environment Variables:**
   - `PORT` - Server port (default: 1221)
   - `AUTONOMOUS_AGENT_NAME` - Agent name (default: "MilkMan")
   - `PERSONA_MANAGER_REFRESH_INTERVAL` - Refresh interval in milliseconds (default: 15 minutes)

3. **Set up Airtable**:

   Create tables in your Airtable base with the following structure:
   - **Personas**: Contains agent persona definitions and behavior instructions
   - **Games**: Game-specific data and context the agent can reference
   - **Platforms**: Platform-specific configurations and settings

4. **Start development server**:

   ```bash
   bun run dev
   ```

5. **Access the application**:
   - Health check: `http://localhost:1221/health`
   - Chat endpoints: Available via `/chat` routes

## Development Workflow

1. **Code Formatting**: The project uses Biome for consistent code formatting. Run `bun run format` or rely on pre-commit hooks.

2. **Type Safety**: All environment variables are validated using Zod schemas for runtime type safety with detailed error messages.

3. **Hot Reload**: The development server automatically restarts when files change.

4. **Git Hooks**: Husky automatically formats staged files before commits using lint-staged.

5. **Type Checking**: Run `bun run typecheck` to verify TypeScript types without building.

## Architecture

The system follows clean architecture principles with clear separation of concerns:

- **Application Layer**: Contains business logic, models, and use cases
- **Infrastructure Layer**: Handles external dependencies like databases, HTTP, and third-party services
- **Configuration**: Environment-specific settings with validation
- **Utilities**: Shared functionality used across the application

This structure ensures maintainability, testability, and clear dependency flow from outer layers (infrastructure) to inner layers (business logic).

