# Guestlist Platform — Pilot Runbook

## Overview

This runbook guides venue staff through running a live event using the Guestlist Platform. Follow each phase in order.

---

## Phase 1: Before Event (Day Before / Day Of)

### 1.1 Create the Event

1. Log in to `https://your-domain/admin/login`
2. Navigate to **Events** (or use the admin dashboard)
3. Click **Create Event**
4. Fill in:
   - **Name**: e.g. "Saturday Night with DJ Reidel"
   - **Date**: Event date and time
   - **Venue**: Venue name
   - **Capacity**: Maximum guests (fire-code limit)
   - **Description** (optional)
5. Click **Save**

### 1.2 Share the Event Link

- Share the event page link with promoters/guests: `https://your-domain/events/{event-id}`
- Guests can discover it from the homepage or via direct link

### 1.3 Prepare Google Sheets

1. After creating the event, go to **Admin → Sheets**
2. Click **Create Sheet** to generate a Google Sheet for this event
3. Click **Open Sheet** to verify it opens correctly
4. The sheet auto-creates columns: Code | Full Name | Mobile | Email | Instagram | Guests | Status | Created | Checked In

### 1.4 Test QR Generation

1. Create a test reservation via the admin panel or event page
2. Approve the test reservation
3. Verify the QR code appears on the reservation success page
4. (Optional) Use the scanner to check in the test reservation, then delete it

### 1.5 Prepare Scanner Device

1. Use a mobile phone (iOS/Android) with a modern browser
2. Navigate to `https://your-domain/admin/scanner`
3. Log in with admin/staff credentials
4. Select the event from the dropdown
5. Bookmark the scanner page for quick access during the event

### 1.6 Database Backup

```bash
# If running on Vercel + Neon:
# Neon provides automatic backups — verify in Neon dashboard

# If self-hosted with Docker:
docker exec guestlist-db pg_dump -U guestlist guestlist > backup-$(date +%Y%m%d-%H%M%S).sql
```

---

## Phase 2: During Event (Doors Open)

### 2.1 Approving Reservations

1. Go to **Admin Dashboard**
2. Review pending reservations
3. Click **Approve** for valid guests
4. Capacity is enforced automatically — you'll get an error if the event is full
5. Approved guests immediately receive their QR code on the success page

### 2.2 Checking Guests In

1. Open `https://your-domain/admin/scanner` on your phone
2. Select the event
3. Ask the guest for their **reservation code** (e.g. GL-ABCDEF)
4. Type the code and tap **Verify Code**
5. The system shows: guest name, party size, status
6. The guest is automatically checked in (single step)
7. After 3 seconds, the scanner resets for the next guest

**If the guest has a QR code:**
- They can show it, but camera scanning is not available in this build
- Ask them for the reservation code instead

### 2.3 Google Sheets Sync

- All approved reservations sync automatically to the Google Sheet
- Status updates (CHECKED_IN) sync when check-in occurs
- The sheet updates within 5 seconds of each action
- If sync fails, the platform still works — sync retries automatically

### 2.4 Monitoring Capacity

- Check **Admin → Analytics** for real-time capacity utilization
- The dashboard shows: remaining spots, approved count, checked-in count
- When capacity is reached, new reservations will be blocked

---

## Phase 3: After Event

### 3.1 Review Analytics

1. Go to **Admin → Analytics**
2. Select the event
3. Review metrics:
   - **Attendance Rate**: % of approved guests who checked in
   - **No-Show Rate**: % of approved guests who didn't arrive
   - **Utilization**: How full the event was
   - **Trends**: Reservation and check-in patterns over the week

### 3.2 Export Data

- Google Sheets contains all reservation data — download from Google Sheets as CSV/Excel
- Or use the admin panel to review individual reservations

### 3.3 Archive the Event

1. Go to **Admin → Events**
2. Find the completed event
3. Click **Archive** (or **Delete** if no future need)
4. Note: Deletion is blocked if reservations exist (safety measure)

### 3.4 Post-Event Backup

```bash
# Self-hosted:
docker exec guestlist-db pg_dump -U guestlist guestlist > post-event-$(date +%Y%m%d).sql
```

---

## Quick Reference

| Action | Where |
|--------|-------|
| Create event | Admin → Events → Create |
| Approve reservation | Admin Dashboard → Pending → Approve |
| Open Google Sheet | Admin → Sheets → Open Sheet |
| Check in guest | Admin → Scanner → Enter code |
| View analytics | Admin → Analytics |
| Export data | Google Sheets → File → Download |
