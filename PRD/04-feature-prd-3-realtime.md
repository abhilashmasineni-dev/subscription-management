# FEATURE PRD 3: Real-time & Notifications

**Document Version**: 1.0  
**Last Updated**: April 4, 2026  
**Status**: Ready for Development  
**Priority**: P1 (High - Creates engagement)

---

## 1. FEATURE OVERVIEW

### Feature Name
**Real-time & Notifications**

### What This Feature Does
This feature provides real-time synchronization across browser tabs and critical expiration alerts. When a subscription is about to expire (within 1 minute), users see a persistent toast notification. When any tab adds/edits/deletes a subscription, other tabs update instantly without requiring a page refresh.

### Why It Matters
- **Engagement**: Users get timely alerts before their subscriptions renew
- **Consistency**: Multiple tabs always show the same data
- **UX**: No stale data, no confusion about what's current
- **DBMS Concept**: Demonstrates PostgreSQL LISTEN/NOTIFY, WebSocket connections, and real-time subscriptions

### Dependencies
- **Requires**: PRD 1 (Auth) + PRD 2 (CRUD) - needs subscriptions to exist
- **Blocks**: PRD 4 (Automation) - uses real-time for notifications

### Estimated Complexity
- **Complexity Level**: High (real-time is tricky)
- **Reason**: WebSocket connections, concurrent updates, race conditions
- **Development Time**: 3-4 days

---

## 2. USER STORIES WITH ACCEPTANCE CRITERIA

### Story 1: T-1 Minute Expiration Alert

**As a** user  
**I want to** receive a notification 1 minute before my subscription expires  
**So that** I have time to decide whether to keep or cancel the subscription

#### Acceptance Criteria

```gherkin
Scenario 1.1: T-1 Minute Toast Alert Appears
Given: Current time is 17:29 (1 minute before 17:30 expiration)
And: I'm on the dashboard
And: Netflix subscription expires at 17:30
When: Page loads (or every 30 seconds via polling check)
Then: T-1 minute check runs
And: Detects Netflix expires within 1 minute
And: Toast notification appears:
  - Title: "Expiration Alert"
  - Message: "Your Netflix subscription expires in less than 1 minute!"
  - Icon: Warning or clock icon
  - Color: Yellow/orange (warning)
  - Position: Top-right corner
  - Duration: Stays for exactly 1 minute
  - Has close button (X) for manual dismiss

Scenario 1.2: Toast Dismisses After 1 Minute
Given: T-1 minute toast is showing
When: Exactly 1 minute passes since toast appeared
Then: Toast auto-dismisses/fades out
And: User can see dashboard clearly
And: No toast if they already saw one (don't spam)

Scenario 1.3: Manual Toast Dismiss
Given: T-1 minute toast is showing
When: User clicks X button or swipes dismiss
Then: Toast closes immediately
And: No error or issue
And: Can be re-shown if subscription still within 1-minute window
And: Refresh needed to retrigger check

Scenario 1.4: Multiple Subscriptions Expiring
Given: Netflix (17:29), Spotify (17:45), Apple (17:59) all expire tonight
When: T-1 minute check runs
Then: Multiple toasts appear (one per subscription within 1 minute window)
And: Toasts stack vertically in corner
And: Each has own close button
And: Each dismisses independently

Scenario 1.5: Check Runs Periodically
Given: I'm on dashboard watching
When: Time passes
Then: T-1 minute check runs every 30 seconds
And: If new subscription enters <1 minute window, alert shows
And: If subscription passes expiration, alert updates ("Just expired!")
And: No alert spam (track shown subscriptions)

Scenario 1.6: Toast on Page Load
Given: I close browser at 17:28 (2 min before Netflix expires)
And: I reopen browser at 17:29 (1 min before Netflix expires)
When: Dashboard loads
Then: T-1 minute check runs
And: Detects Netflix <1 minute away
And: Toast immediately appears
And: User is alerted

Scenario 1.7: No Alert for Disabled Subscriptions
Given: Netflix is disabled (status='disabled')
And: Expiration is within 1 minute
When: T-1 minute check runs
Then: NO alert appears (disabled subs not monitored)
And: No confusing notifications about disabled items

Scenario 1.8: Toast Message for Just-Expired
Given: Current time is 17:31 (1 minute after 17:30 expiration)
And: Netflix hasn't been moved to expired table yet
When: T-1 minute check runs
Then: Toast shows: "Netflix has expired!"
And: Info: "It's been moved to Expired subscriptions"
And: Suggests: "Click to view"
And: Toast links to Expired tab (optional)
```

---

### Story 2: Real-Time Sync Across Tabs

**As a** user  
**I want to** have all my browser tabs stay in sync without refreshing  
**So that** I don't see conflicting information across different tabs

#### Acceptance Criteria

```gherkin
Scenario 2.1: Add on Tab A, Tab B Updates
Given: Dashboard open on Tab A and Tab B
When: I add Netflix on Tab A
Then: POST /api/subscriptions succeeds
And: Success toast shows on Tab A
And: Netflix card appears on Tab A
And: After <500ms, Tab B receives real-time update
And: Netflix card appears on Tab B automatically
And: No manual refresh needed on Tab B
And: Both tabs identical

Scenario 2.2: Edit on Tab A, Tab B Updates
Given: Netflix card showing on Tab A and Tab B
And: Both showing cost $12.99
When: I edit on Tab A, change cost to $15.99
Then: Edit form submits on Tab A
And: Success toast on Tab A
And: After <500ms, Netflix card on Tab B updates
And: Cost now shows $15.99 on both tabs
And: No refresh needed

Scenario 2.3: Delete on Tab A, Tab B Updates
Given: Netflix on Tab A and Tab B (Active Subscriptions tab)
When: I delete Netflix on Tab A
Then: Success toast: "Netflix deleted (can recover within 24h)"
And: Netflix disappears from Tab A
And: After <500ms, Netflix disappears from Tab B
And: Both tabs show same active subscription list
And: Tab B doesn't show deleted item

Scenario 2.4: Tab Shows Deleted Item in Deleted Tab
Given: Netflix deleted on Tab A (now in Deleted tab)
When: I switch to Deleted tab on Tab B
Then: Netflix card appears in Deleted tab
And: Shows "Deleted on [time]"
And: No manual refresh needed

Scenario 2.5: Disable on Tab A, Tab B Reflects
Given: Netflix showing as active on Tab A and Tab B
When: I disable Netflix on Tab A
Then: Netflix grays out on Tab A, moves to Disabled section
And: After <500ms, Netflix grays out on Tab B, moves to Disabled section
And: Both tabs identical
And: Both show updated tab counts (e.g., "Active (4)", "Disabled (1)")

Scenario 2.6: Re-enable on Tab A, Tab B Reflects
Given: Netflix disabled on Tab A and Tab B
When: I re-enable Netflix on Tab A
Then: Netflix normalizes on Tab A, moves to Active section
And: After <500ms, Netflix normalizes on Tab B, moves to Active section
And: Both tabs identical

Scenario 2.7: Restore from Deleted on Tab A, Tab B Reflects
Given: Netflix in Deleted tab on Tab A and Tab B
When: I restore Netflix on Tab A
Then: Netflix reappears in Active tab on Tab A
And: After <500ms, Netflix reappears in Active tab on Tab B
And: Both tabs show Netflix in active subscriptions
And: Deleted tab count decrements

Scenario 2.8: Total Monthly Spending Updates
Given: Total on Tab A shows $42.98 (Netflix + Spotify + Apple)
When: I add new subscription ($10) on Tab B
Then: On Tab B, total immediately updates to $52.98
And: After <500ms, total on Tab A updates to $52.98
And: Both tabs match

Scenario 2.9: Sorting Persists Across Tabs
Given: Tab A sorted by "Cost: High to Low"
When: I switch to Disabled Subscriptions tab on Tab A
Then: Disabled subscriptions sorted by Cost: High to Low
And: Same sorting applies if I switch tabs on Tab B
And: Sorting doesn't reset when real-time update happens

Scenario 2.10: Real-Time Works with Tabs in Background
Given: Tab A is active (focused)
And: Tab B is in background
When: I add subscription on Tab A
Then: Tab B receives real-time update (even though not focused)
And: When I switch to Tab B, it's already updated
And: No flickering or lag
```

---

### Story 3: Real-Time Connection Status

**As a** user  
**I want to** know if my real-time connection is active  
**So that** I know whether my changes will sync or if I need to refresh

#### Acceptance Criteria

```gherkin
Scenario 3.1: Connected Status
Given: Dashboard loads with valid Supabase connection
When: Page fully loads
Then: Real-time connection established
And: Optional: "Connected" indicator shows (subtle, in corner)
And: All changes sync instantly

Scenario 3.2: Connection Lost
Given: Real-time connection is active
And: Network drops (simulate with DevTools)
When: Network goes offline
Then: WebSocket connection closes
And: Optional: Indicator changes to "Offline"
And: If user tries to add subscription:
  - Form submits via API (not real-time)
  - Other tabs don't auto-update
  - Warning: "Changes won't sync to other tabs until connection restored"

Scenario 3.3: Connection Restored
Given: Network was offline
When: Network comes back online
Then: WebSocket reconnects automatically
And: Indicator shows "Connected"
And: Real-time sync resumes
And: Any missed updates are fetched (full refresh of subscriptions)
And: Tabs re-sync

Scenario 3.4: Graceful Degradation (No Real-Time)
Given: Supabase real-time is temporarily unavailable
When: User adds subscription
Then: API call still succeeds (POST /api/subscriptions works)
And: Toast shows: "Added, but other tabs may not update immediately"
And: User can manually refresh Tab B if needed
And: No data loss
```

---

### Story 4: Toast Notifications

**As a** user  
**I want to** see clear feedback when actions succeed or fail  
**So that** I know what happened

#### Acceptance Criteria

```gherkin
Scenario 4.1: Success Toast on Add
Given: Add subscription form submitted successfully
When: Request returns 201
Then: Toast appears:
  - Message: "Netflix added successfully"
  - Color: Green
  - Icon: Checkmark
  - Duration: 3 seconds (then auto-dismiss)
  - Can dismiss manually with X

Scenario 4.2: Success Toast on Edit
Given: Edit subscription form submitted successfully
When: Request returns 200
Then: Toast appears:
  - Message: "Netflix updated successfully"
  - Duration: 3 seconds

Scenario 4.3: Success Toast on Delete
Given: Delete confirmation submitted
When: Request returns 200
Then: Toast appears:
  - Message: "Netflix deleted (can recover within 24h)"
  - Duration: 3 seconds

Scenario 4.4: Success Toast on Disable
Given: Disable action submitted
When: Request returns 200
Then: Toast appears:
  - Message: "Netflix disabled"
  - Duration: 3 seconds

Scenario 4.5: Error Toast on Failed Add
Given: Add subscription with invalid data
When: Request returns 400
Then: Toast appears:
  - Message: Shows specific error (e.g., "Cost must be greater than 0")
  - Color: Red
  - Icon: X or exclamation
  - Duration: 5 seconds (longer than success for visibility)
  - Can dismiss manually

Scenario 4.6: Error Toast on Network Timeout
Given: Add subscription form submitted
When: Network request times out after 10 seconds
Then: Toast appears:
  - Message: "Network error. Please check your connection and try again."
  - Color: Red
  - Shows retry option (optional)
  - Duration: 5+ seconds

Scenario 4.7: Toast Stacking
Given: Multiple toasts triggered in quick succession
When: 3 toasts shown at same time
Then: Toasts stack vertically
And: Each has its own close button
And: Don't overlap
And: Responsive (don't go off-screen on mobile)

Scenario 4.8: Toast Accessibility
Given: Toast notification appears
When: Screen reader is active
Then: Toast content is read aloud
And: User notified of success/error status
```

---

## 3. DATABASE SCHEMA

### Changes to Existing Tables

No new tables needed. This feature uses:
- `active_subscriptions` (for querying)
- `expired_subscriptions` (for querying)
- `deleted_subscriptions` (for querying)

### Real-Time Triggers (Optional)

```sql
-- Optional: Create trigger to notify on subscription changes
-- (Supabase real-time handles this automatically if Realtime is enabled)

-- Monitor active_subscriptions changes
ALTER TABLE active_subscriptions REPLICA IDENTITY FULL;

-- Supabase automatically broadcasts changes via LISTEN/NOTIFY
-- No manual trigger needed if using Supabase Realtime
```

---

## 4. API ENDPOINTS

### New Endpoint: GET /api/notifications/check

**Purpose**: Check for subscriptions expiring within 1 minute

**Query Parameters**:
```
None (uses current user's subscriptions)
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "expiring_soon": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "subscription_name": "Netflix",
      "expiration_date": "2026-04-04T17:30:00Z",
      "minutes_until_expiry": 0.5,
      "message": "Your Netflix subscription expires in less than 1 minute!"
    }
  ],
  "count": 1
}
```

**Implementation**:
- Query active_subscriptions where:
  - `user_id = auth.uid()`
  - `status = 'active'`
  - `expiration_date BETWEEN NOW() AND NOW() + INTERVAL '1 minute'`
  - NOT in "recently_notified" list (to avoid spam)
- Return list of subscriptions

---

## 5. FRONTEND COMPONENTS & UI

### Component 1: ToastContainer

**Location**: `/components/Toast/ToastContainer.tsx`

**Purpose**: Root toast management, displays all toasts

**Features**:
- Manages toast queue (multiple toasts)
- Positions toasts (top-right, bottom-right, etc.)
- Auto-dismiss timers
- Manual close buttons
- Stacking logic
- Responsive positioning (mobile vs desktop)

---

### Component 2: Toast

**Location**: `/components/Toast/Toast.tsx`

**Props**:
```typescript
interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;  // ms (default 3000 for success, 5000 for error)
  onClose: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}
```

**Features**:
- Color-coded by type
- Icon based on type
- Auto-dismiss timer
- Close button
- Optional action button
- Accessibility attributes

---

### Component 3: Real-Time Listener Hook

**Location**: `/hooks/useRealtimeSubscriptions.ts`

**Usage**:
```typescript
const { subscriptions, isConnected } = useRealtimeSubscriptions(user_id);

// Subscribes to changes on active_subscriptions table
// Auto-updates when changes detected
// Returns current subscriptions + connection status
```

**Implementation**:
```typescript
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useRealtimeSubscriptions(userId: string) {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    if (!userId) return;

    // Initial fetch
    fetchSubscriptions();

    // Subscribe to real-time updates
    const subscription = supabase
      .from(`active_subscriptions:user_id=eq.${userId}`)
      .on('*', (payload) => {
        // Handle INSERT, UPDATE, DELETE
        handleChange(payload);
      })
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  return { subscriptions, isConnected };
}
```

---

### Component 4: ExpirationAlertChecker

**Location**: `/components/ExpirationAlertChecker.tsx`

**Purpose**: Periodically checks for T-1 minute expirations

**Props**:
```typescript
interface ExpirationAlertCheckerProps {
  subscriptions: Subscription[];
  checkInterval?: number;  // ms (default 30000 = 30 seconds)
}
```

**Behavior**:
- Runs every 30 seconds
- Compares current time with expiration_date
- Shows toast if within 1 minute
- Tracks already-notified subscriptions (avoid spam)
- Cleans up tracking when subscription expires/moves

---

### Component 5: ConnectionStatus Indicator (Optional)

**Location**: `/components/ConnectionStatus.tsx`

**Features**:
- Shows "Connected" / "Offline" status
- Subtle indicator (optional)
- Color-coded (green = connected, red = offline)
- Auto-updates when connection changes

---

## 6. EDGE CASES & ERROR HANDLING

### Real-Time Connection Issues

#### Scenario: WebSocket Disconnects
```
Condition: Supabase real-time connection drops
Expected: Graceful degradation
- Toast added: UI shows success (optimistic)
- Other tabs don't auto-update
- When connection restores: Fetch latest data
- Refresh toast on Tab B to see changes
```

#### Scenario: Slow Network
```
Condition: Real-time sync takes >2 seconds
Expected: Show "Syncing..." indicator
- Optimistic update shows immediately
- Loading indicator appears
- When sync completes, confirm update
- No double-animation or flicker
```

---

### Expiration Alert Edge Cases

#### Scenario: Clock Skew (Server vs Client)
```
Condition: Browser clock 1 minute ahead of server
Expected: Alert may appear 1 minute early
- Acceptable trade-off (warn early is better)
- Server-side expiration check is authoritative
```

#### Scenario: Subscription Expires While Viewing
```
Condition: I'm looking at subscription at 17:29:30, it expires at 17:30
Expected:
- At 17:30, T-1 minute check detects expiration
- Toast: "Netflix has expired!"
- Cron job (PRD 4) moves to expired_subscriptions
- Tab A dashboard updates via real-time
- Card moves to Expired tab automatically
```

#### Scenario: Multiple Alerts for Same Subscription
```
Condition: Refresh page multiple times before expiration
Expected: Toast doesn't spam
- Track notified subscriptions: "already_alerted"
- Clear list when subscription expires or moves
- Only show once per subscription per day (approx)
```

---

### Toast Notification Issues

#### Scenario: Too Many Toasts
```
Condition: 10 errors trigger toasts in quick succession
Expected:
- Toasts stack (don't overlap)
- Oldest toasts appear at top
- Can scroll through if many
- Auto-dismiss oldest first
```

#### Scenario: Toast Content Very Long
```
Condition: Error message is 200 characters
Expected:
- Toast expands to fit (or truncates with ellipsis)
- Doesn't go off-screen
- Close button always accessible
- Text wraps on mobile
```

---

### Race Conditions

#### Scenario: Edit and Delete Simultaneously
```
Condition: User clicks Edit on Tab A, Delete on Tab B at same time
Expected:
- Delete succeeds, returns 200
- Edit fails, returns 404 (item not found)
- Edit error toast: "Subscription was deleted"
- Both tabs show deleted item in Deleted tab
- No data corruption
```

---

## 7. REAL-TIME ARCHITECTURE

### WebSocket Connection Flow

```
Browser
  │
  ├─→ Supabase Real-time SDK (Supabase Client)
  │     │
  │     └─→ WebSocket Connection to Supabase
  │
  ├─→ Supabase Backend
  │     │
  │     └─→ PostgreSQL Database
  │           │
  │           └─→ LISTEN/NOTIFY
  │
  └─→ When subscription changes:
      1. INSERT/UPDATE/DELETE on active_subscriptions
      2. PostgreSQL triggers NOTIFY
      3. Supabase receives notification
      4. Broadcasts via WebSocket to all subscribed clients
      5. Browser receives update via Supabase SDK
      6. Real-time hook detects change
      7. UI updates instantly
```

### Real-Time Subscription Pattern

```typescript
// Subscribe to table changes
supabase
  .from('active_subscriptions')
  .on('INSERT', (payload) => {
    // payload.new = newly inserted row
    setSubscriptions([...subscriptions, payload.new]);
  })
  .on('UPDATE', (payload) => {
    // payload.new = updated row
    setSubscriptions(subscriptions.map(sub =>
      sub.id === payload.new.id ? payload.new : sub
    ));
  })
  .on('DELETE', (payload) => {
    // payload.old = deleted row
    setSubscriptions(subscriptions.filter(sub => sub.id !== payload.old.id));
  })
  .subscribe((status) => {
    setIsConnected(status === 'SUBSCRIBED');
  });
```

---

## 8. SECURITY & RLS

### Real-Time Respects RLS

- When user subscribes to real-time:
  - Only receives updates for their own subscriptions (RLS enforced)
  - User A cannot see User B's insert/update/delete events
  - Each user's WebSocket receives only their data

---

## 9. TESTING SCENARIOS

### Happy Path
```
✅ T-1 minute alert appears
✅ Alert auto-dismisses after 1 minute
✅ Manual alert dismiss works
✅ Add on Tab A appears on Tab B
✅ Edit on Tab A updates on Tab B
✅ Delete on Tab A removes from Tab B
✅ Total monthly spending updates real-time
✅ Success toasts appear
✅ Error toasts appear
```

### Error Path
```
✅ Network disconnect (graceful degradation)
✅ Real-time connection fails (API still works)
✅ Multiple toasts don't overlap
✅ Race conditions (edit/delete same item)
```

---

## 10. ACCEPTANCE CRITERIA

- ✅ T-1 minute alert appears reliably
- ✅ Alert persists for 1 minute
- ✅ Real-time sync <500ms latency
- ✅ Tabs stay in sync (no manual refresh needed)
- ✅ Total monthly spending updates real-time
- ✅ Toasts appear for all actions (success/error)
- ✅ No data leaks between users (RLS enforced)
- ✅ Graceful degradation if real-time unavailable
- ✅ No console errors
- ✅ Connection status visible (optional)

---

## 11. SUCCESS METRICS

| Metric | Target |
|--------|--------|
| Real-time sync latency | <500ms |
| T-1 alert accuracy | 100% |
| Toast display | 100% |
| Tab sync success | 100% |
| No data leaks | 100% |
| User confusion (alert) | <5% |

---

## 12. BLOCKERS & DEPENDENCIES

**Depends On**: PRD 1 (Auth) + PRD 2 (CRUD)  
**Blocks**: PRD 4 (Automation - uses real-time for notifications)

---

**End of Feature PRD 3**

