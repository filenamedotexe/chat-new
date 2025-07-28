---
description: Database operations and migrations
argument-hint: migrate | check | seed | reset
allowed-tools: Bash
---

Perform database operation: $ARGUMENTS

For "migrate" - Run all migrations:
! for file in migrations/*.sql; do echo "Running $file..."; psql $DATABASE_URL -f "$file"; done

For "check" - Check database status:
! psql $DATABASE_URL -c "\dt"
! psql $DATABASE_URL -c "SELECT id, email, role FROM users LIMIT 5;"
! psql $DATABASE_URL -c "SELECT tablename FROM pg_tables WHERE schemaname = 'public';"

For "seed" - Seed test data:
! psql $DATABASE_URL -f migrations/002_seed_data.sql

For "reset" - Reset database (CAUTION):
Think carefully before doing this. It will delete all data.
You would need to:
1. Drop all tables
2. Re-run all migrations
3. Re-seed test data

Database connection string is in DATABASE_URL environment variable.

Current migrations:
@migrations/

Supabase specific:
- Use Supabase Dashboard for visual management
- RLS policies are managed in Supabase
- Edge Functions in supabase/functions/