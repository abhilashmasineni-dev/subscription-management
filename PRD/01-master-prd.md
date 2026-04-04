# MASTER PRD: Real-Time Subscription Tracker

**Document Version**: 1.0  
**Last Updated**: April 4, 2026  
**Status**: Ready for Feature Development  
**Audiences**: College Professors + Development Team

---

## 1. PROJECT IDENTITY

### Project Name
**Real-Time Subscription Tracker**

### One-Liner Description
A web application that enables individual users to track personal subscription renewals, manage costs, and receive real-time expiration alerts with automatic archival and 24-hour recovery windows.

### Project Classification
- **Type**: DBMS (Database Management System) College Project
- **Scope**: Functional web application demonstrating advanced database concepts
- **Deliverable**: Production-ready Next.js application deployed on Vercel with Supabase backend

---

## 2. VISION & OBJECTIVES

### Vision Statement
Simplify personal subscription management by consolidating all subscription tracking in one place, automating expiration handling, and providing real-time alerts—demonstrating enterprise-grade database architecture, workflows, and data integrity patterns.

### Primary Goals
1. **Build a functional web application** that users can actually use to track subscriptions
2. **Demonstrate DBMS concepts** including:
   - Normalized relational schema (4 related tables with foreign keys)
   - Status-based workflows (ENUM types, state machines)
   - Archive pattern (data lifecycle: active → expired → deleted)
   - Soft delete pattern (24-hour data retention for recovery)
   - Real-time synchronization (PostgreSQL LISTEN/NOTIFY)
   - Automated background jobs (Vercel Cron)
   - Security through Row-Level Security (RLS) policies
   - Timestamp tracking (created_at, updated_at, expired_at, deleted_at)
   - Query optimization through indexing

### Success Definition
A fully functional application where:
- ✅ All CRUD operations execute without errors
- ✅ Real-time updates propagate across browser tabs in <500ms
- ✅ T-1 minute notifications trigger reliably
- ✅ Auto-expiration moves subscriptions correctly
- ✅ 24-hour restoration windows function as specified
- ✅ No data leaks—users only see their own subscriptions
- ✅ All edge cases handled gracefully with appropriate error messages
- ✅ Dashboard loads in <2 seconds
- ✅ Code demonstrates understanding of DBMS principles

---

## 3. TARGET USERS & USE CASES

### Primary User Profile
- **Type**: Individual user (not families, not businesses)
- **Age**: 18-65
- **Tech Skill**: Basic (can sign up, use web forms)
- **Device**: Desktop, Laptop, Tablet
- **Motivation**: Want to track and manage personal subscriptions efficiently

### Primary Use Cases

#### Use Case 1: Subscription Inventory Management
**Scenario**: User has Netflix, Spotify, Adobe, and Dropbox subscriptions spread across different accounts

**Goal**: See all subscriptions in one dashboard, organized by renewal date

**Value**: Know exactly how much they're spending monthly and when renewals happen

---

#### Use Case 2: Renewal Awareness
**Scenario**: User is 1 minute away from Netflix renewal and hasn't used it in 2 weeks

**Goal**: Get a notification warning them of the impending renewal

**Value**: Time to decide whether to keep the subscription or cancel

---

#### Use Case 3: Accidental Deletion Recovery
**Scenario**: User accidentally deletes a subscription they meant to keep

**Goal**: Recover it within 24 hours from the deleted subscriptions section

**Value**: No data loss, confidence to use delete button without fear

---

#### Use Case 4: Subscription Pausing
**Scenario**: User wants to disable a subscription temporarily without losing the record

**Goal**: Disable it so it doesn't clutter the active list, but keep the data for when they re-enable

**Value**: Clean active list while preserving subscription history

---

#### Use Case 5: Expired Subscription Restoration
**Scenario**: User had a subscription that expired, now wants to reactivate it with a new renewal date

**Goal**: Restore it from the expired section and set a new expiration date

**Value**: Reuse existing subscription record instead of manually re-entering all details

---

## 4. SCOPE: FEATURES IN / OUT

### Features IN (What We're Building)

#### Authentication & User Management
- Email/password signup
- Email/password login
- Session persistence (auto-login on refresh)
- Logout functionality
- User data isolation via RLS policies

#### Subscription Management (CRUD)
- **Add**: Form to create new subscription with name, link, start date, expiration date, cost
- **View**: Dashboard showing all subscriptions as cards, organized by tabs
- **Edit**: Update any subscription detail
- **Delete**: Soft delete (moves to deleted_subscriptions, kept for 24 hours)
- **Disable**: Mark as inactive (stays in active_subscriptions with status='disabled', appears grayed out)
- **Re-enable**: Change status from disabled back to active

#### Dashboard UI
- **4 Tabs**:
  1. Active Subscriptions (status='active')
  2. Disabled Subscriptions (status='disabled', grayed out)
  3. Expired Subscriptions (auto-moved when expiration_date passes)
  4. Deleted Subscriptions (soft-deleted items, 24-hr window)
- **Card Display**: Subscription name, website link (clickable), expiration date+time, cost, three-dot menu
- **Sorting**: By expiration date, cost, or name (ascending/descending)
- **Total Monthly Spending**: Sum of all active subscription costs displayed prominently

#### Expiration Handling
- **T-1 Minute Alert**: Persistent toast notification (stays for exactly 1 minute, auto-dismisses or manual close)
- **Auto-Move to Expired**: Subscription moves from active_subscriptions to expired_subscriptions when expiration_date passes
- **Visibility**: Expired subscriptions appear in dedicated expired tab

#### Real-Time Synchronization
- **Cross-Tab Updates**: When one browser tab adds/edits/deletes a subscription, other tabs update in real-time
- **WebSocket Connection**: Uses Supabase real-time subscriptions (PostgreSQL LISTEN/NOTIFY)
- **Update Latency**: <500ms for UI sync

#### 24-Hour Recovery Windows
- **Expired Subscriptions**: Can be restored within 24 hours of expiration
  - User enters new expiration date+time
  - Subscription moves back to active_subscriptions
  - Status updated to 'restored' in expired_subscriptions
- **Deleted Subscriptions**: Can be restored within 24 hours of deletion
  - Soft-deleted items shown in deleted tab
  - Restore button moves back to appropriate tab
- **Auto-Permanent Deletion**: After 24 hours, Cron job permanently deletes records

#### Automation & Background Jobs
- **Cron Job 1**: Every minute, move expired subscriptions to expired_subscriptions
- **Cron Job 2**: Every hour, permanently delete records older than 24 hours from expired and deleted tables
- **Trigger**: Optional PostgreSQL trigger for immediate moves (backup to Cron)

#### Security & Data Isolation
- Row-Level Security policies: Users only query/update their own subscriptions
- Session-based auth: Unauthorized users cannot access dashboard
- Data validation: Required fields, date constraints, positive costs
- No direct database access: All operations via secure API endpoints

---

### Features OUT (What We're NOT Building)

- ❌ **Family/Shared Subscriptions**: No cost splitting between multiple users
- ❌ **Payment Integration**: No Stripe, PayPal, or payment processing
- ❌ **Email Notifications**: Only in-app toast notifications (no email/SMS)
- ❌ **Subscription Recommendations**: No AI suggesting subscriptions to add/remove
- ❌ **Custom Categories**: Fixed category list (or no categories for simplicity)
- ❌ **Multi-Currency Support**: No exchange rates; users select one currency per subscription
- ❌ **Subscription Splitting**: No feature to split cost among family members
- ❌ **Mobile App**: Web application only (responsive design, but not native iOS/Android)
- ❌ **Browser Extensions**: Not a browser plugin
- ❌ **API for Third-Parties**: Not exposing a public API
- ❌ **Advanced Analytics**: No charts, trends, or predictions (basic total spending only)
- ❌ **Backup/Export**: No data export to CSV or backup system (single Supabase backup only)
- ❌ **Dark Mode**: Single light theme (can add later)
- ❌ **Multi-Language**: English only

---

## 5. HIGH-LEVEL FEATURE BREAKDOWN

The application is divided into **4 Feature PRDs**, each building on the previous one:

| # | Feature PRD | Description | Dependencies | Complexity |
|---|-------------|-------------|--------------|-----------|
| 1 | **Authentication & User Management** | Signup, login, logout, session management, RLS policies | None (Foundation) | Medium |
| 2 | **Subscription CRUD & Dashboard UI** | Add, edit, delete, disable, dashboard layout, tabs, sorting | PRD 1 | High |
| 3 | **Real-time & Notifications** | T-1 minute alerts, real-time tab sync, toast notifications | PRD 1, PRD 2 | High |
| 4 | **Automation & Data Lifecycle** | Auto-move expired, auto-delete after 24h, restore workflows, Cron jobs | PRD 1, PRD 2, PRD 3 | High |

---

## 6. TECH STACK OVERVIEW

### Frontend
- **Framework**: Next.js 14+ (React-based, server-side rendering, API routes)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useContext) + Supabase real-time listeners
- **HTTP Client**: @supabase/supabase-js (SDK)
- **Notifications**: Custom toast component (or library like react-hot-toast)
- **Date/Time**: date-fns library
- **Deployment**: Vercel (automatic from GitHub)

### Backend
- **Database**: Supabase (managed PostgreSQL)
  - Authentication: Supabase Auth (email/password)
  - Real-time: PostgreSQL LISTEN/NOTIFY
  - Storage: Not needed for this project
- **API**: Next.js API Routes (/pages/api)
  - No separate backend service needed
  - Supabase SDK handles most operations

### Background Jobs & Automation
- **Cron Jobs**: Vercel Cron (runs serverless functions on schedule)
  - `/api/cron/move-expired` (every minute)
  - `/api/cron/delete-old-records` (every hour)
- **Database Triggers**: Optional PostgreSQL triggers (backup mechanism)

### Authentication & Security
- **Auth Provider**: Supabase Auth (handles password hashing, session tokens)
- **Row-Level Security**: PostgreSQL RLS policies
- **Environment Variables**: Stored in Vercel dashboard
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (server-side only)

### Real-Time Communication
- **WebSocket**: Supabase real-time (PostgreSQL LISTEN/NOTIFY)
- **Latency Target**: <500ms
- **Protocol**: WebSocket (automatic, no polling)

### Deployment
- **Frontend Hosting**: Vercel (Next.js hosting)
- **Database Hosting**: Supabase Cloud (managed PostgreSQL)
- **Serverless Functions**: Vercel Functions (API routes)
- **Environment**: Production only (no staging needed for college project)

---

## 7. DATABASE ARCHITECTURE (HIGH-LEVEL)

### Database Schema Overview

#### Table 1: `users` (Supabase Auth)
```
id (UUID) PK
email (VARCHAR, UNIQUE)
created_at (TIMESTAMP)
```

#### Table 2: `active_subscriptions`
```
id (UUID) PK
user_id (UUID) FK → users(id)
subscription_name (VARCHAR) NOT NULL
website_link (VARCHAR)
start_date (DATE) NOT NULL
expiration_date (TIMESTAMP) NOT NULL
cost (DECIMAL) NOT NULL
currency (VARCHAR, default='USD')
status (ENUM: 'active', 'disabled') NOT NULL
created_at (TIMESTAMP)
updated_at (TIMESTAMP)

Constraints:
- expiration_date >= start_date
- cost > 0
- Foreign key: user_id

Indexes:
- (user_id, status, expiration_date)
- (user_id, expiration_date)
```

#### Table 3: `expired_subscriptions`
```
id (UUID) PK
user_id (UUID) FK → users(id)
original_subscription_id (UUID) FK → active_subscriptions(id)
subscription_name (VARCHAR)
website_link (VARCHAR)
start_date (DATE)
expiration_date (TIMESTAMP)
cost (DECIMAL)
currency (VARCHAR)
status (ENUM: 'expired', 'restored')
expired_at (TIMESTAMP) NOT NULL
source_table (VARCHAR, default='active_subscriptions')
can_restore_until (TIMESTAMP = expired_at + 24 hours)
created_at (TIMESTAMP)

Indexes:
- (user_id, expired_at)
- (user_id, status)
```

#### Table 4: `deleted_subscriptions`
```
id (UUID) PK
user_id (UUID) FK → users(id)
original_subscription_id (UUID) FK → active_subscriptions(id)
subscription_name (VARCHAR)
website_link (VARCHAR)
start_date (DATE)
expiration_date (TIMESTAMP)
cost (DECIMAL)
currency (VARCHAR)
deleted_at (TIMESTAMP) NOT NULL
can_restore_until (TIMESTAMP = deleted_at + 24 hours)
created_at (TIMESTAMP)

Indexes:
- (user_id, deleted_at)
- (user_id)
```

### Key Relationships

```
users (1) ──────────────┬──────────────── (Many) active_subscriptions
                        ├──────────────── (Many) expired_subscriptions
                        └──────────────── (Many) deleted_subscriptions

active_subscriptions (1) ──────────────── (Many) expired_subscriptions
                                          (via original_subscription_id)

active_subscriptions (1) ──────────────── (Many) deleted_subscriptions
                                          (via original_subscription_id)
```

### Performance Indexes

| Table | Columns | Purpose |
|-------|---------|---------|
| active_subscriptions | (user_id, status, expiration_date) | Find active/disabled subscriptions for user, sorted by expiration |
| active_subscriptions | (user_id, expiration_date) | Find subscriptions expiring soon for alerts |
| expired_subscriptions | (user_id, expired_at) | Find recently expired subscriptions for user |
| expired_subscriptions | (user_id, status) | Filter by status (expired vs restored) |
| deleted_subscriptions | (user_id, deleted_at) | Find recently deleted subscriptions for recovery |

---

## 8. DEPLOYMENT ARCHITECTURE

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ React App (Next.js) - Vercel CDN                          │ │
│  │ - Dashboard UI (4 tabs)                                   │ │
│  │ - Forms (Add, Edit)                                       │ │
│  │ - Real-time listeners (Supabase subscription)             │ │
│  └────────────┬─────────────────────────────────────────────┘ │
└───────────────┼─────────────────────────────────────────────────┘
                │ HTTPS / WebSocket
                │
    ┌───────────┴──────────────┬──────────────────────┐
    │                          │                      │
    ▼                          ▼                      ▼
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│    VERCEL       │  │    SUPABASE      │  │   VERCEL CRON    │
│  ┌───────────┐  │  │  ┌────────────┐  │  │  ┌────────────┐  │
│  │ Next.js   │  │  │  │ PostgreSQL │  │  │  │ Serverless │  │
│  │ API Route │  │  │  │ Database   │  │  │  │ Functions  │  │
│  │ ──────────│  │  │  │ ────────── │  │  │  │ ────────── │  │
│  │ /api/     │  │  │  │ users      │  │  │  │ /api/cron/ │  │
│  │ /subscriptions──RLS─→ active_subs   │  │  │ move-expired   │  │
│  │ /auth/    │  │  │  │ expired_subs   │  │  │ delete-old    │  │
│  │ /cron/    │  │  │  │ deleted_subs   │  │  │ (every min/hr)│  │
│  └───────────┘  │  │  │                │  │  │              │  │
│   (Frontend)    │  │  │ Real-time:     │  │  │              │  │
└─────────────────┘  │  │ LISTEN/NOTIFY  │  │  └──────────────┘  │
                     │  └────────────────┘  │
                     │ Managed PostgreSQL  │  (Background Jobs)
                     │ (Cloud Hosting)    │
                     └──────────────────────┘

Flow:
1. User interacts with frontend (Vercel)
2. Frontend calls API endpoints (Vercel)
3. API endpoints query database (Supabase)
4. RLS policies enforce user data isolation
5. Real-time listeners notify frontend of changes
6. Cron jobs run background automation (Vercel)
```

### Deployment Steps

1. **Frontend**: Push to GitHub → Vercel auto-deploys from main branch
2. **Database**: Create Supabase project → Run SQL migrations
3. **Environment Variables**: Set in Vercel dashboard
4. **Cron Jobs**: Configure in vercel.json
5. **RLS Policies**: Create in Supabase dashboard

### Monitoring & Logs
- **Frontend Errors**: Vercel logs
- **API Errors**: Vercel function logs
- **Database Logs**: Supabase dashboard
- **Real-time Issues**: Browser console + Supabase logs

---

## 9. USER JOURNEY FLOWS (HIGH-LEVEL)

### Flow 1: Onboarding (Landing → Signup → Login → Dashboard)
- New user arrives at landing page
- User signs up with email + password
- Supabase confirms email (or auto-confirms)
- User logs in
- Dashboard loads, showing "Add a new subscription to get started"

### Flow 2: Subscription Lifecycle (Add → View → Edit → Disable → Expire)
- User clicks "Add Subscription"
- Fills form: name, link, start date, expiration date, cost
- Subscription appears as card on dashboard
- User can edit, disable, or delete from three-dot menu
- On expiration, subscription auto-moves to expired tab

### Flow 3: Expiration & Restoration (T-1 Alert → Auto-Move → Restore)
- 1 minute before expiration: T-1 toast notification appears
- At expiration: Subscription auto-moves to expired_subscriptions table
- User sees it in expired tab
- Within 24 hours: User can restore with new expiration date
- After 24 hours: Subscription is permanently deleted

### Flow 4: Deletion & Recovery (Delete → 24-hour Hold → Auto-Delete)
- User deletes subscription (soft delete)
- Subscription moves to deleted_subscriptions
- User sees it in deleted tab with restore option
- Within 24 hours: Can restore to previous state
- After 24 hours: Cron job permanently deletes record from DB

---

## 10. DBMS CONCEPTS DEMONSTRATED

This project showcases the following database concepts:

| Concept | How It's Demonstrated |
|---------|----------------------|
| **Normalization** | 4 related tables (users, active, expired, deleted) avoiding redundancy |
| **Foreign Keys** | user_id links all tables to users, original_subscription_id links subscriptions |
| **Relational Integrity** | Cascade delete rules, referential integrity constraints |
| **ENUM Data Types** | status field (active/disabled/expired/restored) |
| **Timestamps** | created_at, updated_at, expired_at, deleted_at for audit trail |
| **Constraints** | NOT NULL, UNIQUE, CHECK (cost > 0, expiration >= start), defaults |
| **Indexing** | Multi-column indexes on (user_id, status, expiration_date) for performance |
| **Aggregation Queries** | SUM(cost) for total monthly spending |
| **Filtering & Sorting** | WHERE status = 'active' ORDER BY expiration_date ASC |
| **Row-Level Security** | PostgreSQL RLS policies enforce user data isolation |
| **Triggers & Automation** | Optional PostgreSQL triggers for immediate data movement |
| **Cron Jobs** | Vercel Cron for background batch processing |
| **Real-time Subscriptions** | PostgreSQL LISTEN/NOTIFY for live updates across tabs |
| **Soft Delete Pattern** | Data retention via separate tables, not hard deletion |
| **Archive Pattern** | Data lifecycle: active → expired → deleted (immutable transitions) |
| **Concurrency Handling** | Last-write-wins for simultaneous edits, real-time conflict resolution |

---

## 11. SUCCESS METRICS (How We Know It Works)

### Functional Success
- ✅ All CRUD operations complete without errors
- ✅ Subscription appears on dashboard immediately after creation
- ✅ Edit updates all fields correctly
- ✅ Delete soft-deletes (appears in deleted tab)
- ✅ Disable grays out card, moves to disabled tab
- ✅ Re-enable returns to active tab
- ✅ Expiration auto-moves subscriptions
- ✅ T-1 minute toast appears reliably
- ✅ Restore restores with new expiration date
- ✅ 24-hour window enforced for restoration
- ✅ Auto-permanent deletion after 24 hours

### Security & Data Isolation
- ✅ User A cannot see User B's subscriptions
- ✅ Unauthenticated users cannot access dashboard
- ✅ RLS policies are enforced (manual test: SQL queries blocked)
- ✅ Session tokens expire and re-login required
- ✅ No data leaks in network requests (inspect Chrome DevTools)

### Performance
- ✅ Dashboard loads in <2 seconds
- ✅ Real-time updates <500ms latency (tab sync)
- ✅ T-1 minute checks run every 30 seconds without blocking UI
- ✅ Cron jobs complete within their scheduled window
- ✅ Database queries optimized (check query plans)

### User Experience
- ✅ Error messages are clear and actionable
- ✅ Loading states show (spinners, disabled buttons)
- ✅ Toasts confirm successful actions
- ✅ No console errors (check browser DevTools)
- ✅ Responsive design works on mobile/tablet

### Code Quality
- ✅ No console errors or warnings
- ✅ Environment variables not exposed in code
- ✅ SQL queries parameterized (no SQL injection)
- ✅ Error handling for network failures
- ✅ Comments document complex logic

---

## 12. TIMELINE & PHASES (4 Weeks)

### Phase 1: Foundation (Week 1)
**Goal**: Auth complete, database ready

- Day 1-2: Supabase project setup, schema creation, RLS policies
- Day 3: Next.js scaffold, environment variables, Supabase SDK integration
- Day 4: Signup form + API endpoint (PRD 1)
- Day 5: Login + logout + session management (PRD 1)
- Weekend: Test onboarding flow, fix bugs

**Deliverable**: Users can sign up and log in

---

### Phase 2: Core Features (Week 2)
**Goal**: CRUD operations complete, dashboard working

- Day 1: Add subscription form + API (PRD 2)
- Day 2: Edit subscription form + API (PRD 2)
- Day 3: Delete (soft) + disable/re-enable (PRD 2)
- Day 4: Dashboard layout, 4 tabs, card display (PRD 2)
- Day 5: Sorting + filtering + total spending calculation (PRD 2)
- Weekend: Test all CRUD operations

**Deliverable**: Fully functional dashboard with all subscription management

---

### Phase 3: Real-time & Automation (Week 3)
**Goal**: Real-time sync working, auto-expiration functioning, restoration possible

- Day 1: T-1 minute alert logic (PRD 3)
- Day 2: Real-time sync (Supabase subscriptions) (PRD 3)
- Day 3: Expired subscriptions table + auto-move (PRD 4)
- Day 4: Restore workflow + 24-hour window (PRD 4)
- Day 5: Cron jobs (move-expired + delete-old) (PRD 4)
- Weekend: Test multi-tab sync, expiration, restoration

**Deliverable**: Real-time working, auto-expiration functional, restoration possible

---

### Phase 4: Polish & Deployment (Week 4)
**Goal**: Production-ready, all edge cases handled, deployed

- Day 1-2: Edge case handling, error messages, validation
- Day 3: UI/UX refinement, responsive design
- Day 4: Full end-to-end testing, manual QA
- Day 5: Deploy to Vercel, final checks
- Weekend: Documentation for college submission

**Deliverable**: Production app, fully tested, deployed

---

## 13. ASSUMPTIONS & CONSTRAINTS

### Assumptions
- Users have modern browsers (Chrome, Firefox, Safari)
- Supabase and Vercel services remain available (assume no 24/7 support needed)
- Network is reasonably stable (for real-time updates)
- Users will not exceed 1000 subscriptions per account
- Users have unique email addresses (no shared accounts)
- Subscription dates are within reasonable range (2000-2100)
- Cost values are reasonable (0 to 999,999)

### Constraints
- Single user per login (no family sharing or account delegation)
- Subscription dates include both date and time (no all-day events)
- Cost is a decimal number (no complex pricing models like "free tier + $5 add-on")
- Currency is single per subscription (no multi-currency conversions)
- No payment processing (this is just a tracker, not a payment system)
- Restoration only available within 24 hours (not indefinite)
- Max 1 subscription per name per user (no duplicates like "Netflix 1" and "Netflix 2")

---

## 14. DEPENDENCIES & PREREQUISITES

### Before Development Starts
- [ ] Supabase account created
- [ ] Supabase project initialized (region selected)
- [ ] GitHub repository created
- [ ] Vercel account linked to GitHub
- [ ] Vercel project created
- [ ] Next.js project initialized locally
- [ ] Node.js 18+ installed
- [ ] npm or yarn installed
- [ ] Environment variables documented (.env.example)

### Feature Dependencies (Must Complete in Order)

```
PRD 1: Authentication
    ↓
    ├→ PRD 2: CRUD & Dashboard (depends on auth)
    │   ↓
    │   ├→ PRD 3: Real-time (depends on CRUD)
    │   │   ↓
    │   │   └→ PRD 4: Automation (depends on all above)
    │   │
    │   └→ Can start with basic functionality, add real-time later
    │
    └→ Cannot proceed without auth

Parallel Work:
- Database schema can be created while signup form is being built
- Styling can be done while API endpoints are being coded
- Testing can start as soon as one feature is complete
```

---

## 15. RISKS & MITIGATION

### Risk 1: Real-time Sync Fails
**Severity**: High  
**Probability**: Medium

**Description**: Supabase WebSocket connection drops, tabs don't update in real-time

**Mitigation**:
- Test with multiple browser tabs simultaneously
- Add fallback: Auto-refresh page every 30 seconds if real-time unavailable
- Log WebSocket connection status in console
- Monitor Supabase status page

---

### Risk 2: Cron Job Misses Expiration
**Severity**: High  
**Probability**: Low

**Description**: Scheduled job doesn't run, subscriptions aren't moved to expired

**Mitigation**:
- Add optional PostgreSQL trigger as backup
- Check Vercel Cron logs daily
- Manual batch job can be run from admin panel if needed
- Implement retry logic in Cron function

---

### Risk 3: User Restores After 24-Hour Window Closes
**Severity**: Medium  
**Probability**: Medium

**Description**: User attempts to restore after can_restore_until timestamp

**Mitigation**:
- Clear UI messaging: "Can restore until [date/time]"
- Disable restore button after 24 hours
- Check can_restore_until before allowing restoration
- Show countdown timer (optional)

---

### Risk 4: Data Loss Due to Soft Deletes Not Backed Up
**Severity**: High  
**Probability**: Low

**Description**: Soft-deleted records not backed up, lost if database corrupted

**Mitigation**:
- Supabase auto-backup (enabled by default)
- Don't hard-delete soft-deleted records
- Keep audit trail (created_at, deleted_at)
- Periodic manual backups for peace of mind

---

### Risk 5: Users Confused by 4 Tabs
**Severity**: Low  
**Probability**: Medium

**Description**: Users don't understand difference between disabled and expired

**Mitigation**:
- Clear tab labels with icons
- Tooltip explanations on hover
- Help section explaining each tab
- Cards show status badge ("Disabled", "Expired", etc.)

---

### Risk 6: Performance Degradation with Many Subscriptions
**Severity**: Medium  
**Probability**: Low

**Description**: Dashboard becomes slow if user has >500 subscriptions

**Mitigation**:
- Implement pagination or infinite scroll
- Add search/filter to reduce rendered cards
- Monitor query performance (database logs)
- Optimize indexes based on usage patterns

---

### Risk 7: RLS Policies Not Enforced Correctly
**Severity**: Critical  
**Probability**: Low

**Description**: Hacker could access other users' subscriptions via SQL injection or direct API calls

**Mitigation**:
- Use Supabase SDK (not raw SQL) for safety
- Test RLS policies manually (try to access other user's data)
- Never expose service role key in frontend code
- Regular security audit

---

### Risk 8: Browser Storage Leaks Sensitive Data
**Severity**: Medium  
**Probability**: Low

**Description**: Session token stored in localStorage visible to malicious scripts

**Mitigation**:
- Use Supabase Auth (handles secure storage)
- Never manually store tokens
- Use httpOnly cookies if possible
- Content Security Policy headers

---

## 16. SUCCESS CRITERIA FOR COLLEGE SUBMISSION

For the project to be acceptable, it must demonstrate:

### Functional Requirements
- ✅ All 5 CRUD operations (Create, Read, Update, Delete, Disable/Re-enable)
- ✅ Authentication (Signup, Login, Logout)
- ✅ Real-time synchronization across browser tabs
- ✅ Automated background jobs (Cron)
- ✅ 24-hour recovery windows

### Database Requirements
- ✅ Normalized schema (3NF minimum)
- ✅ At least 3 tables with proper relationships
- ✅ Foreign key constraints
- ✅ Appropriate data types and constraints
- ✅ Indexes on frequently queried columns
- ✅ RLS policies for security

### Demonstration of DBMS Concepts
- ✅ Status-based workflows (ENUM)
- ✅ Archive pattern (active → expired → deleted)
- ✅ Soft delete with data retention
- ✅ Timestamps for audit trail
- ✅ Complex queries (filtering, sorting, aggregation)
- ✅ Triggers or Cron jobs for automation
- ✅ Real-time subscriptions

### Code Quality
- ✅ Clean, readable code with comments
- ✅ Error handling for edge cases
- ✅ Environment variables for secrets
- ✅ No console errors or warnings
- ✅ Responsive design (works on mobile)

### Documentation
- ✅ README with setup instructions
- ✅ Database schema documentation
- ✅ API endpoint documentation (optional)
- ✅ Feature walkthrough
- ✅ Video demo (optional but helpful)

---

## 17. DOCUMENT SIGN-OFF

**Master PRD Status**: ✅ Ready for Feature Development

**Next Steps**:
1. Review and approve this Master PRD
2. Proceed to Feature PRD 1: Authentication & User Management
3. Proceed to Feature PRD 2: Subscription CRUD & Dashboard
4. Proceed to Feature PRD 3: Real-time & Notifications
5. Proceed to Feature PRD 4: Automation & Data Lifecycle
6. Proceed to Flow PRDs for detailed user journeys

**Questions or Changes?** Review the Feature PRDs for more detail.

---

**End of Master PRD**

