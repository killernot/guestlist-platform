# Venue Staff Guide

## Getting Started

1. Open `https://your-domain/admin/login`
2. Log in with your admin or staff credentials
3. You'll see the Admin Dashboard with reservation management

---

## Creating an Event

1. From the admin dashboard, click **Events** in the navigation
2. Click **Create Event**
3. Fill in the form:
   - **Name**: The event name guests will see
   - **Date**: When the event starts
   - **Venue**: The venue name
   - **Capacity**: Maximum number of guests (cannot be exceeded)
   - **Description** (optional): Details about the event
4. Click **Create**
5. Share the event URL with your guests: `https://your-domain/events/{event-id}`

---

## Approving Reservations

1. On the Admin Dashboard, you'll see a list of all reservations
2. Use the **search bar** to find reservations by name, code, or mobile number
3. Use the **status filter** to see only PENDING reservations
4. Click **Approve** next to each valid reservation
5. The system will prevent approval if the event is at capacity
6. Once approved, the guest immediately gets their QR code

**Tip:** Approve reservations in batches (e.g., every 30 minutes) rather than one by one.

---

## Opening Google Sheet

1. Go to **Admin → Sheets** in the navigation
2. Find the event you want
3. Click **Open Sheet** — this opens the linked Google Sheet in a new tab
4. The sheet contains all reservations with their details and status
5. The sheet updates automatically when:
   - New reservations are created
   - Reservations are approved/rejected
   - Guests are checked in

---

## Checking Guests In

1. Open `https://your-domain/admin/scanner` on your phone
2. Select the event from the dropdown
3. Ask the guest for their **reservation code** (starts with GL-)
4. Type the code in the input field
5. Press Enter or tap **Verify Code**
6. You'll see the guest's name, party size, and status
7. The guest is automatically checked in — no second step needed
8. After 3 seconds, the scanner resets for the next guest

**Success indicators:**
- Green checkmark + guest name = successful check-in
- Red error = see error message for next steps

---

## Handling Duplicate Scans

If a guest's code has already been checked in:
- The scanner shows: **"Already Checked In"**
- This is normal — the guest already entered
- No action needed, move to the next guest

If a guest tries to use a code twice (leaves and returns):
- The system will still show "Already Checked In"
- Check with the guest if they actually left the venue
- If they didn't leave, let them back in (no second check-in recorded)

---

## Handling Walk-Ins (No Reservation)

If someone arrives without a reservation:
1. Check if the event has capacity
2. If yes: Ask them to go to the event page and reserve on their phone
3. If the event is sold out: Politely explain the event is full
4. **Do not** create fake reservations — this breaks analytics

---

## Handling Sold-Out Events

When the event reaches capacity:
- New reservations are blocked with "Event is at capacity"
- Existing PENDING reservations cannot be approved
- The admin dashboard shows "Remaining: 0"
- Consider creating a waitlist manually (Google Sheet) for cancellations

---

## Common Scanner Errors

| Error | Meaning | Action |
|-------|---------|--------|
| "Invalid or expired token" | Code is wrong or expired | Ask guest to re-read their code |
| "Already checked in" | Guest already entered | No action needed |
| "Reservation not found" | Code doesn't exist | Check code spelling, try again |
| "Reservation is pending approval" | Not yet approved | Ask guest to wait for approval |
| "Reservation was rejected" | Was rejected by admin | Explain to guest |
| "Network error" | Internet issue | Retry in a few seconds |

---

## Tips for Smooth Operations

- **Pre-approve** reservations 30 minutes before doors open
- **Keep the scanner page open** on your phone during the event
- **Use headphones** if you need to hear the haptic vibration feedback
- **Have a backup device** ready in case your phone dies
- **Check analytics** mid-event to monitor flow rate
