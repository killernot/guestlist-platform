# Guest Journey

## Step 1: Discovery

**How guests find the event:**
- Visit `https://your-domain` (homepage shows upcoming events)
- Browse the events listing at `/events`
- Search by venue name or event name
- Filter by date (Today, This Week, Weekend)
- Click on an event to see details

**What guests see:**
- Event name, date, time, venue
- Capacity bar showing spots remaining
- "Guestlist Open" badge when reservations are active
- Description and event policies

---

## Step 2: Reservation

**How guests reserve:**
1. On the event page, scroll to the reservation form
2. Fill in:
   - **Full Name** (required)
   - **Mobile Number** (required)
   - **Email** (optional, for confirmation)
   - **Instagram** (optional)
   - **Number of Guests** (1-20)
3. Click **Reserve Spot**

**What happens:**
- Instant redirect to confirmation page
- Guest sees: "You're In!" with their reservation code
- Status shows: "Confirmed" or "Pending Approval"
- If pending: "Your QR code will appear after your reservation is approved"

**Time to complete:** ~30 seconds

---

## Step 3: Approval

**How approval works:**
- Venue staff reviews pending reservations in the Admin Dashboard
- Staff clicks **Approve** for valid guests
- Capacity is checked automatically — approval blocked if full
- Approval is immediate (no delay)

**Guest experience:**
- If auto-approved: QR code appears immediately on the success page
- If manual approval: Guest needs to revisit the success page URL after approval
- The QR code URL format: `https://your-domain/reservation-success?code=GL-XXXXXX&name=...&token=...`

---

## Step 4: QR Code

**What the guest sees:**
- Large QR code (256px) on the confirmation page
- Reservation code (e.g., GL-ABCDEF)
- All reservation details
- "Present this QR at the entrance" instruction
- **Download QR as PNG** button for offline access
- Print-friendly layout (can print the QR)

**QR code contains:**
- A signed URL: `https://your-domain/checkin?token=XXXX&code=GL-XXXXXX`
- HMAC-SHA256 signature (tamper-proof)
- 30-day expiry

**Best practices for guests:**
- Screenshot the QR code
- Download the PNG
- Print it out
- Keep the URL bookmarked

---

## Step 5: Arrival

**At the venue:**
1. Guest arrives at the entrance
2. Opens their phone with the QR code ready (or has the reservation code written down)
3. Shows the code to door staff

**What to bring:**
- Phone with QR code OR
- Reservation code (GL-XXXXXX) OR
- Screenshot/printout of the QR

---

## Step 6: Check-In

**How check-in works:**
1. Door staff opens `https://your-domain/admin/scanner`
2. Types the guest's reservation code
3. Presses Enter or taps Verify
4. System shows: guest name, party size, status
5. Guest is checked in automatically
6. Scanner resets after 3 seconds for next guest

**Time per guest:** ~5-10 seconds

**What the guest sees:**
- Green checkmark on the scanner screen
- Their name displayed
- Party size confirmed

**After check-in:**
- Guest enters the venue
- Their status is now "CHECKED_IN" in the system
- Google Sheet updates automatically
- Analytics dashboard reflects the check-in

---

## Troubleshooting for Guests

| Problem | Solution |
|---------|----------|
| Lost QR code | Visit the original confirmation URL or ask staff to look up by name/code |
| QR won't scan | Show the reservation code instead — staff can type it manually |
| "Not approved" error | Wait for venue staff to approve reservations (usually within 30 min) |
| "Already checked in" | You already entered — talk to staff if you left and returned |
| No internet | Staff can check you in once connectivity returns (DB is source of truth) |
| Reservation not found | Check spelling of code, or make a new reservation |
