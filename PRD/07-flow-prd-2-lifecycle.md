# FLOW PRD 2: Subscription Lifecycle Flow

**Document Version**: 1.0  
**Last Updated**: April 4, 2026  
**Status**: Ready for Implementation  
**Related Feature PRDs**: PRD 2 (CRUD), PRD 3 (Real-time)

---

## 1. FLOW OVERVIEW

### Flow Name
**Subscription Lifecycle Flow**

### Flow Type
User Journey (Primary User Interaction)

### Actors Involved
- **Primary**: Logged-in User
- **Secondary**: Dashboard UI
- **Tertiary**: Backend API, Database, Real-time listeners

### Flow Purpose
Describe the complete lifecycle of a subscription: from creation (add) through regular viewing, editing, managing, until it expires.

---

## 2. PRECONDITIONS

- [ ] User is logged in
- [ ] Dashboard is loaded
- [ ] User has valid session token

---

## 3. MAIN FLOW (Happy Path)

```
START: User on dashboard (logged in)

STEP 1: Dashboard Displays Empty or With Existing Subscriptions
├─ If new user:
│  ├─ Shows empty state: "Add a new subscription to get started"
│  └─ "+ Add Subscription" button visible
├─ If returning user:
│  ├─ Shows all active subscriptions as cards
│  ├─ Sorted by expiration date (default)
│  ├─ Each card shows: name, expiration date, cost
│  └─ Three-dot menu on each card
└─ Total monthly spending displayed at top

STEP 2: User Clicks "+ Add Subscription"
├─ Button labeled "+ Add Subscription" clicked
├─ Add Subscription form modal opens
├─ Form contains fields:
│  ├─ Subscription Name (required, text input)
│  ├─ Website Link (optional, URL input)
│  ├─ Start Date (required, date picker)
│  ├─ Expiration Date (required, date+time picker)
│  ├─ Cost (required, decimal input)
│  ├─ Currency (dropdown, default USD)
│  └─ "Add Subscription" button
└─ Form is ready for input

STEP 3: User Enters Subscription Details
├─ User fills in form:
│  ├─ Name: "Netflix"
│  ├─ Link: "https://netflix.com"
│  ├─ Start Date: "2026-03-01"
│  ├─ Expiration Date: "2026-05-01"
│  ├─ Expiration Time: "17:30"
│  ├─ Cost: "12.99"
│  └─ Currency: "USD"
└─ All required fields filled

STEP 4: Client-Side Validation
├─ Email validation: URL format valid ✓
├─ Date validation: Start < Expiration ✓
├─ Cost validation: Cost > 0 ✓
├─ Required fields: All filled ✓
└─ Form is valid, "Add" button enabled

STEP 5: User Submits Form
├─ User clicks "Add Subscription" button
├─ Button shows loading state: "Adding..."
├─ API request sent: POST /api/subscriptions
│  └─ Body: { name, link, start_date, expiration_date, cost, currency }
└─ Request in flight

STEP 6: Backend Creates Subscription
├─ Vercel receives request
├─ Validates user is authenticated (session token)
├─ Extracts user_id from session
├─ Inserts into active_subscriptions:
│  ├─ id: UUID generated
│  ├─ user_id: Current logged-in user
│  ├─ subscription_name: Netflix
│  ├─ expiration_date: 2026-05-01 17:30
│  ├─ cost: 12.99
│  ├─ status: 'active'
│  ├─ created_at: NOW()
│  └─ updated_at: NOW()
└─ Database returns success

STEP 7: Add Success Response
├─ API returns HTTP 201 Created
├─ Response includes full subscription object
└─ Request complete

STEP 8: Real-Time Broadcast
├─ Database change triggers PostgreSQL notification
├─ Supabase broadcasts INSERT event to all subscribed clients
├─ Current user's dashboard receives update (if real-time connected)
└─ Any other open tabs also receive update (real-time sync)

STEP 9: Frontend Displays Success
├─ Success toast appears: "Netflix added successfully"
├─ Modal closes
├─ Returns to dashboard
├─ Dashboard now shows Netflix card in Active tab
├─ Card displays:
│  ├─ Name: "Netflix"
│  ├─ Expiration: "May 1, 2026 5:30 PM"
│  ├─ Cost: "$12.99/month"
│  ├─ Website link: "netflix.com" (clickable)
│  └─ Three-dot menu: ⋮
└─ Total monthly spending updated (added $12.99)

STEP 10: User Views Subscription on Dashboard
├─ Netflix card visible on Active tab
├─ Card sorted by expiration date (May 1, earliest if only one)
├─ Shows all key information
└─ Card clickable (view details, optional)

STEP 11: User Decides to Edit Subscription
├─ User hovers over Netflix card
├─ Three-dot menu (⋮) button visible
├─ User clicks three-dot menu
├─ Menu appears with options:
│  ├─ Edit (pencil icon)
│  ├─ Disable (pause icon)
│  └─ Delete (trash icon)
└─ User clicks "Edit"

STEP 12: Edit Form Opens
├─ Edit form modal opens
├─ All fields pre-filled with current data:
│  ├─ Name: "Netflix"
│  ├─ Link: "https://netflix.com"
│  ├─ Start Date: "2026-03-01"
│  ├─ Expiration Date: "2026-05-01 17:30"
│  ├─ Cost: "12.99"
│  └─ Currency: "USD"
└─ Form ready for editing

STEP 13: User Modifies Details
├─ User decides to increase cost (price went up)
├─ Changes Cost from "12.99" to "15.99"
├─ All other fields unchanged
└─ Form modified

STEP 14: Client-Side Validation
├─ Cost validation: 15.99 > 0 ✓
├─ Date validation: Still Start < Expiration ✓
└─ Form is valid

STEP 15: User Submits Edit
├─ User clicks "Update Subscription" button
├─ Button shows loading: "Updating..."
├─ API request sent: PUT /api/subscriptions/:id
│  └─ Body: { cost: 15.99, ... }
└─ Request in flight

STEP 16: Backend Updates Subscription
├─ Vercel receives request
├─ Validates user is authenticated
├─ Checks user owns subscription (RLS)
├─ Updates active_subscriptions:
│  ├─ cost: 15.99
│  ├─ updated_at: NOW()
│  └─ Other fields unchanged
└─ Database returns success

STEP 17: Real-Time Broadcast Update
├─ Database change triggers notification
├─ Supabase broadcasts UPDATE event
├─ All open tabs receive update
└─ UI updates in real-time (if connected)

STEP 18: Frontend Displays Update
├─ Success toast: "Netflix updated successfully"
├─ Modal closes
├─ Dashboard refreshes
├─ Netflix card shows new cost: "$15.99/month"
├─ Total monthly spending updated: +$3.00
└─ Everything else unchanged

STEP 19: User Decides to Disable Subscription
├─ User realizes they stopped watching Netflix
├─ User hovers over Netflix card
├─ User clicks three-dot menu
├─ User clicks "Disable"
└─ Confirmation dialog appears

STEP 20: Disable Confirmation
├─ Dialog shows: "Are you sure you want to disable Netflix?"
├─ Options: "Disable" or "Cancel"
├─ User clicks "Disable" to confirm
└─ Request sent: PUT /api/subscriptions/:id/disable

STEP 21: Backend Disables Subscription
├─ Vercel receives request
├─ Updates active_subscriptions:
│  ├─ status: 'disabled'
│  └─ updated_at: NOW()
└─ Database returns success

STEP 22: Real-Time Update
├─ Notification broadcast
├─ All tabs receive UPDATE event
├─ UI updates in real-time
└─ Other tabs see change within 1 second

STEP 23: Frontend Displays Disabled State
├─ Success toast: "Netflix disabled"
├─ Modal closes
├─ Netflix card moves to Disabled tab
├─ Card appears grayed out:
│  ├─ Opacity: 50-60%
│  ├─ Text lighter/muted
│  └─ Badge: "Disabled"
├─ Total monthly spending decreased: -$15.99 (no longer active)
└─ Dashboard shows updated spending

STEP 24: User Views Subscription in Disabled Tab
├─ User clicks "Disabled Subscriptions" tab
├─ Netflix card appears grayed out
├─ Three-dot menu shows:
│  ├─ Edit (pencil icon)
│  ├─ Re-enable (play icon)
│  └─ Delete (trash icon)
└─ User can now edit, re-enable, or delete

STEP 25: User Re-enables Subscription
├─ User realizes they want to keep Netflix
├─ User clicks three-dot menu on Netflix
├─ User clicks "Re-enable"
├─ Optional confirmation: "Reactivate Netflix?"
└─ User confirms

STEP 26: Backend Re-enables
├─ Vercel receives request
├─ Updates active_subscriptions:
│  ├─ status: 'active'
│  └─ updated_at: NOW()
└─ Database returns success

STEP 27: Real-Time Update
├─ Notification broadcast
├─ Tabs update in real-time
└─ Netflix moves back to Active tab

STEP 28: Netflix Back to Active
├─ Netflix card moves to Active tab
├─ Card appears normal (not grayed out)
├─ Total monthly spending increased: +$15.99
└─ Sorted into correct position (by expiration)

STEP 29: Days Pass, Expiration Approaches
├─ User continues using dashboard
├─ May 1 approaches
└─ Cron job runs (backend automation)

STEP 30: Subscription Expires
├─ Time becomes 2026-05-01 17:31
├─ Cron job /api/cron/move-expired runs
├─ Finds Netflix with expiration_date <= NOW()
├─ Moves Netflix from active_subscriptions to expired_subscriptions:
│  ├─ original_subscription_id: Netflix.id
│  ├─ status: 'expired'
│  ├─ expired_at: NOW()
│  └─ can_restore_until: NOW() + 24 hours
├─ Deletes from active_subscriptions
└─ Real-time notification sent

STEP 31: Dashboard Updates (Real-Time)
├─ User viewing dashboard
├─ Real-time event received: Netflix moved to expired
├─ Netflix card disappears from Active tab
├─ Netflix card appears in Expired tab
├─ Badge: "Expired on May 1, 2026"
├─ Restore button visible (within 24h window)
└─ Total monthly spending updated: -$15.99

STEP 32: Subscription Now in Expired Tab
├─ User clicks "Expired Subscriptions" tab
├─ Netflix card visible
├─ Shows: Name, expiration date, cost
├─ Badge: "Expired on May 1, 2026 5:30 PM"
├─ Status: "Can restore within 23 hours"
├─ Three-dot menu shows:
│  ├─ Restore (if within 24h)
│  └─ Delete Permanently
└─ User can restore or leave for auto-delete

END: Subscription has completed its lifecycle
```

---

## 4. DECISION TREE

```
START: User on dashboard
│
├─ Decision 1: User wants to add subscription?
│  ├─ YES:
│  │  ├─ Open Add form
│  │  ├─ User fills details
│  │  ├─ Decision 2: Form valid?
│  │  │  ├─ NO:
│  │  │  │  └─ Show error, return to form
│  │  │  └─ YES:
│  │  │     ├─ Submit POST /api/subscriptions
│  │  │     ├─ Decision 3: API succeeds?
│  │  │     │  ├─ NO:
│  │  │     │  │  └─ Show error, form stays open
│  │  │     │  └─ YES:
│  │  │     │     └─ Show success, close form
│  │  │     │        └─ Card appears on dashboard
│  │  │
│  └─ NO: Continue to STEP 10 (view subscriptions)
│
├─ Decision 4: User wants to edit subscription?
│  ├─ YES:
│  │  ├─ Open Edit form with pre-filled data
│  │  ├─ User modifies field(s)
│  │  ├─ Decision 5: Form valid?
│  │  │  ├─ NO:
│  │  │  │  └─ Show error, return to form
│  │  │  └─ YES:
│  │  │     ├─ Submit PUT /api/subscriptions/:id
│  │  │     ├─ Decision 6: API succeeds?
│  │  │     │  ├─ NO:
│  │  │     │  │  └─ Show error, form stays open
│  │  │     │  └─ YES:
│  │  │     │     └─ Show success, close form
│  │  │     │        └─ Card updated on dashboard
│  │  │
│  └─ NO: Continue
│
├─ Decision 7: User wants to disable subscription?
│  ├─ YES:
│  │  ├─ Show confirmation dialog
│  │  ├─ Decision 8: User confirms?
│  │  │  ├─ NO:
│  │  │  │  └─ Cancel, return to dashboard
│  │  │  └─ YES:
│  │  │     ├─ Submit PUT /api/subscriptions/:id/disable
│  │  │     ├─ Decision 9: API succeeds?
│  │  │     │  ├─ NO:
│  │  │     │  │  └─ Show error
│  │  │     │  └─ YES:
│  │  │     │     └─ Card moves to Disabled tab
│  │  │     │        └─ Card grayed out
│  │  │
│  └─ NO: Continue
│
├─ Decision 10: User wants to re-enable subscription?
│  ├─ YES (subscription in Disabled tab):
│  │  ├─ Optional confirmation
│  │  ├─ Submit PUT /api/subscriptions/:id/enable
│  │  ├─ Decision 11: API succeeds?
│  │  │  ├─ NO:
│  │  │  │  └─ Show error
│  │  │  └─ YES:
│  │  │     └─ Card moves back to Active tab
│  │  │
│  └─ NO: Continue
│
├─ Decision 12: Subscription expires?
│  ├─ YES (expiration_date <= NOW()):
│  │  ├─ Cron job detects expiration
│  │  ├─ Move to expired_subscriptions
│  │  ├─ Delete from active_subscriptions
│  │  ├─ Broadcast real-time update
│  │  └─ Card moves to Expired tab
│  │
│  └─ NO: Continue viewing
│
├─ Decision 13: User wants to delete subscription?
│  ├─ YES:
│  │  ├─ Show confirmation dialog
│  │  ├─ Decision 14: User confirms?
│  │  │  ├─ NO:
│  │  │  │  └─ Cancel, return to dashboard
│  │  │  └─ YES:
│  │  │     ├─ Submit DELETE /api/subscriptions/:id
│  │  │     ├─ Decision 15: API succeeds?
│  │  │     │  ├─ NO:
│  │  │     │  │  └─ Show error, card stays visible
│  │  │     │  └─ YES:
│  │  │     │     └─ Card disappears from Active tab
│  │  │     │        └─ Card appears in Deleted tab
│  │  │
│  └─ NO: Continue
│
└─ Decision 16: Within 24h window for expired/deleted?
   ├─ YES:
   │  ├─ User can restore
   │  └─ Restore button enabled
   │
   └─ NO:
      └─ User cannot restore
         └─ Auto-delete after 24h (Cron job)

END: Subscription lifecycle complete
```

---

## 5. ERROR PATHS

### Error 1: Invalid Cost
```
Trigger: User enters negative cost or zero
Flow:
  1. Client-side validation catches it
  2. Error: "Cost must be greater than 0"
  3. Form stays open
Recovery:
  - User corrects cost
  - Retries submission
```

### Error 2: Start Date After Expiration
```
Trigger: User sets start: 2026-05-01, expiration: 2026-04-01
Flow:
  1. Validation error: "Expiration must be after start date"
  2. Form stays open
Recovery:
  - User corrects dates
  - Retries
```

### Error 3: Duplicate Subscription Name
```
Trigger: User adds Netflix when Netflix already exists
Flow:
  1. API returns 409 Conflict
  2. Error: "You already have a subscription named 'Netflix'"
  3. Form stays open
Recovery:
  - User changes name (e.g., "Netflix - Account 2")
  - Retries
```

### Error 4: Network Error During Add
```
Trigger: Connection drops during POST
Flow:
  1. Request times out after 10s
  2. Error: "Network error. Please check connection and try again"
  3. Button shows "Retry"
Recovery:
  - User checks connection
  - Clicks Retry
  - Form resubmits
```

### Error 5: Edit Fails - Subscription Deleted
```
Trigger: User editing Netflix, it was deleted on another tab
Flow:
  1. API returns 404 Not Found
  2. Error: "Subscription was deleted"
  3. Form closes
  4. Card disappears from dashboard
Recovery:
  - No recovery (subscription is gone)
  - Can add it again if needed
```

### Error 6: Disable Fails Due to Permission
```
Trigger: RLS policy violation (shouldn't happen but testing)
Flow:
  1. API returns 403 Forbidden
  2. Error: "Permission denied"
Recovery:
  - Refresh page
  - Try again
  - If persists: Session issue, logout and login
```

### Error 7: Real-Time Sync Fails
```
Trigger: WebSocket disconnects, but API succeeds
Flow:
  1. Add/Edit succeeds (API returns 201/200)
  2. Success toast shows
  3. Real-time doesn't update other tabs
  4. Other tabs show stale data
Recovery:
  - Manual refresh on other tab (F5)
  - Real-time reconnects automatically
  - Real-time fetches latest data when connection restored
```

---

## 6. DATA STATE CHANGES

### Add Subscription
```
BEFORE:
- active_subscriptions: No Netflix record
- Dashboard: No Netflix card
- Spending total: $42.98 (without Netflix)

AFTER:
- active_subscriptions: Netflix record inserted
  {
    id: "uuid-netflix",
    user_id: "user-id",
    subscription_name: "Netflix",
    expiration_date: "2026-05-01T17:30:00Z",
    cost: 12.99,
    status: "active",
    created_at: NOW(),
    updated_at: NOW()
  }
- Dashboard: Netflix card visible in Active tab
- Spending total: $55.97 (added $12.99)
- Real-time: All open tabs updated
```

### Edit Cost
```
BEFORE:
- active_subscriptions.cost: 12.99
- Dashboard: Shows $12.99
- Spending total: $55.97

AFTER:
- active_subscriptions.cost: 15.99
- Dashboard: Shows $15.99
- Spending total: $58.97 (added $3.00)
- updated_at: NOW()
- Real-time: All tabs updated
```

### Disable
```
BEFORE:
- active_subscriptions.status: 'active'
- Dashboard: Shows in Active tab, normal appearance
- Spending total: $58.97

AFTER:
- active_subscriptions.status: 'disabled'
- Dashboard: Shows in Disabled tab, grayed out
- Spending total: $43.98 (removed $15.99, disabled subs don't count)
- updated_at: NOW()
- Real-time: Tabs update within 1 second
```

### Auto-Expiration
```
BEFORE:
- active_subscriptions: Netflix record with expiration_date <= NOW()
- Dashboard: Netflix in Active tab
- Spending total: $43.98

AFTER (Cron runs):
- active_subscriptions: Netflix deleted
- expired_subscriptions: Netflix moved with:
  - original_subscription_id: "uuid-netflix"
  - status: 'expired'
  - expired_at: NOW()
  - can_restore_until: NOW() + 24h
- Dashboard: Netflix moved to Expired tab
- Spending total: $28.99 (removed $15.99)
- Real-time: Tabs notified of move
```

---

## 7. RELATED FEATURE PRDs

- **PRD 2: Subscription CRUD** - Detailed API specs and form validation
- **PRD 3: Real-time & Notifications** - How updates sync across tabs

---

## 8. POSTCONDITIONS

After lifecycle completion:

- ✅ Subscription created in database
- ✅ Subscription viewable on dashboard
- ✅ Can be edited multiple times
- ✅ Can be disabled/re-enabled
- ✅ Auto-expires when date passes
- ✅ Can be restored within 24h
- ✅ Permanently deleted after 24h or after manual permanent delete
- ✅ All changes synced in real-time across tabs

---

## 9. TESTING CHECKLIST

- [ ] Add subscription with all fields
- [ ] Add with optional field (link) omitted
- [ ] Edit subscription (change cost)
- [ ] Edit subscription (change expiration date)
- [ ] Disable subscription
- [ ] Re-enable subscription
- [ ] Delete subscription
- [ ] Restore from Deleted tab
- [ ] View subscription expires and auto-moves
- [ ] Real-time sync (add on Tab A, appears on Tab B)
- [ ] Error handling for each step
- [ ] Form validation for each field
- [ ] Total spending updates correctly
- [ ] Sorting remains consistent after changes

---

**End of Flow PRD 2: Subscription Lifecycle**

