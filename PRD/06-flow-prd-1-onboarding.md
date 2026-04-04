# FLOW PRD 1: User Onboarding Flow

**Document Version**: 1.0  
**Last Updated**: April 4, 2026  
**Status**: Ready for Implementation  
**Related Feature PRDs**: PRD 1 (Authentication)

---

## 1. FLOW OVERVIEW

### Flow Name
**User Onboarding Flow**

### Flow Type
User Journey + System Actions

### Actors Involved
- **Primary**: New User (browser)
- **Secondary**: Supabase Auth (backend)
- **Tertiary**: Vercel (frontend hosting)

### Flow Purpose
Guide a new user from landing page through signup, login, and into the dashboard where they can start using the app.

---

## 2. PRECONDITIONS

Before this flow can start, the following must be true:

- [ ] Web application is deployed and accessible
- [ ] Supabase Auth is configured
- [ ] Landing page is live
- [ ] Database tables exist and are initialized
- [ ] RLS policies are in place

---

## 3. MAIN FLOW (Happy Path - 80% of Users)

```
START: User opens the application URL

STEP 1: Landing Page Loads
├─ User navigates to https://app.example.com
├─ Page loads in <2 seconds
├─ Shows "Subscription Tracker" logo
├─ Shows value proposition: "Track all your subscriptions in one place"
├─ Two buttons visible:
│  ├─ "Sign Up" (blue/primary)
│  └─ "Log In" (white/secondary)
└─ No user data visible (not logged in yet)

STEP 2: User Clicks "Sign Up"
├─ User clicks the "Sign Up" button
├─ Sign Up form modal opens with fields:
│  ├─ Email address (text input, type="email")
│  ├─ Password (text input, type="password")
│  ├─ Confirm Password (text input, type="password")
│  └─ "Sign Up" button (submit)
└─ Form is ready for input

STEP 3: User Enters Signup Details
├─ User enters email: "john.doe@example.com"
├─ User enters password: "MySecurePassword123" (8+ characters)
├─ User confirms password: "MySecurePassword123" (matches)
└─ All fields are filled and valid

STEP 4: Client-Side Validation
├─ Email format validated: john.doe@example.com ✓
├─ Password strength checked: 8+ chars ✓
├─ Passwords match: ✓
└─ All validations pass, form is enabled for submission

STEP 5: User Submits Signup Form
├─ User clicks "Sign Up" button
├─ Button shows loading state: "Creating account..."
├─ API request sent: POST /api/auth/signup
│  └─ Body: { email, password }
└─ Request in flight

STEP 6: Backend Processes Signup
├─ Vercel receives request
├─ Validates email format
├─ Validates password length
├─ Calls Supabase Auth API
├─ Supabase hashes password with bcrypt
├─ Creates user in auth.users table
├─ Generates user ID (UUID)
└─ Returns success

STEP 7: Signup Success Response
├─ API returns HTTP 201 Created
├─ Response body:
│  {
│    "success": true,
│    "message": "Account created successfully",
│    "user": { "id": "...", "email": "john.doe@example.com" }
│  }
└─ Request complete

STEP 8: Frontend Handles Success
├─ Toast notification appears: "Account created! Please log in."
├─ Modal closes
├─ Returns to landing page
└─ User sees login form now instead of signup

STEP 9: User Clicks "Log In"
├─ User clicks "Log In" button on landing page
├─ Login form modal opens with fields:
│  ├─ Email address (text input)
│  ├─ Password (text input)
│  └─ "Log In" button
└─ Form ready for login

STEP 10: User Enters Login Details
├─ User enters email: "john.doe@example.com"
├─ User enters password: "MySecurePassword123"
└─ Both fields filled

STEP 11: User Submits Login Form
├─ User clicks "Log In" button
├─ Button shows loading state: "Logging in..."
├─ API request sent: POST /api/auth/login
│  └─ Body: { email, password }
└─ Request in flight

STEP 12: Backend Validates Credentials
├─ Vercel receives request
├─ Queries Supabase Auth for user with email
├─ Retrieves hashed password
├─ Compares submitted password with hash (bcrypt)
├─ Password matches ✓
└─ User is valid

STEP 13: Session Created
├─ Supabase creates session token
├─ Token is signed and encrypted
├─ Expiration set to 24 hours from now
└─ Token returned in response

STEP 14: Login Success Response
├─ API returns HTTP 200 OK
├─ Response includes:
│  {
│    "success": true,
│    "user": { "id": "...", "email": "john.doe@example.com" },
│    "session": { "access_token": "...", "expires_in": 86400 }
│  }
└─ Request complete

STEP 15: Frontend Stores Session
├─ Supabase SDK receives token
├─ Token stored securely (httpOnly cookie or secure storage)
├─ Session is now active
└─ User is considered logged in

STEP 16: Redirect to Dashboard
├─ Modal closes
├─ Page redirects to /dashboard
├─ Dashboard page loads
├─ GET /api/auth/me called to verify session
└─ Returns current user info

STEP 17: Dashboard Loads
├─ Page fully loads in <2 seconds
├─ Shows "Welcome back, john.doe@example.com"
├─ Shows empty subscription list: "Add a new subscription to get started"
├─ "+ Add Subscription" button visible
├─ Logout button visible in top-right
└─ User can now start using the app

END: User is logged in and on the dashboard
```

---

## 4. DECISION TREE (With Branching Paths)

```
START: User opens landing page
│
├─ Decision 1: Is user already logged in?
│  ├─ YES:
│  │  ├─ Check session token validity
│  │  ├─ If valid: Redirect to /dashboard directly
│  │  └─ If expired: Redirect to /login
│  │
│  └─ NO:
│     └─ Show landing page with "Sign Up" and "Log In" buttons
│        │
│        ├─ Decision 2: User clicks "Sign Up"?
│        │  ├─ YES:
│        │  │  └─ → Go to SIGNUP PATH (below)
│        │  │
│        │  └─ NO:
│        │     └─ Wait for user action
│        │        │
│        │        └─ Decision 3: User clicks "Log In"?
│        │           ├─ YES:
│        │           │  └─ → Go to LOGIN PATH (below)
│        │           │
│        │           └─ NO: User still on landing page
│
SIGNUP PATH:
│
├─ Show signup form
│  ├─ Input: Email (required)
│  ├─ Input: Password (required, 8+ chars)
│  ├─ Input: Confirm Password (must match)
│  └─ Button: "Sign Up"
│
├─ Decision 4: User submits form?
│  ├─ NO:
│  │  └─ User cancels or closes form → Return to landing page
│  │
│  └─ YES: Validate on client
│     │
│     ├─ Decision 5: Email format valid?
│     │  ├─ NO:
│     │  │  └─ Show error: "Invalid email format"
│     │  │     ├─ Return to form
│     │  │     └─ User corrects and retries → Back to Decision 4
│     │  │
│     │  └─ YES: Continue
│     │
│     ├─ Decision 6: Password 8+ characters?
│     │  ├─ NO:
│     │  │  └─ Show error: "Password must be 8+ characters"
│     │  │     └─ User fixes and retries → Back to Decision 4
│     │  │
│     │  └─ YES: Continue
│     │
│     ├─ Decision 7: Passwords match?
│     │  ├─ NO:
│     │  │  └─ Show error: "Passwords don't match"
│     │  │     └─ User corrects and retries → Back to Decision 4
│     │  │
│     │  └─ YES: All validations pass
│     │
│     └─ Send to server: POST /api/auth/signup
│        │
│        ├─ Decision 8: Network request succeeds?
│        │  ├─ NO (Network error):
│        │  │  └─ Show error: "Network error. Check connection and try again"
│        │  │     ├─ Button: "Retry"
│        │  │     └─ User can retry → Send request again
│        │  │
│        │  └─ YES: Request received
│        │     │
│        │     ├─ Decision 9: Email already exists?
│        │     │  ├─ YES (409 Conflict):
│        │     │  │  └─ Show error: "This email is already registered"
│        │     │  │     ├─ Option 1: User tries different email → Back to form
│        │     │  │     └─ Option 2: User clicks "Log In instead" → Go to LOGIN PATH
│        │     │  │
│        │     │  └─ NO: Email is unique
│        │     │     │
│        │     │     ├─ Decision 10: Password validation passed?
│        │     │     │  ├─ NO (400 Bad Request):
│        │     │     │  │  └─ Show error: "Password doesn't meet requirements"
│        │     │     │  │     └─ User fixes password → Back to form
│        │     │     │  │
│        │     │     │  └─ YES: Signup succeeds
│        │     │     │     │
│        │     │     │     └─ Show success toast: "Account created! Please log in."
│        │     │     │        └─ Close modal → Return to landing page
│        │     │     │           └─ Proceed to LOGIN PATH

LOGIN PATH:
│
├─ Show login form
│  ├─ Input: Email (required)
│  ├─ Input: Password (required)
│  └─ Button: "Log In"
│
├─ Decision 11: User submits form?
│  ├─ NO:
│  │  └─ User cancels → Return to landing page
│  │
│  └─ YES: Validate on client
│     │
│     ├─ Decision 12: Email and password not empty?
│     │  ├─ NO:
│     │  │  └─ Show error: "Please fill all fields"
│     │  │     └─ User fills and retries → Back to Decision 11
│     │  │
│     │  └─ YES: Send to server
│     │
│     └─ Send to server: POST /api/auth/login
│        │
│        ├─ Decision 13: Network request succeeds?
│        │  ├─ NO (Network/Timeout):
│        │  │  └─ Show error: "Network error. Please try again."
│        │  │     └─ User retries → Send request again
│        │  │
│        │  └─ YES: Request received
│        │     │
│        │     ├─ Decision 14: Credentials valid?
│        │     │  ├─ NO (401 Unauthorized):
│        │     │  │  └─ Show error: "Invalid email or password"
│        │     │  │     ├─ Clear password field
│        │     │  │     ├─ Option 1: User retries with correct password
│        │     │  │     └─ Option 2: User clicks "Sign up instead" → Go to SIGNUP PATH
│        │     │  │
│        │     │  └─ YES: Credentials match
│        │     │     │
│        │     │     ├─ Decision 15: Rate limit exceeded (too many failed attempts)?
│        │     │     │  ├─ YES (429 Too Many Requests):
│        │     │     │  │  └─ Show error: "Too many login attempts. Try again in 15 min."
│        │     │     │  │     └─ Disable login form for 15 minutes
│        │     │     │  │
│        │     │     │  └─ NO: Rate limit OK
│        │     │     │     │
│        │     │     │     └─ Session created
│        │     │     │        └─ Store session token
│        │     │     │           └─ Show success toast: "Welcome back!"
│        │     │     │              └─ Redirect to /dashboard

END LOGIN PATH:
│
├─ Dashboard loads
├─ Page displays subscriptions (empty for new user)
└─ User can now add subscriptions
```

---

## 5. ERROR PATHS (Comprehensive)

### Error 1: Invalid Email Format
```
Trigger: User enters "notanemail" (no @ symbol)
Flow:
  1. Form submission blocked
  2. Error message: "Please enter a valid email address"
  3. Form stays open
  4. Focus on email field
Recovery:
  - User corrects email
  - Resubmits form
```

### Error 2: Weak Password
```
Trigger: User enters password "pass" (only 4 characters)
Flow:
  1. Error on form: "Password must be at least 8 characters"
  2. Form stays open
  3. Password field cleared
Recovery:
  - User enters stronger password
  - Resubmits form
```

### Error 3: Passwords Don't Match
```
Trigger: User enters "Pass123" and "Pass124" (don't match)
Flow:
  1. Error message: "Passwords don't match"
  2. Confirm password field cleared
  3. Focus on confirm password
Recovery:
  - User re-enters correct password
  - Resubmits form
```

### Error 4: Email Already Registered
```
Trigger: User tries to sign up with existing email "john@example.com"
Flow:
  1. API returns 409 Conflict
  2. Error message: "This email is already registered"
  3. Form stays open
Recovery Options:
  - Option A: Use different email
  - Option B: Click "Already have an account? Log In" to go to login
```

### Error 5: Network Timeout (Signup)
```
Trigger: Network connection drops during POST /api/auth/signup
Flow:
  1. Request waits 10 seconds
  2. Timeout error: "Network error. Please check connection and try again"
  3. Button shows "Retry"
Recovery:
  - User checks connection
  - Clicks Retry
  - Form resubmits
```

### Error 6: Wrong Password (Login)
```
Trigger: User enters correct email, incorrect password
Flow:
  1. API returns 401 Unauthorized
  2. Error message: "Invalid email or password"
  3. Password field cleared (don't reveal if email is valid, for security)
  4. Form stays open
Recovery:
  - User corrects password
  - Resubmits form
  OR
  - User realizes they don't have account, clicks "Sign Up instead"
```

### Error 7: Rate Limiting (Too Many Failed Logins)
```
Trigger: User fails login 5 times in 15 minutes
Flow:
  1. API returns 429 Too Many Requests
  2. Error message: "Too many login attempts. Try again in 15 minutes"
  3. Form disabled
  4. Timer shows countdown
Recovery:
  - Wait 15 minutes
  - Try again with correct password
```

### Error 8: Supabase Auth Service Down
```
Trigger: Supabase is temporarily unavailable
Flow:
  1. API request times out or returns 503
  2. Error message: "Service unavailable. Please try again later"
  3. Suggest checking status page
Recovery:
  - Wait for service to recover
  - Retry login/signup
```

### Error 9: Session Expires While on Login Page
```
Trigger: User left login page open for 24+ hours
Flow:
  1. Session token has expired
  2. Dashboard redirects to login
  3. Message: "Session expired. Please log in again."
Recovery:
  - User logs in again
  - New session created
```

---

## 6. DATA STATE CHANGES

### State Changes During Successful Signup

```
BEFORE signup:
- Database: No user record
- Frontend: Landing page

AFTER signup success:
- Database: 
  - auth.users: New record created
    id: "550e8400-e29b-41d4-a716-446655440000"
    email: "john.doe@example.com"
    encrypted_password: "$2b$12$..." (bcrypt hash)
    created_at: NOW()
- Frontend: Back to landing page (form closes)
- Session: None yet (need to login)
```

### State Changes During Successful Login

```
BEFORE login:
- Frontend: Login form showing
- Session: No session

AFTER login success:
- Frontend: Redirected to /dashboard
- Session: Active
  - access_token: "eyJhbGc..." (JWT)
  - expires_at: NOW() + 24 hours
  - token stored securely
- Database: No changes (read-only operation)
- localStorage/cookies: Session token stored
```

### State Changes During Dashboard Load

```
BEFORE dashboard load:
- Frontend: Redirecting from login
- Session: Active (token in storage)
- Dashboard: Not loaded

AFTER dashboard loads:
- Frontend: Dashboard page fully rendered
- Data fetched: GET /api/subscriptions (returns empty for new user)
- UI state:
  - User name displayed: "john.doe@example.com"
  - Empty subscriptions list
  - "+ Add Subscription" button visible
  - "Logout" button visible
- Real-time listener: Connected to Supabase
```

---

## 7. RELATED FEATURE PRDs

- **PRD 1: Authentication & User Management** - Contains detailed signup/login API specs, error handling, RLS policies
- **PRD 2: Subscription CRUD** - Covers what happens after user lands on dashboard

---

## 8. POSTCONDITIONS (What's True After Flow)

After successful onboarding flow completion:

- ✅ User account created in Supabase Auth
- ✅ User is logged in (session token valid)
- ✅ User can access dashboard
- ✅ User can add/manage subscriptions
- ✅ User data is isolated from other users (RLS enforced)
- ✅ Session persists on page refresh
- ✅ Logout available in UI

---

## 9. ALTERNATIVE FLOWS

### Alternative 1: User Already Has Account
```
Entry: User opens app
Decision: Is user logged in?
  YES:
    - Check session validity
    - If valid: Skip login, go directly to dashboard
    - If expired: Redirect to login
  NO:
    - Show landing page (main flow continues)
```

### Alternative 2: User Recovers Forgotten Password
```
Entry: On login page
User clicks: "Forgot Password?"
  (Out of scope for this PRD, but could happen)
Flow:
  - Email reset link
  - User clicks link
  - Sets new password
  - Proceeds to login
```

### Alternative 3: User Closes Browser Mid-Flow
```
Scenario: User closes browser during signup form
Recovery:
  - Form data lost
  - User opens app again
  - Starts from landing page
  - Can retry signup
```

---

## 10. TESTING CHECKLIST (For AI Agent Validation)

### Happy Path Tests
- [ ] User successfully signs up with valid credentials
- [ ] User successfully logs in with correct email/password
- [ ] User is redirected to dashboard after login
- [ ] Session persists on page refresh
- [ ] Logout clears session and returns to landing page

### Error Path Tests
- [ ] Invalid email format shows error
- [ ] Weak password shows error
- [ ] Password mismatch shows error
- [ ] Duplicate email shows error (during signup)
- [ ] Wrong password shows error (during login)
- [ ] Rate limiting after 5 failed attempts
- [ ] Network timeout shows recoverable error
- [ ] Supabase down shows graceful error

### Security Tests
- [ ] Password never appears in URL or network request
- [ ] Session token stored securely (not in localStorage if possible)
- [ ] Password hashed with bcrypt before storage
- [ ] RLS policies prevent unauthorized data access
- [ ] Unauthenticated users cannot access dashboard

### Edge Case Tests
- [ ] User signs up, closes browser, logs back in
- [ ] Session expires, user redirected to login
- [ ] Multiple tabs: login on Tab A, Tab B auto-authenticates
- [ ] Session in Tab A expires, Tab B detects and redirects

---

## 11. FLOW TIMING

| Step | Expected Duration | Notes |
|------|-------------------|-------|
| Landing page load | <2 sec | CDN cached |
| Form display | <500 ms | Modal animation |
| Signup API call | 2-5 sec | Supabase processing |
| Email validation | <1 sec | Regex check |
| Login API call | 2-5 sec | Supabase processing |
| Dashboard load | <2 sec | Fetch subscriptions |
| **Total onboarding** | **10-30 sec** | Depends on user speed |

---

## 12. SCREENSHOTS / UI REFERENCES

(Provided separately as wireframes or design files)

- Landing page with Sign Up / Log In buttons
- Sign Up form modal
- Log In form modal
- Error messages (red, clear)
- Success toast (green, at top)
- Dashboard (empty state for new user)

---

## 13. ACCESSIBILITY CONSIDERATIONS

- [ ] Form labels associated with inputs (label tag, htmlFor)
- [ ] Error messages announced to screen readers
- [ ] Keyboard navigation (Tab, Enter)
- [ ] Focus visible on form fields
- [ ] Color not only way to convey error (also text)
- [ ] Session timeout warning (optional)

---

**End of Flow PRD 1: User Onboarding**

