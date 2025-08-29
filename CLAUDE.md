# Agent Development Guide

## Build/Test/Lint Commands

- `bun run dev` - Start development server with hot reload
- `bun run start` - Run production server
- `bun run format` - Format and lint code using Biome (auto-fixes issues)

## Code Style & Conventions

### **Formatting & Linting**

- Uses **Biome** with **Ultracite** configuration for strict type safety and AI-friendly code
- Auto-formatting via `bun run format` or pre-commit hooks
- Follow all Ultracite rules (see .cursor/rules/ultracite.mdc for comprehensive guidelines)

### **Imports & Dependencies**

- Use `import` statements, prefer named imports over default
- Import from `zod` as `z` for schemas: `import z from 'zod'`
- Group imports: external deps first, then internal modules
- Check existing usage before adding new dependencies (see package.json)

### **Types & Validation**

- All environment variables validated with Zod schemas in `src/app/config/env/`
- Use `interface` for object shapes, avoid `type` aliases unless necessary
- Prefer `const` assertions and inferred types over explicit typing
- Validate all external data with Zod schemas

### **Naming & Structure**

- Files: kebab-case (`autonomous-agent.ts`, `persona-manager.ts`)
- Classes: PascalCase (`AutonomousAgent`, `PersonaManager`)
- Constants: SCREAMING_SNAKE_CASE (`DEFAULT_AGENT_MODEL`)
- Follow clean architecture: `app/` for business logic, `infra/` for infrastructure

### **Error Handling**

- Use try/catch blocks with proper error logging
- Return structured error objects: `{ success: false, error: message }`
- Log errors with context: `console.error('Operation failed:', error)`
- Handle async operations with proper error propagation

## Task Master AI Instructions

**Import Task Master's development workflow commands and guidelines, treat as if import is in the main CLAUDE.md file.**
@./.taskmaster/CLAUDE.md
