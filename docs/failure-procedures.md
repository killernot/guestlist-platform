# Failure Procedures

## Internet Fails

**Symptoms:** Scanner page won't load, verify API times out

**Immediate action:**
1. Don't panic — the platform is designed to recover
2. Check if mobile data or WiFi is working
3. Switch between WiFi and mobile data
4. If possible, create a mobile hotspot from another phone

**Workaround:**
- If scanner is down, keep a manual list (pen & paper or Notes app)
- Record: code, name, party size
- Enter check-ins into the system once internet is restored
- The platform will accept backdated check-ins

**Prevention:**
- Test internet speed at the venue before the event
- Have a backup phone with data
- Consider a dedicated WiFi hotspot for the scanner

---

## Google Sheets Unavailable

**Symptoms:** Sheet link returns error, sync fails

**Immediate action:**
1. The platform still works — check-ins are stored in PostgreSQL
2. Google Sheets is a secondary mirror, not the source of truth
3. Continue normal operations

**Recovery:**
1. Check Google Cloud Console for API quota issues
2. If auth expired: re-authorize the service account
3. Sync will retry automatically on next reservation/check-in
4. Manual re-sync: Admin → Sheets → Sync All

**Data safety:**
- All data is safe in PostgreSQL
- Google Sheets can be rebuilt from DB at any time
- No data loss occurs

---

## QR Won't Scan

**Symptoms:** Scanner can't read QR code, camera shows error

**Immediate action:**
1. Camera scanning is not available in this build — this is expected
2. Ask the guest for their **reservation code** (GL-XXXXXX)
3. Type the code manually into the scanner
4. Tap Verify Code

**If guest lost their code:**
1. Go to Admin Dashboard
2. Search by guest name or mobile number
3. Provide the code to the guest or check them in directly from admin

---

## Guest Lost QR Code

**Symptoms:** Guest has no QR, no code, no confirmation

**Immediate action:**
1. Ask for their name and mobile number
2. Go to Admin Dashboard → search by name or mobile
3. Find their reservation
4. If approved: provide the code or check them in directly
5. If not approved: ask them to make a new reservation

**Prevention (for future):**
- Encourage guests to screenshot their QR
- Staff can print QR codes at the door if needed

---

## Duplicate Reservation

**Symptoms:** Same person has two reservation codes

**Immediate action:**
1. Check both reservations in the Admin Dashboard
2. Approve only one
3. Reject or delete the duplicate
4. If both were checked in: contact support

**How it happens:**
- Guest reserves twice (impatient or double-tap)
- Different codes, same name/mobile

**Prevention:**
- The system doesn't block duplicate names/mobiles (by design — groups, +1s)
- Staff should check for duplicates before approving large batches

---

## Capacity Reached

**Symptoms:** New reservations blocked, approval returns "at capacity"

**Immediate action:**
1. This is working as intended — fire-code compliance
2. Do not increase capacity beyond the venue's legal limit
3. Set up a waitlist (Google Sheet or manual)
4. If cancellations occur, approve from the waitlist

**If you need to increase capacity:**
1. Edit the event in Admin → Events
2. Increase the capacity number
3. New approvals will work

---

## Scanner App Crashes

**Symptoms:** Scanner page freezes or crashes on mobile

**Immediate action:**
1. Refresh the page
2. If persistent: close browser and reopen
3. Clear browser cache if needed
4. Try a different browser (Chrome recommended)

**Workaround:**
- Use the Admin Dashboard on a laptop to check guests in
- Search by name, click the "Check In" button (if available)

---

## Admin Locked Out

**Symptoms:** Can't log in to admin panel

**Immediate action:**
1. Check URL is correct: `https://your-domain/admin/login`
2. Try password reset (if email is configured)
3. If self-hosted: reset password via database

**Prevention:**
- Save admin credentials securely before the event
- Create a staff account as backup
