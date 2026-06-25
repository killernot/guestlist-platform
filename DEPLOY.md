# Deployment Guide — guestlist-platform

## Prerequisites

- Node.js 22+
- PostgreSQL 16+ (production) or SQLite (development)
- npm

## Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (prod) or `file:./dev.db` (dev) |
| `NEXTAUTH_SECRET` | Random 64-char hex string. Generate: `python3 -c "import secrets; print(secrets.token_hex(32))"` |
| `NEXTAUTH_URL` | App URL, e.g. `http://localhost:3000` |

## Local Development

```bash
npm install
npx prisma generate
npx prisma db push        # creates tables in SQLite dev.db
npm run dev               # http://localhost:3000
```

## Testing

```bash
npx vitest run            # 29 tests across auth, events, reservations
```

## Production Build

```bash
NODE_ENV=production npx next build
```

Output: `.next/standalone/` (self-contained, no node_modules needed at runtime).

## Docker Deployment

```bash
# Build & run with PostgreSQL
docker compose up -d

# Run migrations inside container
docker compose exec app npx prisma migrate deploy
```

The `docker-compose.yml` includes:
- `app` service: Next.js standalone on port 3000
- `db` service: PostgreSQL 16 Alpine on port 5432
- Health check on db before app starts

## Vercel Deployment

1. Push to GitHub
2. Import repo in Vercel
3. Set environment variables:
   - `DATABASE_URL` = `postgresql://user:***@host:5432/guestlist?schema=public`
   - `NEXTAUTH_SECRET` = random hex string
   - `NEXTAUTH_URL` = your Vercel URL
4. Build command: `npm run build`
5. Output directory: `.next`
6. **After deployment:** Apply pending migrations (see below)

## Production Migrations

### Neon SQL Editor (Recommended)

1. Log into https://neon.tech → SQL Editor
2. Connect to `guestlist` database
3. Paste SQL from `prisma/migrations/<timestamp>_<name>/migration.sql`
4. Execute
5. Verify: `SELECT * FROM "_prisma_migrations" ORDER BY "finished_at" DESC LIMIT 5;`

### CLI (if DATABASE_URL is accessible)

```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

### Mandatory Gate

**Production schema MUST match the deployed Prisma schema before a feature is marked Done.**

Verify with:
```bash
npx prisma migrate status
# Should show: "Database schema is up to date"
```

## PostgreSQL Migration (SQLite → PostgreSQL)

1. Update `DATABASE_URL` in `.env` to PostgreSQL connection string
2. Install adapter: `npm install @prisma/adapter-pg pg`
3. Update `lib/prism.ts`: replace `PrismaLibSql` with `PrismaPg`
4. Update `prisma/schema.prisma`: `provider = "postgresql"`
5. Run: `npx prisma db push` (fresh DB) or `npx prisma migrate deploy`

## Prisma Adapter Reference

| Database | Adapter Package | Import |
|---|---|---|
| SQLite (dev) | `@prisma/adapter-libsql` | `import { PrismaLibSql } from "@prisma/adapter-libsql"` |
| PostgreSQL (prod) | `@prisma/adapter-pg` | `import { PrismaPg } from "@prisma/adapter-pg"` |

## Infrastructure Notes

- **INFRA-001**: Prisma `PrismaPg` adapter may fail authentication (P1000) in Docker-to-Docker scenarios even when raw `pg` Pool connects successfully. Workaround: use `postgresql://user:pass@host:5432/db?sslmode=disable` and ensure `pg_hba.conf` has `host all all all scram-sha-256`.
