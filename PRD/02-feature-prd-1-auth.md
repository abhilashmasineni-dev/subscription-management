# FEATURE PRD 1: Authentication & User Management

**Document Version**: 1.0  
**Last Updated**: April 4, 2026  
**Status**: Ready for Development  
**Priority**: P0 (Critical - Foundation)

---

## 1. FEATURE OVERVIEW

### Feature Name
**Authentication & User Management**

### What This Feature Does
This feature handles user account creation, secure login, session persistence, and data isolation. It's the foundation that ensures every user can only see and modify their own subscriptions—no cross-user data leaks.

### Why It Matters
- **Security**: Users' personal subscription data must be protected from unauthorized access
- **Foundation**: All other features depend on knowing "who is the current user?"
- **Trust**: Users need confidence their data is private
- **DBMS Concept**: Demonstrates row-level security and user data isolation

### Dependencies
- **None** (This is the foundation; no prior features needed)
- **Blocks**: All other features (CRUD, Real-time, Automation) depend on this

### Estimated Complexity
- **Complexity Level**: Medium
- **Reason**: Supabase Auth handles most of the heavy lifting; we mainly integrate it
- **Development Time**: 2-3 days

---

## 2. USER STORIES WITH ACCEPTANCE CRITERIA

### Story 1: User Signup
**As a** new user  
**I want to** create an account with an email and password  
**So that** I can access the subscription tracker

#### Acceptance Criteria

```gherkin
Scenario 1.1: Successful Signup
Given: I'm on the landing page
When: I click "Sign Up"
Then: A signup form modal appears with fields for email and password
And: I enter valid email (e.g., user@example.com)
And: I enter password (8+ characters)
And: I click "Sign Up" button
Then: API call to POST /api/auth/signup is made
And: Supabase creates user in auth table
And: Success toast shows "Account created! Please log in"
And: Modal closes, returns to landing page
And: I can now use this email to log in

Scenario 1.2: Email Already Exists
Given: Email "john@example.com" already exists in system
When: I try to sign up with "john@example.com"
Then: Error message shows "This email is already registered"
And: Form remains open
And: Can retry with different email

Scenario 1.3: Weak Password
Given: Password field has <8 characters (e.g., "pass123")
When: I click "Sign Up"
Then: Error message shows "Password must be at least 8 characters"
And: Form remains open
And: Can enter stronger password

Scenario 1.4: Invalid Email Format
Given: Email field has invalid format (e.g., "notanemail")
When: I click "Sign Up"
Then: Error message shows "Please enter a valid email address"
And: Form remains open

Scenario 1.5: Network Error During Signup
Given: Network connection drops mid-signup
When: Signup request times out (after 10 seconds)
Then: Error message shows "Network error. Please check connection and try again"
And: Form remains open
And: Can retry signup
```

---

### Story 2: User Login
**As a** registered user  
**I want to** log in with my email and password  
**So that** I can access my subscriptions

#### Acceptance Criteria

```gherkin
Scenario 2.1: Successful Login
Given: I'm on the landing page
And: I have a registered account (email@example.com, password123)
When: I click "Log In"
Then: A login form modal appears
And: I enter email and password
And: I click "Log In" button
Then: API call to POST /api/auth/login is made
And: Supabase validates credentials
And: Session token is created and stored securely
And: Success toast shows "Welcome back!"
And: I'm redirected to dashboard
And: Dashboard shows my subscriptions

Scenario 2.2: Wrong Password
Given: I'm on login form
And: I enter correct email but wrong password
When: I click "Log In"
Then: Error message shows "Invalid email or password"
And: Form remains open (password field cleared)
And: Can retry login

Scenario 2.3: User Doesn't Exist
Given: I'm on login form
And: I enter email that doesn't exist in system
When: I click "Log In"
Then: Error message shows "Invalid email or password" (same as wrong password, for security)
And: Form remains open

Scenario 2.4: Network Error During Login
Given: Network connection drops after I click "Log In"
When: Login request times out (after 10 seconds)
Then: Error message shows "Network error. Please try again"
And: Form remains open
And: Can retry login

Scenario 2.5: Session Auto-Restore
Given: I previously logged in
And: I close browser completely
When: I reopen browser and go to website
Then: Supabase checks for stored session token
And: If token still valid, I'm logged in automatically
And: Dashboard loads without showing login form
And: No need to enter credentials again
```

---

### Story 3: User Logout
**As a** logged-in user  
**I want to** log out from my account  
**So that** others can't access my account on shared devices

#### Acceptance Criteria

```gherkin
Scenario 3.1: Successful Logout
Given: I'm on the dashboard
And: I'm logged in as user@example.com
When: I click "Logout" button (top-right menu)
Then: Session token is cleared
And: Supabase ends session
And: Success toast shows "You've been logged out"
And: I'm redirected to landing page
And: If I try to access dashboard directly, I'm redirected to login
And: Subscription data is no longer visible

Scenario 3.2: Logout on All Tabs
Given: I'm logged in on Tab A and Tab B
When: I click "Logout" on Tab A
Then: Session token is cleared from Supabase
And: Tab B detects logout within 1-2 seconds
And: Tab B redirects to landing page
And: Real-time sync ensures consistency
```

---

### Story 4: Session Persistence
**As a** user  
**I want to** stay logged in when I refresh the page  
**So that** I don't have to re-enter my credentials constantly

#### Acceptance Criteria

```gherkin
Scenario 4.1: Session Persists on Refresh
Given: I'm logged in and on the dashboard
When: I refresh the page (Cmd+R or F5)
Then: Supabase checks for stored session token
And: Token is still valid (not expired)
And: Dashboard loads immediately (no login form)
And: My subscriptions are visible
And: No re-authentication needed

Scenario 4.2: Session Expires
Given: I was logged in >24 hours ago
When: I try to access dashboard
Then: Session token has expired
And: I'm redirected to login page
And: Error message shows "Session expired. Please log in again"
And: Can log in with same credentials

Scenario 4.3: Session on Multiple Devices
Given: I'm logged in on my desktop
When: I log in on my phone
Then: Both sessions are active simultaneously
And: Logging out on phone doesn't affect desktop session
And: Each device maintains independent session
```

---

### Story 5: Account Security
**As a** user  
**I want to** ensure my password is secure  
**So that** my subscription data can't be accessed by others

#### Acceptance Criteria

```gherkin
Scenario 5.1: Password Hashing
Given: User signs up with password "MySecurePass123"
When: Data is stored in Supabase
Then: Password is hashed using bcrypt (industry standard)
And: Raw password is never stored
And: Even database admin cannot read original password
And: If database is leaked, passwords are still protected

Scenario 5.2: Secure Session Token
Given: User logs in successfully
When: Session token is created
Then: Token is random, non-guessable (>128 bits entropy)
And: Token is stored securely (httpOnly cookie or secure storage)
And: Token cannot be accessed by JavaScript (if httpOnly)
And: Token is transmitted over HTTPS only
And: Token expires after 24 hours (configurable)

Scenario 5.3: RLS Policy: User Can Only See Own Data
Given: User A logs in
When: User A queries active_subscriptions table
Then: RLS policy enforces: WHERE user_id = auth.uid()
And: User A only sees subscriptions where user_id = User A's ID
And: User A cannot see User B's subscriptions
And: Even if User A tries SQL injection, RLS blocks it

Scenario 5.4: Prevent Direct Database Access
Given: Hacker obtains database URL
When: Hacker tries to connect directly to PostgreSQL
Then: Connection requires database password
And: Vercel environment variables are not exposed
And: Service role key is server-side only (never in frontend code)
And: Hacker cannot access data without proper auth
```

---

## 3. DATABASE SCHEMA

### Supabase Auth Table: `users`

**Note**: This table is managed by Supabase Auth. We don't create it manually, but we reference it in our RLS policies.

```sql
-- Supabase-managed table (for reference)
CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  encrypted_password VARCHAR(255) NOT NULL,  -- bcrypt hash
  email_confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS users_email_idx ON auth.users(email);
```

### Public Profiles Table: `public.users` (Optional, for user metadata)

If we want to store user-specific settings (name, timezone, preferences), create this:

```sql
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255),
  avatar_url VARCHAR(255),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for user lookups
CREATE INDEX IF NOT EXISTS users_id_idx ON public.users(id);
```

### RLS Policies (Row-Level Security)

```sql
-- Enable RLS on public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  USING (id = auth.uid());

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Policy: Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (id = auth.uid());
```

### Other Tables Reference (from Master PRD)

These tables are defined in detail in Feature PRD 2-4, but we reference them here for RLS:

- `active_subscriptions` - User's current subscriptions (covered in PRD 2)
- `expired_subscriptions` - Archived subscriptions (covered in PRD 4)
- `deleted_subscriptions` - Soft-deleted subscriptions (covered in PRD 4)

---

## 4. API ENDPOINTS / BACKEND OPERATIONS

### Endpoint 1: POST /api/auth/signup

**Purpose**: Create a new user account

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (Success - 201)**:
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "created_at": "2026-04-04T10:00:00Z"
  }
}
```

**Response (Errors)**:

| Status | Error | Reason |
|--------|-------|--------|
| 400 | `invalid_email` | Email format invalid |
| 400 | `weak_password` | Password < 8 characters |
| 409 | `user_exists` | Email already registered |
| 500 | `server_error` | Database or Supabase error |
| 504 | `timeout` | Request took >10 seconds |

**Error Response Example**:
```json
{
  "success": false,
  "error": "user_exists",
  "message": "This email is already registered"
}
```

**Implementation Details**:
- Password must be ≥8 characters
- Email must be valid format
- No SQL injection possible (use Supabase SDK)
- Password is hashed by Supabase Auth
- Returns user ID for frontend (do NOT return password)
- Session token created automatically

---

### Endpoint 2: POST /api/auth/login

**Purpose**: Authenticate existing user and create session

**Request**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com"
  },
  "session": {
    "access_token": "eyJhbGc...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "refresh_token": "..."
  }
}
```

**Response (Errors)**:

| Status | Error | Reason |
|--------|-------|--------|
| 400 | `invalid_credentials` | Email/password wrong or user doesn't exist |
| 429 | `too_many_attempts` | Rate limiting (>5 failed attempts in 15 min) |
| 500 | `server_error` | Supabase error |
| 504 | `timeout` | Request took >10 seconds |

**Error Response Example**:
```json
{
  "success": false,
  "error": "invalid_credentials",
  "message": "Invalid email or password"
}
```

**Implementation Details**:
- Compare submitted password with stored hash
- Don't reveal whether email exists or password is wrong (security)
- Rate limit to prevent brute force attacks
- Session token generated by Supabase
- Token stored securely in frontend (handled by Supabase SDK)

---

### Endpoint 3: POST /api/auth/logout

**Purpose**: End user session and clear auth tokens

**Request**:
```json
{
  "session_token": "eyJhbGc..."  // Optional, can be inferred
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Response (Errors)**:

| Status | Error | Reason |
|--------|-------|--------|
| 401 | `unauthorized` | No valid session token |
| 500 | `server_error` | Supabase error |

**Implementation Details**:
- Clear session token from Supabase
- Clear any client-side storage (if manual storage)
- Redirect frontend to login page
- All browser tabs should detect logout in real-time

---

### Endpoint 4: GET /api/auth/me

**Purpose**: Get current logged-in user info and verify session

**Request**:
```
GET /api/auth/me
Header: Authorization: Bearer <session_token>
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "created_at": "2026-04-04T10:00:00Z"
  }
}
```

**Response (Errors)**:

| Status | Error | Reason |
|--------|-------|--------|
| 401 | `unauthorized` | No valid session or token expired |
| 500 | `server_error` | Supabase error |

**Implementation Details**:
- Used on page load to check if user is logged in
- If successful, load dashboard
- If 401, redirect to login
- Automatically called by Supabase SDK

---

### Endpoint 5: POST /api/auth/refresh-token

**Purpose**: Refresh expired session token

**Request**:
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "session": {
    "access_token": "eyJhbGc...",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
```

**Response (Errors)**:

| Status | Error | Reason |
|--------|-------|--------|
| 401 | `invalid_refresh_token` | Refresh token expired or invalid |
| 500 | `server_error` | Supabase error |

**Implementation Details**:
- Automatically called by Supabase SDK when token expires
- Extends session without requiring re-login
- Refresh token has longer expiry than access token

---

## 5. FRONTEND COMPONENTS & UI FLOW

### Component 1: SignupForm

**Location**: `/components/auth/SignupForm.tsx`

**Props**:
```typescript
interface SignupFormProps {
  onSuccess?: (userId: string) => void;
  onError?: (error: string) => void;
  redirectTo?: string;  // Where to redirect after signup
}
```

**State**:
```typescript
{
  email: string;
  password: string;
  passwordConfirm: string;
  loading: boolean;
  error: string | null;
  showPassword: boolean;  // Toggle show/hide
}
```

**Behavior**:
1. User enters email, password, confirm password
2. On form submit:
   - Validate email format (regex or browser validation)
   - Validate password ≥8 characters
   - Validate passwords match
   - Show error if validation fails
3. If valid:
   - Show loading spinner
   - Call `POST /api/auth/signup`
   - If success: Show success toast, redirect to login
   - If error: Show error message in form
4. Network error: Show "Check your connection"

**UI Elements**:
- Email input field
- Password input field (masked by default)
- Confirm password input field (masked by default)
- Show/hide password toggle (eye icon)
- Sign Up button
- Error message (red text)
- Link to login ("Already have an account? Log In")

---

### Component 2: LoginForm

**Location**: `/components/auth/LoginForm.tsx`

**Props**:
```typescript
interface LoginFormProps {
  onSuccess?: (userId: string) => void;
  onError?: (error: string) => void;
  redirectTo?: string;  // Where to redirect after login
}
```

**State**:
```typescript
{
  email: string;
  password: string;
  loading: boolean;
  error: string | null;
  rememberMe: boolean;  // Optional
  showPassword: boolean;
}
```

**Behavior**:
1. User enters email and password
2. On form submit:
   - Validate email format
   - Validate password not empty
   - Show error if validation fails
3. If valid:
   - Show loading spinner
   - Call `POST /api/auth/login`
   - If success: Session token saved, redirect to dashboard
   - If error: Show error message ("Invalid email or password")
4. Network error: Show "Check your connection"
5. Rate limit error: Show "Too many attempts, try again later"

**UI Elements**:
- Email input field
- Password input field (masked)
- Show/hide password toggle
- "Remember Me" checkbox (optional)
- Login button
- Error message (red text)
- Link to signup ("Don't have an account? Sign Up")
- Link to forgot password (optional for future)

---

### Component 3: AuthLayout

**Location**: `/components/auth/AuthLayout.tsx`

**Purpose**: Wrapper for signup/login forms, shared styling

**Props**:
```typescript
interface AuthLayoutProps {
  children: ReactNode;
  title: string;  // "Sign Up" or "Log In"
  subtitle?: string;
}
```

**Features**:
- Centered card design
- Logo at top
- Form area
- Responsive (mobile-friendly)
- Dark/light theme support (optional)

---

### Component 4: ProtectedRoute

**Location**: `/components/auth/ProtectedRoute.tsx`

**Purpose**: Wrapper that prevents unauthenticated access to pages

**Behavior**:
1. On mount, call `GET /api/auth/me` to check if logged in
2. If logged in: Render children (dashboard)
3. If not logged in (401): Redirect to login page
4. While checking: Show loading spinner

**Used For**:
- Dashboard page
- Subscription pages
- Any page that requires authentication

---

## 6. EDGE CASES & ERROR HANDLING

### Network Errors

#### Scenario: Network Disconnected During Signup
**Condition**: User submits signup form, network drops

**Expected Behavior**:
- Request timeout after 10 seconds
- Show error: "Network error. Please check your connection and try again"
- Form remains open
- User can retry

**Implementation**:
```typescript
try {
  const response = await fetch('/api/auth/signup', { timeout: 10000 });
} catch (error) {
  if (error.name === 'TimeoutError') {
    setError('Network error. Please try again.');
  }
}
```

---

#### Scenario: Network Glitch Mid-Request
**Condition**: Request starts but connection drops halfway

**Expected Behavior**:
- Request fails (error response)
- Show error message
- Form remains open
- Can retry immediately

**Implementation**:
- Vercel automatically retries failed requests once
- If retry fails, show error to user

---

### Validation Errors

#### Scenario: Invalid Email Format
**Condition**: User enters "notanemail" (no @ symbol)

**Expected Behavior**:
- Show error: "Please enter a valid email address"
- Form remains open
- Can correct and retry

**Implementation**:
```typescript
const isValidEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};
```

---

#### Scenario: Weak Password
**Condition**: User enters password "pass" (4 characters)

**Expected Behavior**:
- Show error: "Password must be at least 8 characters"
- Form remains open
- Can enter stronger password

**Implementation**:
```typescript
const isWeakPassword = (password: string) => password.length < 8;
```

---

#### Scenario: Passwords Don't Match
**Condition**: User enters "Pass123" in password, "Pass124" in confirm

**Expected Behavior**:
- Show error: "Passwords don't match"
- Form remains open
- Focus on confirm password field

---

### Data Consistency Errors

#### Scenario: User Session Expires Mid-Operation
**Condition**: User logged in 24+ hours ago, now tries to access dashboard

**Expected Behavior**:
- Session token is expired
- GET /api/auth/me returns 401
- User redirected to login
- Message: "Session expired. Please log in again"
- Can log in immediately with same credentials

**Implementation**:
```typescript
// In ProtectedRoute
if (response.status === 401) {
  router.push('/login?reason=session_expired');
}
```

---

#### Scenario: User Deleted While Logged In
**Condition**: User deleted their account from another device/admin panel

**Expected Behavior**:
- Next API call returns 401 (user not found)
- User redirected to login
- Message: "Your account was deleted"
- Can't log in with those credentials

---

#### Scenario: Same Email Signup Twice (Race Condition)
**Condition**: User clicks signup twice rapidly with same email

**Expected Behavior**:
- First request succeeds, creates user
- Second request returns 409 (user_exists)
- Second form shows error: "This email is already registered"
- User can try logging in instead

**Implementation**:
```typescript
// Disable button while loading to prevent double-click
<button disabled={loading}>Sign Up</button>
```

---

### Security Errors

#### Scenario: SQL Injection Attempt
**Condition**: User enters email: `" OR 1=1 --`

**Expected Behavior**:
- Supabase SDK parameterizes all queries
- Input treated as literal string, not SQL
- Query fails safely
- User sees normal "invalid email" error

**Implementation**:
- Never use string concatenation for SQL
- Always use parameterized queries or SDK methods
- Supabase SDK handles this automatically

---

#### Scenario: XSS Attack Via Email Field
**Condition**: User enters email: `<script>alert('xss')</script>@example.com`

**Expected Behavior**:
- Invalid email format (fails regex validation)
- Error: "Please enter a valid email"
- Script never executes

---

#### Scenario: Hacker Tries to Access Other User's Data
**Condition**: Hacker logs in as User A, tries to query User B's subscriptions

**Expected Behavior**:
- RLS policy enforces WHERE user_id = auth.uid()
- Query returns empty result (no subscriptions for User B)
- No error shown (security: don't reveal user exists)
- Hacker sees empty dashboard

**Implementation** (in database):
```sql
CREATE POLICY "Users can only see own subscriptions"
  ON active_subscriptions
  FOR SELECT
  USING (user_id = auth.uid());
```

---

#### Scenario: Brute Force Login Attempt
**Condition**: Hacker tries 100 login attempts in 5 minutes

**Expected Behavior**:
- After 5 failed attempts in 15 minutes
- Show error: "Too many login attempts. Please try again later"
- Block login for 15 minutes
- IP-based or account-based rate limiting

**Implementation**:
- Supabase Auth includes rate limiting
- Vercel middleware can add IP-based limiting
- Log suspicious activity

---

### Browser/UI Errors

#### Scenario: User Closes Signup Form Mid-Submission
**Condition**: Form modal is open, user clicks X to close, but request is still pending

**Expected Behavior**:
- Close button is disabled while loading
- Or: Request completes anyway, creates account
- Then: User can log in with those credentials

**Implementation**:
```typescript
<button onClick={onClose} disabled={loading}>✕</button>
```

---

#### Scenario: Browser Back Button During Auth
**Condition**: User is on signup form, clicks browser back button

**Expected Behavior**:
- If already signed up: Go back to previous page
- If not signed up: Go back to landing page
- Form data should clear (no autofill of passwords)

---

#### Scenario: User Has Multiple Tabs Open, Logs Out on One
**Condition**: Tab A and Tab B both logged in, user logs out on Tab A

**Expected Behavior**:
- Session token cleared on Tab A
- Within 1-2 seconds, Tab B detects logout via real-time
- Tab B redirects to login page
- Consistent experience across all tabs

**Implementation**:
- Supabase real-time subscription on auth state changes
- Listen to `auth.onAuthStateChange()`
- Redirect if logged out

---

#### Scenario: User Refreshes Page During Signup
**Condition**: Signup form submitted, user refreshes before seeing result

**Expected Behavior**:
- Request still executes on backend
- Account is created
- Page refresh loads fresh, shows login form
- User can log in with new credentials

---

### Third-Party Service Errors

#### Scenario: Supabase Auth Service Down
**Condition**: Supabase is temporarily unavailable

**Expected Behavior**:
- Request to /api/auth/signup times out or returns 500
- Show error: "Service temporarily unavailable. Please try again later"
- Suggest checking Supabase status page
- Can retry when service recovers

**Implementation**:
```typescript
if (response.status === 500) {
  setError('Service unavailable. Please try again later.');
}
```

---

#### Scenario: Email Service Down (if email verification enabled)
**Condition**: User signs up but email verification service is down

**Expected Behavior**:
- Signup succeeds (account created)
- Email verification is delayed
- User can log in without email verification
- Retry sending verification email later

---

## 7. REAL-TIME CONSIDERATIONS

### Session State Across Tabs

**Requirement**: If user logs out on Tab A, Tab B should detect it within 1-2 seconds.

**Implementation**:
```typescript
// In React hook
useEffect(() => {
  const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      router.push('/login');
    }
  });

  return () => authListener?.unsubscribe();
}, []);
```

---

### Concurrent Logins

**Requirement**: User can be logged in on multiple devices simultaneously.

**Implementation**:
- Each device gets independent session token
- Logging out on one device doesn't affect others
- Each session tracked separately in Supabase

---

### Session Sync Across Tabs

**Requirement**: If user logs in on Tab A, Tab B should auto-login within 1-2 seconds.

**Implementation**:
```typescript
// Supabase Auth automatically syncs sessions
const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    router.push('/dashboard');
  }
});
```

---

## 8. SECURITY & RLS POLICIES

### Row-Level Security (RLS) for active_subscriptions

```sql
-- Enable RLS (critical)
ALTER TABLE active_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON active_subscriptions
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can insert subscriptions for themselves
CREATE POLICY "Users can insert own subscriptions"
  ON active_subscriptions
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update only their subscriptions
CREATE POLICY "Users can update own subscriptions"
  ON active_subscriptions
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can delete only their subscriptions
CREATE POLICY "Users can delete own subscriptions"
  ON active_subscriptions
  FOR DELETE
  USING (user_id = auth.uid());
```

**Why This Works**:
- `auth.uid()` returns current logged-in user's ID
- WHERE clause enforces: only show/modify records matching current user
- Even if hacker tries SQL injection, RLS blocks unauthorized access
- Database-level security (not just frontend)

---

### RLS for expired_subscriptions and deleted_subscriptions

```sql
-- Same policies for expired and deleted tables
ALTER TABLE expired_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own expired subscriptions"
  ON expired_subscriptions
  FOR SELECT
  USING (user_id = auth.uid());
-- ... (same for INSERT, UPDATE, DELETE)

ALTER TABLE deleted_subscriptions ENABLE ROW LEVEL SECURITY;
-- ... (same policies)
```

---

### Sensitive Data Handling

**Passwords**:
- Never sent in network requests (except during signup/login)
- Always hashed with bcrypt before storage
- Frontend NEVER handles raw passwords

**Session Tokens**:
- Created by Supabase Auth
- Stored securely (httpOnly cookie preferred)
- Never exposed in localStorage if possible
- Transmitted over HTTPS only
- Include expiration (24 hours)

**API Keys**:
- NEXT_PUBLIC_SUPABASE_URL: OK to expose (contains app name only)
- NEXT_PUBLIC_SUPABASE_ANON_KEY: OK to expose (limited permissions via RLS)
- SUPABASE_SERVICE_ROLE_KEY: NEVER expose (godmode key, server-side only)

---

## 9. TESTING SCENARIOS

### Happy Path Testing

#### Test Case 1.1: Complete Signup Flow
```
1. Navigate to /signup
2. Enter email: test@example.com
3. Enter password: SecurePass123
4. Confirm password: SecurePass123
5. Click "Sign Up"
✅ Success toast appears
✅ Redirected to login page
✅ Can log in with new credentials
```

#### Test Case 1.2: Complete Login Flow
```
1. Navigate to /login
2. Enter email: test@example.com
3. Enter password: SecurePass123
4. Click "Log In"
✅ Dashboard loads
✅ Subscription list visible (even if empty)
✅ Logout button available
✅ Session persists on refresh
```

---

### Error Path Testing

#### Test Case 2.1: Duplicate Email Signup
```
1. Signup with email@example.com (succeeds)
2. Signup again with email@example.com
✅ Error: "This email is already registered"
✅ Can't proceed without different email
```

#### Test Case 2.2: Weak Password
```
1. Signup with password: "pass"
✅ Error: "Password must be at least 8 characters"
✅ Form remains open
```

#### Test Case 2.3: Wrong Login Password
```
1. Login with correct email, wrong password
✅ Error: "Invalid email or password"
✅ Password field clears
✅ Can retry
```

---

### Edge Case Testing

#### Test Case 3.1: Network Timeout
```
1. Mock network delay >10 seconds
2. Try to signup
✅ Error: "Network error..."
✅ Can retry
```

#### Test Case 3.2: Session Expiry
```
1. Login successfully
2. Wait 24+ hours (or manually expire token)
3. Try to access dashboard
✅ Redirected to login
✅ Error: "Session expired"
```

#### Test Case 3.3: Logout on All Tabs
```
1. Login on Tab A and Tab B
2. Click logout on Tab A
✅ Tab A shows login page
✅ Within 2 seconds, Tab B redirects to login
```

---

### Security Testing

#### Test Case 4.1: RLS Policy Enforcement
```
1. Login as User A
2. Query User B's subscriptions directly (via DevTools or SQL)
✅ Returns empty result (RLS blocks)
✅ No error message (don't reveal user exists)
```

#### Test Case 4.2: Session Token Validation
```
1. Obtain session token from browser storage
2. Modify token slightly (corrupt it)
3. Use modified token in API request
✅ Request returns 401 (unauthorized)
✅ User redirected to login
```

#### Test Case 4.3: Brute Force Protection
```
1. Try login with wrong password 10 times
✅ After 5 attempts, rate limit kicks in
✅ Error: "Too many attempts..."
✅ Locked out for 15 minutes
```

---

## 10. ACCEPTANCE CRITERIA (Definition of Done)

### Database
- ✅ Supabase project created and configured
- ✅ `users` table accessible (Supabase Auth)
- ✅ RLS policies created for all tables
- ✅ Policies tested (user can't access other user's data)
- ✅ Indexes created for fast lookups

### API Endpoints
- ✅ POST /api/auth/signup works
- ✅ POST /api/auth/login works
- ✅ POST /api/auth/logout works
- ✅ GET /api/auth/me works
- ✅ POST /api/auth/refresh-token works (if needed)
- ✅ All error responses return correct status codes

### Frontend Components
- ✅ SignupForm component renders
- ✅ LoginForm component renders
- ✅ Form validation works (email format, password strength)
- ✅ Loading spinners show during API calls
- ✅ Error messages display correctly
- ✅ Success toasts appear

### Session Management
- ✅ Session token persists on page refresh
- ✅ Session token expires after 24 hours
- ✅ Logout clears session from all tabs
- ✅ ProtectedRoute redirects unauthenticated users to login
- ✅ Logging in on Tab A auto-logs in Tab B within 2 seconds

### Security
- ✅ Passwords never sent in plaintext (HTTPS enforced)
- ✅ Session tokens stored securely
- ✅ RLS policies enforce user data isolation
- ✅ Service role key never exposed in frontend code
- ✅ Environment variables configured in Vercel
- ✅ No console errors or security warnings

### Error Handling
- ✅ Network errors handled gracefully
- ✅ Validation errors shown to user
- ✅ Rate limiting on login attempts
- ✅ Duplicate email signup prevented
- ✅ Weak password rejected
- ✅ Session expiry redirects to login

### Testing
- ✅ Manual testing: Complete signup-login flow
- ✅ Manual testing: Session persistence on refresh
- ✅ Manual testing: Multi-tab logout sync
- ✅ Manual testing: RLS policies (can't access other user's data)
- ✅ Manual testing: Error cases (wrong password, duplicate email, etc.)
- ✅ Browser console: No errors

---

## 11. SUCCESS METRICS

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Signup Success Rate | 100% | Create 5 test accounts, all succeed |
| Login Success Rate | 100% | Login with 5 accounts, all succeed |
| Session Persistence | 100% | Refresh page, still logged in |
| RLS Enforcement | 100% | Try to access other user's data, blocked |
| Error Message Clarity | 100% | All errors describe the problem clearly |
| Form Validation | 100% | All validation rules work (email, password, etc.) |
| Network Error Recovery | 100% | Timeout error shows, user can retry |
| Multi-Tab Sync | <2 sec | Logout on Tab A, Tab B redirects within 2 sec |
| Page Load Time | <2 sec | Dashboard loads in <2 seconds |
| No Console Errors | 100% | Zero errors in Chrome DevTools console |

---

## 12. BLOCKERS & DEPENDENCIES

### Must Have Before Starting
- [ ] Supabase account created
- [ ] Supabase project initialized
- [ ] GitHub repository created
- [ ] Vercel account linked to GitHub
- [ ] Next.js project initialized locally

### Blocks These Features
- ✋ Everything else depends on auth working first
- PRD 2 (CRUD) needs authenticated user_id
- PRD 3 (Real-time) needs auth for RLS
- PRD 4 (Automation) needs auth for data isolation

### Related PRDs
- None (this is the foundation)
- All other PRDs depend on this one

---

## 13. DOCUMENT SIGN-OFF

**Feature PRD 1 Status**: ✅ Ready for Development

**Estimated Development Time**: 2-3 days

**Next Steps**:
1. Setup Supabase project
2. Create Next.js project
3. Implement signup form + API
4. Implement login form + API
5. Test complete flow
6. Proceed to Feature PRD 2

**Questions or Clarifications?** Document PRD 2 for more context on how auth integrates with CRUD.

---

**End of Feature PRD 1**

