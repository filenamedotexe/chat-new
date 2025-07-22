# Database Migrations

## Running Migrations

To run migrations on your Neon database:

1. Make sure your `DATABASE_URL` is set in `.env.local`
2. Run the migrations using the Neon SQL editor or any PostgreSQL client

## Migration Files

- `001_initial_schema.sql` - Creates the initial database schema
- `002_seed_data.sql` - Seeds development data (optional)

## Default Credentials (Development Only)

After running the seed data:
- Admin: `admin@example.com` / `admin123`
- User: `user@example.com` / `user123`

## Manual Migration Command

You can run migrations using the `psql` command:

```bash
psql $DATABASE_URL -f migrations/001_initial_schema.sql
psql $DATABASE_URL -f migrations/002_seed_data.sql
```