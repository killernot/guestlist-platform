# EPIC-001: Pilot Deployment & Validation

## Objective

Deploy the Guestlist Platform to production and successfully operate the first real venue pilot.

## Success Criteria

- [ ] Platform deployed and accessible via production URL
- [ ] All API routes return correct responses
- [ ] Health endpoint returns 200
- [ ] Venue staff can create events
- [ ] Guests can make reservations
- [ ] QR check-in works end-to-end
- [ ] Google Sheets sync works
- [ ] Analytics reflect real data
- [ ] Zero data loss during pilot
- [ ] Positive feedback from venue staff and guests

---

## Milestones

### M1: Production Deployed

**GitHub Repository Verified:**
- [ ] Repository builds from clean clone
- [ ] No duplicate files or implementations
- [ ] No dead code or unused imports
- [ ] No debug or temporary files
- [ ] No secrets committed
- [ ] `.gitignore` is correct
- [ ] `README.md` is complete
- [ ] `.env.example` is present and accurate

**Vercel Deployment Verified:**
- [ ] Project builds with `next build`
- [ ] No blocking warnings or errors
- [ ] Environment variables configured in Vercel dashboard
- [ ] `.env.example` documents all required variables
- [ ] API routes function correctly
- [ ] Health endpoint (`/api/health`) returns 200
- [ ] No conflicting `vercel.json` configuration
- [ ] Deployment succeeds from clean environment

### M2: Venue Onboarded

- [ ] Venue details collected (name, capacity, contact)
- [ ] Admin account created
- [ ] Google Sheet created and permissions granted
- [ ] Staff accounts created (if applicable)

### M3: First Event Created

- [ ] Event created via admin panel
- [ ] Event page accessible to guests
- [ ] Capacity configured correctly
- [ ] Event details complete (name, date, venue, description)

### M4: Pilot Event Completed

- [ ] Guests made reservations
- [ ] Reservations approved
- [ ] QR codes generated and displayed
- [ ] Guests checked in at the door
- [ ] Google Sheet updated with all data
- [ ] Analytics dashboard shows accurate metrics

### M5: Pilot Retrospective Completed

- [ ] Staff feedback collected
- [ ] Guest feedback collected
- [ ] Analytics reviewed
- [ ] Issues documented and triaged
- [ ] Action items identified for next iteration
- [ ] Post-event report generated

---

## Environment Setup

### Local Development

```bash
# Clone repository
git clone https://github.com/your-org/guestlist-platform.git
cd guestlist-platform

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your local values:
# - DATABASE_URL (local PostgreSQL or Neon connection)
# - NEXTAUTH_SECRET (generate: python3 -c "import secrets; print(secrets.token_hex(32))")
# - NEXTAUTH_URL (http://localhost:3000)

# Set up database
npx prisma migrate deploy
npx prisma generate

# Run development server
npm run dev
```

### Staging (Optional)

Same as local but with a staging database and Vercel preview deployment.

### Production

1. **Vercel Setup:**
   - Connect GitHub repository to Vercel
   - Set framework preset to Next.js
   - Add environment variables in Vercel dashboard
   - Deploy

2. **Database (Neon/PostgreSQL):**
   - Create production database
   - Run `npx prisma migrate deploy`
   - Set `DATABASE_URL` in Vercel

3. **Google Sheets:**
   - Create service account
   - Enable Google Sheets API and Google Drive API
   - Share service account email as editor on the folder
   - Set `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY` in Vercel

4. **Admin Account:**
   - Create via seed script or directly in database
   - Hash password with bcrypt

---

## Rollback Procedure

### GitHub Rollback
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

### Vercel Rollback
1. Go to Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click "..." → "Redeploy"
4. Or promote that deployment to production

### Database Rollback
```bash
# Neon: Use point-in-time recovery
# Self-hosted: Restore from backup
psql $DATABASE_URL < backup-file.sql
```
