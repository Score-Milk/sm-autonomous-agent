# SM Autonomous Agent

An autonomous agent system built with TypeScript that can engage in conversations and manage different personas. The agent supports various game instructions and can adapt its behavior based on different contexts.

## Tools & Technologies

### Runtime & Framework

- **Bun** - Fast JavaScript runtime and package manager
- **Elysia** - Ergonomic web framework for Bun
- **TypeScript** - Type-safe JavaScript development

### Code Quality & Formatting

- **Biome** - Lightning-fast formatter and linter
- **Ultracite** - Strict type safety and code quality enforcement
- **Husky** - Git hooks for automated quality checks
- **lint-staged** - Run linters on staged files

### Data & Validation

- **Zod** - Schema validation and type inference
- **Alith** - AI/LLM integration library

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
│   │   └── env/               # Environment configuration
│   │       ├── index.ts       # Main env schema combining all configs
│   │       ├── alith.ts       # OpenAI API configuration
│   │       ├── autonomous-agent.ts  # Agent name configuration
│   │       ├── persona-manager.ts   # Persona refresh interval config
│   │       └── airtable.ts    # Airtable API configuration
│   └── models/                # Business logic models
│       ├── autonomous-agent.ts # Core agent functionality
│       ├── chat.ts            # Chat management
│       ├── message.ts         # Message handling
│       └── persona-manager.ts # Persona template management
└── infra/                     # Infrastructure layer
    ├── database/              # Database implementations
    │   ├── index.ts
    │   ├── implementations/   # Concrete database implementations
    │   └── repositories/      # Repository interfaces
    └── http/                  # HTTP layer
        └── chat.ts           # Chat API endpoints
```

### Key Components

- **PersonaManager**: Manages agent personas and game instructions with automatic refresh
- **Environment Configuration**: Type-safe environment variables using Zod schemas
- **Chat System**: HTTP endpoints for chat interaction
- **Clean Architecture**: Separation between application logic and infrastructure

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
   - `AIRTABLE_API_KEY` - Your Airtable API key (starts with "key")
   - `AIRTABLE_BASE_ID` - Your Airtable base ID (starts with "app")
   - `AIRTABLE_PERSONA_TABLE_ID` - Persona table ID (starts with "tbl")
   - `AIRTABLE_GAMES_TABLE_ID` - Games table ID (starts with "tbl")
   - `AIRTABLE_PLATFORMS_TABLE_ID` - Platforms table ID (starts with "tbl")

3. **Start development server**:

   ```bash
   bun run dev
   ```

4. **Access the application**:
   - Health check: `http://localhost:1221/health`
   - Chat endpoints: Available via `/chat` routes

## Development Workflow

1. **Code Formatting**: The project uses Biome for consistent code formatting. Run `bun run format` or rely on pre-commit hooks.

2. **Type Safety**: All environment variables are validated using Zod schemas for runtime type safety.

3. **Hot Reload**: The development server automatically restarts when files change.

4. **Git Hooks**: Husky automatically formats staged files before commits using lint-staged.
