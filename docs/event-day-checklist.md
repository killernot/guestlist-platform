# Event Day Checklist

## Before Doors Open

### Database
- [ ] PostgreSQL database is running and accessible
- [ ] Connection string (`DATABASE_URL`) is correct in environment
- [ ] Prisma migrations are applied: `npx prisma migrate deploy`
- [ ] Run a test query to confirm connectivity

### Admin Login
- [ ] Can log in at `/admin/login`
- [ ] Test that session persists (refresh page)
- [ ] Staff account works (if applicable)
- [ ] Password is saved securely for the event

### Google Sheets
- [ ] Google Service Account credentials are configured
- [ ] `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY` env vars are set
- [ ] Test: create a sheet for the event and verify it opens
- [ ] Verify columns are correct: Code, Full Name, Mobile, Email, Instagram, Guests, Status, Created, Checked In

### Analytics
- [ ] Navigate to Admin → Analytics
- [ ] Select the event
- [ ] Verify metrics load (may show zeros before reservations)
- [ ] Verify event comparison shows the event

### Scanner
- [ ] Open `https://your-domain/admin/scanner` on mobile
- [ ] Log in successfully
- [ ] Select the event from dropdown
- [ ] Test with a test reservation: type code → verify success
- [ ] Check that auto-reset works (3 seconds)
- [ ] Bookmark the scanner page for quick access

### QR Generation
- [ ] Create a test reservation (use your own name)
- [ ] Approve the test reservation
- [ ] Navigate to the reservation success page
- [ ] Verify QR code renders (large, clear)
- [ ] Test "Download QR as PNG" button
- [ ] Delete the test reservation after verification

### Capacity
- [ ] Event capacity is set correctly (fire-code limit)
- [ ] Capacity enforcement works (try approving beyond limit — should fail)
- [ ] Remaining spots display correctly in admin

### Backups
- [ ] Take a database backup before the event:
  ```bash
  # Neon: verify automatic backup is enabled in dashboard
  # Self-hosted:
  docker exec guestlist-db pg_dump -U guestlist guestlist > pre-event-backup.sql
  ```
- [ ] Store backup in a safe location (not just the server)

---

## During Event (Quick Checks)

- [ ] Scanner is open and ready on staff device
- [ ] Reservations are being approved (check Admin Dashboard)
- [ ] Google Sheets is updating (spot-check mid-event)
- [ ] Analytics dashboard shows live data
- [ ] Internet is stable (or backup plan is ready)

---

## After Event

- [ ] Take final database backup
- [ ] Review analytics: attendance rate, no-shows, utilization
- [ ] Download Google Sheets data for records
- [ ] Archive the event
- [ ] Note any issues for next event improvement

---

## Emergency Contacts

| Issue | Contact |
|-------|---------|
| Database down | Neon support / Vercel support |
| Google Sheets API issues | Google Cloud Console |
| Platform bugs | [Your contact] |
| Vercel deployment | vercel.com/support |
