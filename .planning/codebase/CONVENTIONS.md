# Coding Conventions

**Analysis Date:** 2026-03-15

## Naming Patterns

**Files:**
- HTML/CSS: kebab-case (e.g., `index.html`, `input.css`)
- JavaScript/TypeScript: kebab-case (e.g., `error-handler.js`, `fixtures.ts`)
- Unit Tests: `*.test.js` (e.g., `logger.test.js`)
- E2E Tests: `*.spec.ts` (e.g., `verification.spec.ts`)

**Functions:**
- camelCase (e.g., `anonymizeIp`, `translateCloudflareError`)

**Variables:**
- camelCase for local variables and parameters.
- SCREAMING_SNAKE_CASE for constants (e.g., `INVALID_CODE`, `BASE_URL`).

**Types:**
- PascalCase for interfaces and types (e.g., `TestFixtures`).

## Code Style

**Formatting:**
- Consistent use of 2-space indentation.
- Single quotes for strings in JS/TS.
- Semicolons are used.

**Import Organization:**
- ESM (ECMAScript Modules) used throughout.
- Grouping: 1. External libraries, 2. Internal modules/helpers.

## Error Handling

**Patterns:**
- Centralized error mapping in `src/api/shared/error-handler.js`.
- Translation of external service error codes (e.g., Cloudflare Turnstile) to user-friendly internal codes.

## Logging

**Framework:** Custom privacy-focused logger in `src/api/shared/logger.js`.

**Patterns:**
- Mandatory anonymization of IP addresses (removing last octet) before logging.
- Truncation of User Agent strings to 100 characters.
- Structured logging using `context.info(JSON.stringify(logEntry))`.

## Module Design

**Exports:** Named exports preferred over default exports.
