# Real-Time Subscription Tracker - Complete PRD Package

**Status**: ✅ ALL PRDs GENERATED  
**Date**: April 4, 2026  
**Project**: Real-Time Subscription Tracker (DBMS College Project)

---

## 📋 PACKAGE CONTENTS

This package contains **8 comprehensive PRD documents** covering all aspects of the Real-Time Subscription Tracker application:

### 1️⃣ Master PRD (1 document)
**File**: `01-master-prd.md`

**Purpose**: High-level overview of the entire project

**Contents**:
- Project identity and vision
- Target users and use cases
- Scope (features IN and OUT)
- Tech stack overview
- Database architecture (high-level)
- Timeline and phases
- Success metrics
- Risks and mitigation
- 17 comprehensive sections

**Key Sections**:
- Project overview
- Features breakdown (4 feature areas)
- Tech stack: Next.js, Supabase, Vercel
- Database: 4 tables with relationships
- DBMS concepts demonstrated (10+ concepts)
- Deployment architecture

---

### 2️⃣ Feature PRDs (4 documents)

#### Feature PRD 1: Authentication & User Management
**File**: `02-feature-prd-1-auth.md`

**Purpose**: User signup, login, logout, session management, data isolation

**Contents**:
- 5 detailed user stories with full acceptance criteria
- Database schema (Supabase Auth, RLS policies)
- 5 API endpoints (signup, login, logout, me, refresh)
- Frontend components (SignupForm, LoginForm, ProtectedRoute)
- 30+ edge cases and error handling scenarios
- Security & RLS policies
- Testing scenarios

**Dependencies**: None (foundation feature)  
**Complexity**: Medium  
**Development Time**: 2-3 days

---

#### Feature PRD 2: Subscription CRUD & Dashboard UI
**File**: `03-feature-prd-2-crud.md`

**Purpose**: Core feature: Add, Edit, Delete (soft), Disable/Re-enable subscriptions, dashboard with 4 tabs

**Contents**:
- 8 detailed user stories
- Dashboard with 4 tabs (Active, Disabled, Expired, Deleted)
- Add/Edit/Delete/Disable/Re-enable workflows
- Sorting and filtering logic
- Three-dot context menus
- Total monthly spending calculation
- Database schema for active_subscriptions and deleted_subscriptions
- 6 API endpoints
- Comprehensive edge cases and error handling

**Dependencies**: PRD 1 (Auth)  
**Blocks**: PRD 3, PRD 4  
**Complexity**: High (most user-facing features)  
**Development Time**: 4-5 days

---

#### Feature PRD 3: Real-time & Notifications
**File**: `04-feature-prd-3-realtime.md`

**Purpose**: T-1 minute expiration alerts, real-time tab synchronization, toast notifications

**Contents**:
- 4 user stories (T-1 alert, real-time sync, connection status, toasts)
- Real-time architecture (WebSocket, Supabase subscriptions)
- Toast component system
- ExpirationAlertChecker logic
- Real-time listener hook implementation
- <500ms latency target
- Real-time sync for Add/Edit/Delete/Disable/Re-enable
- Total monthly spending real-time updates
- Connection status indicator

**Dependencies**: PRD 1, PRD 2  
**Blocks**: PRD 4  
**Complexity**: High (real-time is tricky)  
**Development Time**: 3-4 days

---

#### Feature PRD 4: Automation & Data Lifecycle
**File**: `05-feature-prd-4-automation.md`

**Purpose**: Auto-move expired subscriptions, auto-delete after 24h, restore workflows, Cron jobs

**Contents**:
- 4 user stories (auto-move, restoration, auto-delete, soft delete)
- 2 Cron job implementations (code-ready):
  - `/api/cron/move-expired` (every minute)
  - `/api/cron/delete-old-records` (every hour)
- 24-hour recovery windows for expired and deleted
- Database schema (expired_subscriptions, deleted_subscriptions)
- Restoration form workflow
- Atomic transactions and error handling
- Comprehensive edge cases
- Monitoring and logging

**Dependencies**: PRD 1, PRD 2, PRD 3  
**Blocks**: Nothing (final feature)  
**Complexity**: High (background jobs, timing)  
**Development Time**: 3-4 days

---

### 3️⃣ Flow PRDs (4 documents)

#### Flow PRD 1: User Onboarding
**File**: `06-flow-prd-1-onboarding.md`

**Purpose**: Landing page → Signup → Login → Dashboard

**Contents**:
- Complete user journey from landing to authenticated dashboard
- Main flow with 17 steps
- Decision tree with all branching paths
- 8 comprehensive error paths
- Data state changes at each step
- Error handling (invalid email, weak password, duplicates, network, etc.)
- Testing checklist
- Accessibility considerations

**Timing**: ~10-30 seconds  
**Complexity**: Medium (depends on PRD 1)

---

#### Flow PRD 2: Subscription Lifecycle
**File**: `07-flow-prd-2-lifecycle.md`

**Purpose**: Add → View → Edit → Disable → Expiration

**Contents**:
- Complete subscription lifecycle (32 steps)
- User can add subscription
- View on dashboard
- Edit details
- Disable/Re-enable
- Auto-expires and moves to Expired tab
- Decision tree with all branches
- 7 error paths (invalid cost, duplicate, network, permission, etc.)
- Data state changes for each operation
- Real-time sync across tabs
- Total spending updates

**Complexity**: High (most interactions)

---

#### Flow PRD 3 & 4 Combined: Expiration & Restoration + Soft Delete & Recovery
**File**: `08-flow-prd-3-4-expiration-delete.md`

**Purpose**: 
- **Flow 3**: T-1 minute alert → Auto-expire → Restore within 24h
- **Flow 4**: User delete (soft) → 24h hold → Permanent delete

**Contents**:

**Flow 3: Expiration & Restoration**:
- T-1 minute toast alert
- Auto-move at expiration (Cron)
- Real-time notification to all tabs
- Restoration form (new expiration date)
- 24-hour restoration window
- Cannot restore after 24h
- Auto-permanent delete after 24h

**Flow 4: Soft Delete & Recovery**:
- User initiates delete (soft)
- Moved to deleted_subscriptions
- 24-hour recovery window
- User can restore or leave for auto-delete
- After 24h: Permanently gone
- Audit trail preserved

**Contents**:
- Detailed flows (13 steps each)
- Main flows and edge cases
- 24-hour window logic
- Cron job triggering
- Real-time updates
- Testing checklists

---

## 📊 DOCUMENT STATISTICS

| Aspect | Count | Notes |
|--------|-------|-------|
| **Total Documents** | 8 | 1 Master + 4 Feature + 4 Flow PRDs |
| **Total Pages** | ~150+ | Comprehensive documentation |
| **User Stories** | 20+ | All with acceptance criteria |
| **API Endpoints** | 15+ | Fully documented with request/response |
| **Database Tables** | 4 | With schemas, constraints, indexes |
| **Cron Jobs** | 2 | Code-ready implementations |
| **Edge Cases** | 50+ | Comprehensive error handling |
| **Testing Scenarios** | 100+ | Happy path, error path, edge cases |
| **DBMS Concepts** | 10+ | Demonstrated in feature PRDs |

---

## 🎯 FEATURE BREAKDOWN

### 4 Feature Areas

```
PRD 1: Authentication & User Management
├─ Signup / Login / Logout
├─ Session management & persistence
├─ RLS policies for data isolation
└─ Security (bcrypt, tokens, etc.)

PRD 2: Subscription CRUD & Dashboard UI
├─ Add subscription (form validation)
├─ View (4 tabs: Active, Disabled, Expired, Deleted)
├─ Edit subscription
├─ Delete (soft delete, 24h recovery)
├─ Disable/Re-enable
├─ Sorting & filtering
├─ Total monthly spending
└─ Three-dot context menus

PRD 3: Real-time & Notifications
├─ T-1 minute expiration alerts (persistent toast)
├─ Real-time sync across tabs (<500ms latency)
├─ Toast notifications (success/error)
├─ WebSocket connections (Supabase subscriptions)
└─ Connection status indicator (optional)

PRD 4: Automation & Data Lifecycle
├─ Auto-move expired subscriptions (Cron every minute)
├─ Auto-delete after 24h (Cron every hour)
├─ Restore workflows (within 24h window)
├─ Soft delete pattern (audit trail)
├─ Atomic transactions
└─ Data consistency
```

---

## 📍 USER JOURNEYS

### 4 Flow PRDs

```
Flow 1: Onboarding
└─ Landing → Signup → Login → Dashboard (new user)

Flow 2: Subscription Lifecycle
└─ Add → View → Edit → Disable/Re-enable → Expiration

Flow 3: Expiration & Restoration
└─ T-1 Alert → Auto-Expire → Restore within 24h → Done

Flow 4: Soft Delete & Recovery
└─ Delete → Deleted Tab → Restore within 24h OR Auto-Delete
```

---

## 🗄️ DATABASE SCHEMA SUMMARY

### 4 Tables (with RLS)

**Table 1: users** (Supabase Auth)
```
id (UUID PK)
email (UNIQUE)
created_at
```

**Table 2: active_subscriptions**
```
id, user_id (FK), name, link
start_date, expiration_date, cost, currency
status (ENUM: active, disabled)
created_at, updated_at
Indexes: (user_id, status, expiration), (expiration_date)
```

**Table 3: expired_subscriptions**
```
id, user_id (FK), original_subscription_id (FK)
[copy of subscription fields]
status (ENUM: expired, restored)
expired_at, can_restore_until, restored_at
Indexes: (user_id, can_restore), (expired_at)
```

**Table 4: deleted_subscriptions**
```
id, user_id (FK), original_subscription_id (FK)
[copy of subscription fields]
deleted_at, can_restore_until, restored_at
Indexes: (user_id, can_restore), (deleted_at)
```

---

## 🔧 TECH STACK REFERENCE

**Frontend**: Next.js 14+, React 18+, Tailwind CSS  
**Backend**: Supabase (PostgreSQL), Vercel (serverless)  
**Authentication**: Supabase Auth (email/password)  
**Real-time**: Supabase real-time (WebSocket, LISTEN/NOTIFY)  
**Automation**: Vercel Cron Jobs  
**Deployment**: Vercel (frontend + functions)  
**Database**: Supabase Cloud (managed PostgreSQL)

---

## ✅ IMPLEMENTATION ROADMAP

### Phase 1 (Week 1): Foundation
- [ ] Supabase setup
- [ ] Next.js scaffold
- [ ] Authentication (PRD 1)
- [ ] Test onboarding flow

### Phase 2 (Week 2): Core Features
- [ ] Subscription CRUD (PRD 2)
- [ ] Dashboard with 4 tabs
- [ ] Sorting/filtering
- [ ] Test lifecycle flow

### Phase 3 (Week 3): Real-time & Automation
- [ ] Real-time sync (PRD 3)
- [ ] T-1 minute alerts
- [ ] Cron jobs (PRD 4)
- [ ] Restoration workflows
- [ ] Test expiration & deletion flows

### Phase 4 (Week 4): Polish & Deploy
- [ ] Error handling & edge cases
- [ ] UI/UX refinement
- [ ] Full end-to-end testing
- [ ] Deploy to Vercel

---

## 🎓 DBMS CONCEPTS DEMONSTRATED

✅ Normalized relational schema (3NF)  
✅ Foreign keys & referential integrity  
✅ ENUM data types (status)  
✅ Timestamps (created_at, updated_at, expired_at, deleted_at)  
✅ Constraints (NOT NULL, UNIQUE, CHECK, defaults)  
✅ Indexing (multi-column indexes for performance)  
✅ Aggregation queries (SUM for total spending)  
✅ Filtering & sorting (WHERE, ORDER BY)  
✅ Row-Level Security (RLS policies)  
✅ Soft delete pattern (data retention)  
✅ Archive pattern (active → expired → deleted)  
✅ Triggers & Cron jobs (automation)  
✅ Real-time subscriptions (LISTEN/NOTIFY)  
✅ Atomic transactions (BEGIN/COMMIT/ROLLBACK)  

---

## 📖 HOW TO USE THESE PRDs

### For Development
1. **Start with Master PRD** - Understand overall project scope and architecture
2. **Follow Feature PRDs in order**:
   - PRD 1 (Auth) - Implement first
   - PRD 2 (CRUD) - Implement second
   - PRD 3 (Real-time) - Implement third
   - PRD 4 (Automation) - Implement last
3. **Reference Flow PRDs** - Understand user journeys while building
4. **Use acceptance criteria** - Validate each feature is complete

### For AI Agent Handoff
1. Provide Master PRD for context
2. Hand off one Feature PRD at a time
3. Include corresponding Flow PRD for context
4. Provide all acceptance criteria and testing checklists
5. Verify implementation against PRD before moving to next feature

### For College Submission
1. Include Master PRD in project report
2. Reference DBMS concepts in each feature
3. Show database schema diagrams
4. Demonstrate all user flows work
5. Document architecture and design decisions

---

## 🔍 KEY HIGHLIGHTS

### What Makes This Project Strong for College

1. **Comprehensive Database Design**
   - Normalized schema (multiple related tables)
   - Proper constraints and relationships
   - Soft delete and archive patterns
   - Timestamps for audit trail

2. **Advanced Features**
   - Real-time synchronization
   - Background automation (Cron jobs)
   - 24-hour recovery windows
   - Complex state management (active → disabled → expired → deleted)

3. **Production-Grade Practices**
   - Row-Level Security (user data isolation)
   - Error handling (30+ edge cases)
   - Transaction management (atomic operations)
   - Performance optimization (indexing)

4. **Complete Documentation**
   - 8 PRD documents with 20+ user stories
   - 15+ API endpoints fully documented
   - 4 user journeys with decision trees
   - 100+ test scenarios

---

## 📞 NEXT STEPS

### To Start Coding:
1. ✅ You have all PRDs (8 documents)
2. ⏳ Create Supabase project (setup)
3. ⏳ Initialize Next.js project (scaffold)
4. ⏳ Implement Feature PRD 1 (Auth)
5. ⏳ Implement Feature PRD 2 (CRUD)
6. ⏳ Implement Feature PRD 3 (Real-time)
7. ⏳ Implement Feature PRD 4 (Automation)
8. ⏳ Test all flows
9. ⏳ Deploy to Vercel

### Questions?
- Refer to specific PRD sections
- Check acceptance criteria for "definition of done"
- Review error paths for edge case handling
- Check testing checklists for validation

---

## 📦 DOCUMENT MANIFEST

| File | Pages | Purpose |
|------|-------|---------|
| 01-master-prd.md | 20+ | High-level project overview |
| 02-feature-prd-1-auth.md | 25+ | Authentication system |
| 03-feature-prd-2-crud.md | 20+ | Subscription CRUD operations |
| 04-feature-prd-3-realtime.md | 18+ | Real-time & notifications |
| 05-feature-prd-4-automation.md | 22+ | Background automation |
| 06-flow-prd-1-onboarding.md | 15+ | User onboarding journey |
| 07-flow-prd-2-lifecycle.md | 20+ | Subscription lifecycle |
| 08-flow-prd-3-4-expiration-delete.md | 12+ | Expiration & soft delete flows |

**Total**: ~150+ pages of comprehensive specifications

---

## ✨ READY TO BUILD!

You now have everything needed to build the Real-Time Subscription Tracker application. All PRDs include:

✅ Detailed user stories with acceptance criteria  
✅ Complete database schemas with constraints  
✅ API endpoints with request/response formats  
✅ Frontend component specifications  
✅ Edge cases and error handling  
✅ Testing scenarios and checklists  
✅ Real-time architecture diagrams  
✅ Implementation code examples  

**Status**: Ready for development 🚀

---

**Document Generated**: April 4, 2026  
**Format**: Markdown (8 files)  
**Total Lines of Code/Spec**: 20,000+  
**Estimated Development Time**: 4 weeks (per timeline in Master PRD)

