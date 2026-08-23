# AI-Note Market Development Guidelines for Claude Code

This project is a hands-on learning repository strictly following Domain-Driven Design (DDD) and Clean Architecture.

## Critical Instructions (DO NOT SKIP)

1. **Step-by-Step Interactive Workflow (CRITICAL)**:
   - NEVER generate large amounts of code or complete multiple steps at once.
   - Propose 1 concept / 1 file at a time, explain the design rationale, and wait for the user's approval before proceeding.
   - Always communicate in Japanese.
   - Do NOT use emojis anywhere (in code, comments, commit messages, or docs).

2. **Single Source of Truth**:
- Coding & Naming Conventions: docs/00-meta/conventions.md
- Error Handling Strategy (Result type & DomainError): docs/01-architecture/04-error-handling.md
- Testing Strategy (Vitest, AAA pattern, boundary values): docs/01-architecture/05-testing-strategy.md
- Value Object Optimization (Flyweight pattern): docs/01-architecture/07-value-object-optimization.md
- Domain Models & Rules: docs/02-domain-models/overview.md

Key Rules:
1. Do NOT use emojis in code, comments, or documentation.
2. Domain layer must NOT depend on any external frameworks or libraries.
3. Optimize Value Objects using static factory methods and Flyweight caching where applicable.
4. When changing constants or business rules, ALWAYS perform a project-wide grep search to ensure 100% consistency across comments, JSDoc, tests, and docs.
5. ALWAYS proactively propose creating/updating an ADR in `docs/03-adr/` whenever a design or business rationale (Why) is discussed.
