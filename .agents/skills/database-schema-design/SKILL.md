---
name: database-schema-design
description: Use when designing or reviewing database schema changes such as tables, columns, constraints, indexes, or migrations. Produces a compatibility-safe schema change order; does not implement application behavior or authorize completion.
---

# Database Schema Design

Own the schema decision and migration order.

## Process

1. State the entities, relationships, invariants, expected cardinality, and query patterns.
2. Choose primary keys, nullability, defaults, unique constraints, foreign keys, and delete behavior deliberately.
3. Add indexes only for known query, join, uniqueness, or ordering needs.
4. Plan compatibility:
   - expand: add backward-compatible schema
   - migrate/backfill: transform and verify existing data
   - switch: deploy code that uses the new shape
   - contract: remove obsolete shape only after no reader depends on it
5. Define rollback or recovery for partial migration.
6. Add schema- and repository-level acceptance checks to the Design/Tasks.

Avoid encoding transient UI state in durable schema, duplicated derivable data without a consistency strategy, and destructive migration without explicit recovery.

## Done when

- Invariants and access patterns justify the schema.
- Migration ordering is compatible with existing data and code.
- Constraints, indexes, recovery, and verification are explicit.
