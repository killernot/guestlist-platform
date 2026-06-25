# Guestlist Platform

Nightclub guestlist and reservation system for Manila venues. Next.js 16 + Prisma (PostgreSQL/Neon) + NextAuth.

## Features

- **Public Event Browsing** — Guests view upcoming events and make reservations
- **QR Check-in** — Staff scan QR codes at the door for instant check-in
- **Admin Dashboard** — Venue staff manage reservations, approve/reject, view analytics
- **Capacity Management** — Real-time capacity enforcement with guest count validation
- **Google Sheets Sync** — Automatic reservation sync to Google Sheets
- **Venue Analytics** — Event attendance, reservation trends, conversion metrics

## Tech Stack

- **Framework:** Next.js 16 (Pages Router)
- **Database:** PostgreSQL via Neon, Prisma ORM
- **Auth:** NextAuth (Credentials provider)
- **Styling:** Tailwind CSS 4
- **Deployment:** Vercel
- **Testing:** Vitest (130 tests)

## Getting Started

```bash
# Clone
git clone https://github.com/killernot/guestlist-platform.git
cd guestlist-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values:
# - DATABASE_URL (Neon PostgreSQL connection string)
# - NEXTAUTH_SECRET (generate: python3 -c "import secrets; print(secrets.token_hex(32))")
# - NEXTAUTH_URL (http://localhost:3000)

# Set up database
npx prisma migrate deploy
npx prisma generate

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deployment

The project is deployed on Vercel. Pushing to `master` triggers automatic deployment.

```bash
# Manual Vercel deployment
vercel --prod
```

## API Routes

| Route | Method | Auth | Description |
|-------|--------|------|-------------|
| `/api/events` | GET | Public | List events |
| `/api/events` | POST | Admin | Create event |
| `/api/events/[id]` | GET | Public | Get event details |
| `api/events/[id]/update` | PUT | Admin | Update event |
| `api/events/[id]/delete` | DELETE | Admin | Delete event |
| `/api/register` | POST | Public | User registration |
| `/api/reservations` | GET | Admin | List reservations |
| `/api/reservations/[id]` | PATCH | Admin | Update reservation status |
| `/api/checkin/scanner` | POST | Admin | QR scanner endpoint |
| `/api/checkin/verify` | POST | Admin | Verify QR token |
| `/api/sheets/sync` | POST | Admin | Trigger Google Sheets sync |
| `/api/analytics/dashboard` | GET | Admin | Dashboard metrics |
| `/api/health` | GET | Public | Health check |

## Environment Variables

See `.env.example` for all required variables.

## Testing

```bash
npm test          # Run all tests (130 tests)
npm run test:coverage  # With coverage report
```

## License

MIT
