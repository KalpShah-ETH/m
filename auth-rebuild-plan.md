# MedConnect — Auth Rebuild Plan (Login + Signup)

Replaces the current single-page login/signup with a 3-step signup wizard + email/password login, matching the video. Colors updated to forest green (`#1F5B4E`), no gold/amber.

**Note**: Step 3 (License) fields not yet provided — build Steps 1 & 2 now, License step to follow once you send it.

---

## Login Screen (updated)
- **Email** field (replaces Username — since email is now the verified identifier)
- **Password** field, with show/hide eye icon
- "Login" button (primary, forest green `#1F5B4E`)
- "Forgot Username/Password?" link
- Divider "Or"
- "Login with mobile OTP" button — **keep as disabled/"Coming Soon" alert** (unchanged from current build, since OTP is still deprioritized)
- Divider "Or"
- "Are you a new user? Sign Up" link

**API**: `POST /auth/login` — now takes `email` + `password` instead of `username` + `password`

---

## Signup Wizard — 3 Steps

Top of every step shows a stepper: **① General ② Security ③ License**, with checkmarks on completed steps (matches video exactly — green checkmark circle once a step is done).

### Step 1: General
| Field | Type | Notes |
|---|---|---|
| Type of business * | Dropdown | Options: Chemist, Hospital, Doctor |
| Name of the Shop/Firm * | Text | |
| Name of the Owner * | Text | |
| Shop Address * | Text | |
| Pincode * | Numeric | Triggers Area dropdown lookup (per `pincode_areas` table already in backend list) |
| Area * | Dropdown | Populated from Pincode lookup — shown as a modal list in the video ("Select Area") |
| City | Dropdown | Auto-fills based on pincode/area selection |
| State | Dropdown | Auto-fills based on pincode/area selection |

Buttons: "Back" (disabled on step 1) + "Next" (disabled until required fields filled)

### Step 2: Security
| Field | Type | Notes |
|---|---|---|
| ~~Mobile number~~ | — | **Removed per instruction** — email-only verification |
| Shop Email ID * | Email + inline "Verify" button | Tapping Verify triggers a 6-digit OTP modal (see below) |
| Pharmacist name | Text, optional | |
| Pharmacist number | Text, optional | |
| Password * | Password, with live checklist validation | See rules below |

**Password live validation checklist** (shown below the field, each item turns green with a checkmark as satisfied — matches video exactly):
- At least 8 letters
- At least a number, an uppercase & a lowercase letter
- At least one special character (e.g. `@ - . _ ,`)
- No space at the start or end
- Helper text: "Password example: Abhi@1234, Pharmarack@123, Abhi_1234" *(swap example to your own brand, e.g. "MedConnect@123")*

**Email verification modal** (triggered by "Verify" button):
- Modal title: "Email verification"
- Subtext: "We have sent a verification code to your email {email}"
- 6-digit OTP input boxes (individual boxes, auto-advance per digit — matches video)
- "Didn't get the code? Resend Code in 0:30 Sec" (countdown timer, resend disabled until it hits 0)
- "Verify" button (disabled/greyed until all 6 digits entered)
- Close (X) icon top-left of modal

Once verified, the "Verify" button next to Shop Email ID turns into a checked/confirmed state, and "Next" becomes enabled.

Buttons: "Back" + "Next" (Next disabled until email is verified AND password passes all checklist rules)

### Step 3: License — pending
Not yet specified. Placeholder step exists in the stepper UI (per video), but fields to be added once you send them. Likely candidates based on our earlier discussion: Drug License Number, license document upload.

---

## Icons needed (Lucide, consistent with rest of app)
`store` (type of business), `map-pin` (address/pincode/area), `mail` (email), `check-circle` (verify success), `x` (modal close), `eye`/`eye-off` (password toggle), `lock` (password field), `user` (pharmacist name), `phone` (pharmacist number), `chevron-down` (dropdowns)

---

## APIs needed

- `POST /auth/signup/general` — or hold General+Security fields in local form state and only submit once all 3 steps are complete (recommended — avoids partial/abandoned accounts in the database)
- `POST /auth/send-email-otp` — triggered by "Verify" button, sends 6-digit code to entered email
- `POST /auth/verify-email-otp` — validates the 6-digit code against the email
- `GET /pincode-areas?pincode={code}` — returns matching areas/city/state for the Area dropdown (queries the `pincode_areas` table already planned in backend list)
- `POST /auth/signup` — final submission once all steps complete (General + Security + License fields together), creates the `profiles` row with `approval_status = 'pending'` per your earlier admin-approval flow
- `POST /auth/login` — now email + password

---

## Database changes needed (update to `profiles` table)
| Column | Type | Notes |
|---|---|---|
| business_type | text | `'chemist' \| 'hospital' \| 'doctor'` |
| shop_firm_name | text | |
| owner_name | text | |
| shop_address | text | |
| pincode | text | already planned |
| area | text | already planned |
| city | text | |
| state | text | |
| shop_email | text | unique — replaces `username` as the login identifier |
| email_verified | boolean | default false, set true after OTP verify |
| pharmacist_name | text | nullable |
| pharmacist_number | text | nullable |
| ~~mobile_number~~ | — | **remove** — no longer collected |

Note: this also means the `authStore.ts` username→fake-email trick (`username@medconnect.local`) is no longer needed — the **real verified shop email becomes the actual Supabase Auth identifier**, which is actually a cleaner setup than what you have now.

---

## Color reference (already in use, confirmed for this rebuild)
- Primary: `#1F5B4E` (forest green) — buttons, active stepper state, links, checkmarks
- Background: `#FAFAFA` off-white
- Text: `#1F2937` charcoal
- Error/validation red: `#DC2626` (used for "Please Enter Valid Email Address" style inline errors, matches video)
- Success green: reuse primary `#1F5B4E` for checkmarks/verified states

---

## How to get the Pincode → Area API (free, no key needed)

Two solid free options, both sourced from the official India Post directory:

**Option 1: postalpincode.in (most commonly used, free, no signup)**
```
GET https://api.postalpincode.in/pincode/{pincode}
```
Example: `https://api.postalpincode.in/pincode/380015`
Returns a list of post offices for that pincode, each with `Name` (area name), `District`, `State`. This is exactly your "Area" dropdown source — map each `Name` to a selectable option, and use `District`/`State` to auto-fill City/State fields.
- No API key required
- <cite index="37-1">Rate limit: 1,000 requests per hour per IP address</cite> — more than enough for signup traffic at your stage
- Live/hosted — no need to import or maintain your own database table


**API call in your app**: on Pincode field blur (once 6 digits entered) → call `GET https://api.postalpincode.in/pincode/{pincode}` → populate Area dropdown with the returned post office names → auto-fill City/State once Area is selected.

---

## UI Structure Reference (layout, top to bottom)

**Global pattern (all signup steps):**
1. Top bar: "Create your account" title, back arrow (top-left, except step 1 which exits to login)
2. Stepper row directly below: `① General — ② Security — ③ License`, current step highlighted in forest green, completed steps shown as a green checkmark circle
3. Scrollable form fields (see per-step breakdown below)
4. Fixed bottom bar: "Back" (outline button, left) + "Next" (solid forest green button, right) — "Next" stays disabled/greyed until required fields on that step are valid

**Login screen layout:**
1. Top illustration (hand + phone + medicine graphic — reuse existing asset, recolored to forest green)
2. "Login" title + "Enter your credentials to access account" subtext
3. Email input field (icon: mail)
4. Password input field (icon: lock, with eye/eye-off toggle on the right)
5. "Login" button (solid, full-width, forest green)
6. "Forgot Username/Password?" text link, centered
7. Divider line with "Or" text
8. "Login with mobile OTP" button (outline style, forest green border/text)
9. Divider line with "Or"
10. "Are you a new user? Sign Up" — Sign Up in forest green, rest in secondary text color

**Step 1 (General) layout:**
1. Stepper header
2. "Type of business" — dropdown, opens as bottom sheet/modal with radio-style list (Chemist, Hospital, Doctor)
3. "Name of the Shop/Firm" — text input
4. "Name of the Owner" — text input
5. "Shop Address" — text input
6. "Pincode" — numeric input, triggers area lookup on blur
7. "Area" — dropdown, opens as modal titled "Select Area" with a scrollable list + close (X) icon top-right
8. "City" — dropdown (auto-filled, editable)
9. "State" — dropdown (auto-filled, editable)
10. Bottom bar: Back (disabled) + Next

**Step 2 (Security) layout:**
1. Stepper header (step 1 now shows green checkmark)
2. "Shop Email ID" — text input with inline "Verify" link/button on the right edge of the field, turns to a checked state once verified
3. Inline error text below (red, `#DC2626`) if email format invalid: "Please Enter Valid Email Address"
4. "Pharmacist name" — text input, labeled "Optional" as placeholder-style hint
5. "Pharmacist number" — text input, labeled "Optional"
6. "Password" — password input, eye/eye-off toggle
7. Live validation checklist directly below password field, each line with a circle icon that fills green + checkmark once satisfied:
   - At least 8 letters
   - At least a number, an uppercase & a lowercase letter
   - At least one special character (For ex: @, -, _, ., ,)
   - No space at the start or end
8. Helper text below checklist: "Password example: MedConnect@123, Abhi_1234" (small, muted gray)
9. Bottom bar: Back + Next

**Email verification modal (overlays Step 2, triggered by "Verify"):**
1. Close (X) icon, top-left
2. "Email verification" title, centered
3. Subtext: "We have sent a verification code to your email {email}"
4. 6 individual OTP digit boxes, centered, auto-advance focus per digit
5. "Didn't get the code?" text
6. "Resend Code in 0:30 Sec" — countdown, becomes a tappable "Resend Code" link once it hits 0
7. "Verify" button, full-width, disabled/grey until all 6 digits entered, turns forest green solid once valid

**Step 3 (License) layout:** — pending your field list

---

## Build order
1. Update `profiles` table schema (add new fields, remove mobile_number)
2. Build `send-email-otp` / `verify-email-otp` edge functions
3. Build Step 1 (General) screen + pincode/area lookup
4. Build Step 2 (Security) screen + password live validation + email verify modal
5. Wait for Step 3 (License) fields, then build
6. Update Login screen to email + password
7. Remove the old username→fake-email workaround from `authStore.ts` and `lib/supabase.ts` trigger logic
