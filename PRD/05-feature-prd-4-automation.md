# FEATURE PRD 4: Automation & Data Lifecycle

**Document Version**: 1.0  
**Last Updated**: April 4, 2026  
**Status**: Ready for Development  
**Priority**: P0 (Critical - Core DBMS Concept)

---

## 1. FEATURE OVERVIEW

### Feature Name
**Automation & Data Lifecycle**

### What This Feature Does
This feature automates the movement of subscriptions through their lifecycle. When a subscription expires, it's automatically moved to the expired_subscriptions table. Users can restore it within 24 hours. After 24 hours, it's permanently deleted. Same logic applies to user-initiated deletes (soft delete → 24-hour hold → auto-permanent delete).

### Why It Matters
- **Automation**: No manual intervention needed
- **Data Cleanup**: Database stays clean
- **Recovery**: Users have a 24-hour window to undo deletions
- **DBMS Concept**: Demonstrates Cron jobs, triggers, data transitions, and batch processing
- **Compliance**: Soft delete pattern keeps audit trail

### Dependencies
- **Requires**: PRD 1 (Auth) + PRD 2 (CRUD) + PRD 3 (Real-time)
- **Blocks**: Nothing (this is the final feature)

### Estimated Complexity
- **Complexity Level**: High (background jobs, timing, reliability)
- **Reason**: Cron jobs must run reliably, handle failures gracefully
- **Development Time**: 3-4 days

---

## 2. USER STORIES WITH ACCEPTANCE CRITERIA

### Story 1: Auto-Move Expired Subscriptions

**As a** system  
**I want to** automatically move subscriptions to expired_subscriptions when their expiration_date passes  
**So that** users always see accurate, up-to-date subscription status

#### Acceptance Criteria

```gherkin
Scenario 1.1: Subscription Auto-Moves at Expiration
Given: Netflix subscription with expiration_date = "2026-04-04T17:30:00Z"
And: Current time is "2026-04-04T17:31:00Z" (1 minute after expiration)
When: Cron job /api/cron/move-expired runs
Then: Database query finds Netflix (expiration_date <= NOW())
And: Netflix is moved to expired_subscriptions:
  - All fields copied to expired_subscriptions
  - original_subscription_id = Netflix.id
  - expired_at = NOW() (exactly when moved)
  - can_restore_until = NOW() + 24 hours
  - status = 'expired'
And: Netflix is DELETED from active_subscriptions
And: Real-time update sent to user's dashboard
And: If user viewing dashboard: Netflix moves to Expired tab automatically
And: If user not viewing: Update waits for next dashboard load
And: No errors, no data loss

Scenario 1.2: Cron Job Runs Every Minute
Given: Vercel Cron job configured to run "/api/cron/move-expired"
When: Clock hits :00, :01, :02, :03, etc.
Then: Cron job executes reliably
And: Finds all expired subscriptions (user_id, expiration_date <= NOW())
And: Moves them all in one batch (single transaction)
And: Logs success: "Moved X subscriptions"
And: No duplicates (if job runs twice, still moves only once)

Scenario 1.3: Active AND Disabled Subscriptions Auto-Expire
Given: Netflix is 'active', Hulu is 'disabled'
And: Both have expiration_date = NOW() - 1 minute
When: Cron job runs
Then: Both are moved to expired_subscriptions
And: Status preserved: Netflix has status='expired', Hulu has status='expired'
And: Both can be restored within 24h (status doesn't matter for restoration)

Scenario 1.4: Atomic Transaction (All or Nothing)
Given: 5 subscriptions are expiring right now
When: Cron job runs
Then: Either ALL 5 move, or NONE move (atomic)
And: No partial moves (e.g., 3 moved, 2 not)
And: If database connection drops mid-job: All moves rolled back

Scenario 1.5: Only Moving Exact Expired (Not Near-Expired)
Given: Netflix expires at 17:30:00
And: Current time is 17:29:59 (1 second before)
When: Cron job runs
Then: Netflix is NOT moved
And: Remains in active_subscriptions
And: Moved only when expiration_date <= NOW()

Scenario 1.6: Cron Job Handles Errors Gracefully
Given: Database is temporarily unavailable
When: Cron job tries to run
Then: Request times out after 30 seconds
And: Error is logged: "Cron job failed: [error message]"
And: Job returns HTTP 500
And: Vercel will retry (configurable)
And: No partial moves, data stays consistent

Scenario 1.7: User Cannot Manually Move Expired
Given: Netflix is in active_subscriptions, expires now
When: User tries to move it manually
Then: User cannot move it (not an exposed feature)
And: Only Cron job can move
And: User can view it moving to Expired tab automatically

Scenario 1.8: No Duplicates on Cron Re-Run
Given: Cron job moved Netflix to expired_subscriptions
When: Cron job runs again (next minute)
Then: Netflix is NOT moved again (already in expired_subscriptions)
And: Only subscriptions in active_subscriptions are processed
And: No duplicates in expired_subscriptions
```

---

### Story 2: Restore from Expired (Within 24 Hours)

**As a** user  
**I want to** restore a subscription from the expired table within 24 hours  
**So that** I can reactivate a subscription that expired

#### Acceptance Criteria

```gherkin
Scenario 2.1: Restore Form Appears
Given: Netflix is in Expired tab (expired 2 hours ago)
And: can_restore_until = 22 hours from now (within 24h)
When: I click "Restore" button on Netflix card
Then: A restoration form modal opens with:
  - Subscription name: Netflix (pre-filled, readonly or not)
  - Start date: Original start date
  - Expiration date: Blank (user must enter new date)
  - Expiration time: Blank (user must enter new time)
  - Cost: Original cost (pre-filled)
  - Message: "Enter the new expiration date to reactivate"
And: Expiration date field is required
And: Expiration date must be >= today

Scenario 2.2: Successful Restoration
Given: Restoration form is open with new expiration date
When: I enter expiration date "2026-06-01" at "10:00 AM"
And: I click "Restore" button
Then: POST /api/subscriptions/restore/:id is called
And: Backend:
  - Creates new record in active_subscriptions:
    - user_id, name, link, start_date: original values
    - expiration_date: user-provided (2026-06-01 10:00)
    - cost, currency: original values
    - status: 'active'
  - Updates expired_subscriptions:
    - Sets status: 'restored'
    - Sets restored_at: NOW()
  - Does NOT delete from expired_subscriptions (audit trail)
And: Success toast: "Netflix restored successfully"
And: Modal closes
And: Netflix appears in Active tab with new expiration date
And: Card shows new date: "June 1, 2026 10:00 AM"
And: Removed from Expired tab

Scenario 2.3: Cannot Restore After 24h Window
Given: Netflix expired 25 hours ago
And: can_restore_until = NOW() - 1 hour (past deadline)
When: I look at Netflix card in Expired tab
Then: "Restore" button is DISABLED (grayed out)
And: Text shows: "Can't restore (expired more than 24 hours ago)"
And: Clicking disabled button shows: "Restoration window has expired"
And: Button remains disabled until record is auto-deleted

Scenario 2.4: Restore with New Details (Editing)
Given: Netflix expired, in Expired tab
And: Original: start=2026-03-01, expiration=2026-05-01
When: I restore with new expiration: 2026-07-01
Then: Active record created with:
  - start_date: 2026-03-01 (unchanged)
  - expiration_date: 2026-07-01 (user-provided)
And: Cost/name unchanged
And: No ability to change cost during restoration (design choice)

Scenario 2.5: Restore Confirmation
Given: Restoration form filled with new date
When: I click "Restore"
Then: Confirmation dialog:
  - "Restore Netflix with expiration June 1, 2026?"
  - Shows new date for clarity
When: I click "Confirm"
Then: Restoration proceeds as in Scenario 2.2
When: I click "Cancel"
Then: Form closes, no changes

Scenario 2.6: Network Error During Restore
Given: Restoration form filled
When: I click "Restore" and network drops
Then: Error toast: "Network error. Please try again."
And: Form remains open
And: Can retry when connection restored
And: No partial restoration (Netflix still in expired)

Scenario 2.7: Restore Triggers Real-Time Update
Given: User A restoring Netflix on Tab A
And: User A has Tab B also open
When: Restoration succeeds
Then: Tab B detects real-time update
And: Netflix disappears from Expired tab on Tab B
And: Netflix appears in Active tab on Tab B
And: New expiration date shows on Tab B
And: No refresh needed
```

---

### Story 3: Auto-Delete Old Records

**As a** system  
**I want to** automatically permanently delete expired and deleted subscriptions after 24 hours  
**So that** the database doesn't accumulate old records indefinitely

#### Acceptance Criteria

```gherkin
Scenario 3.1: Auto-Delete After 24h from expired_subscriptions
Given: Netflix was expired 24+ hours ago
And: can_restore_until = NOW() - 1 minute (past window)
When: Cron job /api/cron/delete-old-records runs
Then: Database query finds expired records with can_restore_until <= NOW()
And: Netflix is PERMANENTLY DELETED from expired_subscriptions
And: Cannot be recovered (no soft delete, just gone)
And: Real-time update sent (if user viewing): "Record deleted"
And: Logs success: "Deleted X old expired records"

Scenario 3.2: Auto-Delete After 24h from deleted_subscriptions
Given: Hulu was soft-deleted 24+ hours ago
And: can_restore_until = NOW() - 2 hours (past window)
When: Cron job /api/cron/delete-old-records runs
Then: Database finds deleted records with can_restore_until <= NOW()
And: Hulu is PERMANENTLY DELETED from deleted_subscriptions
And: User cannot restore (doesn't appear in Deleted tab)
And: No recovery possible after 24h

Scenario 3.3: Do Not Delete Records Within 24h Window
Given: Netflix was expired 20 hours ago
And: can_restore_until = 4 hours from now (still valid)
When: Cron job /api/cron/delete-old-records runs
Then: Netflix is NOT deleted
And: Remains in expired_subscriptions
And: can_restore_until timestamp is still in future
And: User can still restore for next 4 hours

Scenario 3.4: Cron Job Runs Daily (or Hourly)
Given: Cron job configured to run daily at 3 AM (or every hour)
When: Scheduled time arrives
Then: Cron job executes
And: Deletes all old records (can_restore_until <= NOW())
And: Logs success/failure
And: No errors, database stays clean

Scenario 3.5: Verify Deletion is Permanent
Given: Netflix was auto-deleted from expired_subscriptions
When: I query the database directly or via UI
Then: Netflix record is completely gone
And: Not in expired_subscriptions
And: Not in deleted_subscriptions
And: Not in active_subscriptions
And: Cannot be recovered
And: Audit log may still have trace (if logging enabled)

Scenario 3.6: Handle Orphaned Records
Given: deleted_subscriptions record with no original_subscription_id (orphaned)
When: Cron job runs (deletion check)
Then: Orphaned record is still checked for can_restore_until
And: If >24h old, it's deleted
And: If <24h old, it's kept
And: No errors from missing foreign keys

Scenario 3.7: No Cascade Delete Issues
Given: Netflix in expired_subscriptions, original_subscription_id → active.id
When: Cron job deletes from expired_subscriptions
Then: No foreign key issues (original_subscription_id can be null/deleted)
And: Deletion completes successfully
And: active_subscriptions is unaffected
```

---

### Story 4: Soft Delete Workflow (User-Initiated Deletion)

**As a** user  
**I want to** delete a subscription with a 24-hour recovery window  
**So that** I don't lose data if I delete by accident

#### Acceptance Criteria

```gherkin
Scenario 4.1: User Deletes, Moves to deleted_subscriptions
Given: Netflix is on Active tab
When: I click three-dot menu, click "Delete"
Then: Confirmation dialog shows: "Delete Netflix? You can recover within 24h."
When: I click "Delete" to confirm
Then: Netflix is moved to deleted_subscriptions:
  - Copied with all original data
  - deleted_at = NOW()
  - can_restore_until = NOW() + 24 hours
  - original_subscription_id = Netflix.id (reference to original)
And: Netflix is DELETED from active_subscriptions
And: Success toast: "Netflix deleted (can recover within 24h)"
And: Netflix disappears from Active tab
And: Appears in Deleted tab

Scenario 4.2: Restore from Deleted Tab
Given: Netflix in Deleted tab (deleted 2 hours ago)
And: can_restore_until = 22 hours from now
When: I click "Restore" button on Netflix card
Then: Confirmation: "Restore Netflix?"
When: I click "Confirm"
Then: Netflix is RESTORED to active_subscriptions:
  - All original data restored
  - status: 'active' (back to original)
  - created_at: original timestamp (preserved)
  - updated_at: updated to now
And: deleted_subscriptions record is kept (audit trail)
And: Success toast: "Netflix restored"
And: Netflix appears in Active tab
And: Removed from Deleted tab
And: Sorted into correct position

Scenario 4.3: Permanent Delete After 24h
Given: Netflix deleted 25 hours ago
And: can_restore_until = NOW() - 1 hour (past window)
When: Cron job /api/cron/delete-old-records runs
Then: Netflix is PERMANENTLY deleted from deleted_subscriptions
And: Cannot be recovered
And: If user viewing Deleted tab: Netflix disappears
And: Real-time update removes it
And: Deleted tab count decrements

Scenario 4.4: Multiple Deletes in Short Time
Given: I delete Netflix, then immediately delete Spotify
When: Cron job runs (after 24h)
Then: Both are permanently deleted
And: No data loss, no duplicates
And: Both entries in deleted_subscriptions have correct timestamps

Scenario 4.5: Delete Disabled Subscription
Given: Hulu is disabled (status='disabled')
When: I delete Hulu
Then: Hulu moved to deleted_subscriptions
And: Original data preserved (including that it was disabled)
And: Can be restored (returns as active, not disabled)
And: After 24h: Permanently deleted
```

---

## 3. DATABASE SCHEMA

### Updated Tables

#### Table: `expired_subscriptions` (enhanced)

```sql
CREATE TABLE IF NOT EXISTS expired_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_subscription_id UUID REFERENCES active_subscriptions(id),
  subscription_name VARCHAR(255),
  website_link VARCHAR(255),
  start_date DATE,
  expiration_date TIMESTAMP,
  cost DECIMAL(10, 2),
  currency VARCHAR(3),
  status VARCHAR(50) DEFAULT 'expired' CHECK (status IN ('expired', 'restored')),
  expired_at TIMESTAMP NOT NULL DEFAULT NOW(),
  can_restore_until TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  restored_at TIMESTAMP,  -- When restored (if status='restored')
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_restore_window CHECK (can_restore_until > expired_at),
  CONSTRAINT restored_after_expired CHECK (restored_at IS NULL OR restored_at >= expired_at)
);

CREATE INDEX idx_expired_subscriptions_user_id ON expired_subscriptions(user_id);
CREATE INDEX idx_expired_subscriptions_can_restore 
  ON expired_subscriptions(user_id, can_restore_until);
CREATE INDEX idx_expired_subscriptions_expired_at ON expired_subscriptions(expired_at);
```

#### Table: `deleted_subscriptions` (enhanced)

```sql
CREATE TABLE IF NOT EXISTS deleted_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_subscription_id UUID,  -- Can be null if original deleted
  subscription_name VARCHAR(255),
  website_link VARCHAR(255),
  start_date DATE,
  expiration_date TIMESTAMP,
  cost DECIMAL(10, 2),
  currency VARCHAR(3),
  deleted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  can_restore_until TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  restored_at TIMESTAMP,  -- When restored (if restored)
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_restore_window CHECK (can_restore_until > deleted_at)
);

CREATE INDEX idx_deleted_subscriptions_user_id ON deleted_subscriptions(user_id);
CREATE INDEX idx_deleted_subscriptions_can_restore 
  ON deleted_subscriptions(user_id, can_restore_until);
CREATE INDEX idx_deleted_subscriptions_deleted_at ON deleted_subscriptions(deleted_at);
```

---

## 4. CRON JOB IMPLEMENTATIONS

### Cron Job 1: Move Expired Subscriptions

**File**: `/pages/api/cron/move-expired.ts`

**Schedule**: Every minute (*/1 * * * *)

**Implementation**:
```typescript
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Verify Vercel Cron secret
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY  // Server-side key
    );

    // Step 1: Find all expired subscriptions (active and disabled)
    const { data: expiredSubs, error: fetchError } = await supabase
      .from('active_subscriptions')
      .select('*')
      .lt('expiration_date', new Date().toISOString())
      .eq('user_id', 'any')  // All users
      .in('status', ['active', 'disabled']);

    if (fetchError) throw fetchError;

    if (!expiredSubs || expiredSubs.length === 0) {
      return res.status(200).json({ moved: 0, message: 'No expired subscriptions' });
    }

    // Step 2: Move to expired_subscriptions (batch insert)
    const movedRecords = expiredSubs.map(sub => ({
      user_id: sub.user_id,
      original_subscription_id: sub.id,
      subscription_name: sub.subscription_name,
      website_link: sub.website_link,
      start_date: sub.start_date,
      expiration_date: sub.expiration_date,
      cost: sub.cost,
      currency: sub.currency,
      status: 'expired',
      expired_at: new Date().toISOString(),
      can_restore_until: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    }));

    const { error: insertError } = await supabase
      .from('expired_subscriptions')
      .insert(movedRecords);

    if (insertError) throw insertError;

    // Step 3: Delete from active_subscriptions
    const { error: deleteError } = await supabase
      .from('active_subscriptions')
      .delete()
      .lt('expiration_date', new Date().toISOString())
      .in('status', ['active', 'disabled']);

    if (deleteError) throw deleteError;

    // Log success
    console.log(`[CRON] Moved ${expiredSubs.length} expired subscriptions`);

    return res.status(200).json({
      success: true,
      moved: expiredSubs.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Error moving expired subscriptions:', error);
    return res.status(500).json({
      error: 'Cron job failed',
      message: error.message,
    });
  }
}
```

**Configuration in `vercel.json`**:
```json
{
  "crons": [{
    "path": "/api/cron/move-expired",
    "schedule": "* * * * *"  // Every minute
  }]
}
```

---

### Cron Job 2: Delete Old Records

**File**: `/pages/api/cron/delete-old-records.ts`

**Schedule**: Every hour (0 * * * *)

**Implementation**:
```typescript
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  if (req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Delete old expired subscriptions
    const { data: oldExpired, error: expiredFetchError } = await supabase
      .from('expired_subscriptions')
      .select('id')
      .lt('can_restore_until', new Date().toISOString())
      .eq('status', 'expired');  // Only auto-delete 'expired', not 'restored'

    if (expiredFetchError) throw expiredFetchError;

    if (oldExpired && oldExpired.length > 0) {
      const { error: expiredDeleteError } = await supabase
        .from('expired_subscriptions')
        .delete()
        .lt('can_restore_until', new Date().toISOString())
        .eq('status', 'expired');

      if (expiredDeleteError) throw expiredDeleteError;
    }

    // Delete old deleted subscriptions
    const { data: oldDeleted, error: deletedFetchError } = await supabase
      .from('deleted_subscriptions')
      .select('id')
      .lt('can_restore_until', new Date().toISOString());

    if (deletedFetchError) throw deletedFetchError;

    if (oldDeleted && oldDeleted.length > 0) {
      const { error: deletedDeleteError } = await supabase
        .from('deleted_subscriptions')
        .delete()
        .lt('can_restore_until', new Date().toISOString());

      if (deletedDeleteError) throw deletedDeleteError;
    }

    const totalDeleted = (oldExpired?.length || 0) + (oldDeleted?.length || 0);

    console.log(`[CRON] Deleted ${totalDeleted} old records`);

    return res.status(200).json({
      success: true,
      deleted_expired: oldExpired?.length || 0,
      deleted_soft: oldDeleted?.length || 0,
      total_deleted: totalDeleted,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Error deleting old records:', error);
    return res.status(500).json({
      error: 'Cron job failed',
      message: error.message,
    });
  }
}
```

**Configuration in `vercel.json`**:
```json
{
  "crons": [{
    "path": "/api/cron/delete-old-records",
    "schedule": "0 * * * *"  // Every hour
  }]
}
```

---

## 5. API ENDPOINTS

### Endpoint 1: POST /api/subscriptions/restore/:id

**Purpose**: Restore a subscription from expired or deleted

**Request**:
```json
{
  "new_expiration_date": "2026-06-01T10:00:00Z"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Netflix restored successfully",
  "subscription": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "subscription_name": "Netflix",
    "expiration_date": "2026-06-01T10:00:00Z",
    "status": "active"
  }
}
```

**Errors**:

| Status | Error | Reason |
|--------|-------|--------|
| 400 | `invalid_date` | New expiration date invalid |
| 403 | `restore_window_expired` | >24h have passed |
| 404 | `not_found` | Subscription not in expired/deleted |
| 500 | `server_error` | Database error |

---

### Endpoint 2: GET /api/cron/status (Optional)

**Purpose**: Check Cron job health

**Response**:
```json
{
  "last_run_move_expired": "2026-04-04T10:15:00Z",
  "last_run_delete_old": "2026-04-04T10:00:00Z",
  "status": "healthy"
}
```

---

## 6. FRONTEND COMPONENTS & UI

### Component 1: RestoreForm

**Location**: `/components/RestoreForm.tsx`

**Props**:
```typescript
interface RestoreFormProps {
  subscription: ExpiredSubscription | DeletedSubscription;
  onRestore: (newExpirationDate: Date) => void;
  onCancel: () => void;
  timeoutMs?: number;  // 24 hours in ms
}
```

**Features**:
- Shows original subscription details (readonly)
- Form for new expiration date/time
- Countdown timer (hours/minutes remaining)
- Confirmation dialog before restore
- Loading state
- Error handling

---

### Component 2: TimerBadge (Optional)

**Location**: `/components/TimerBadge.tsx`

**Purpose**: Shows how long user has to restore

**Props**:
```typescript
interface TimerBadgeProps {
  createdAt: Date;  // deleted_at or expired_at
  expiresAt: Date;  // can_restore_until
  format?: 'countdown' | 'deadline';
}
```

**Features**:
- "Can restore in 22h 45m"
- Updates in real-time (decrements every minute)
- Changes color as deadline approaches
- Shows "Can't restore" when expired

---

## 7. EDGE CASES & ERROR HANDLING

### Cron Job Failures

#### Scenario: Cron job runs twice simultaneously
```
Condition: Both Vercel instances run /api/cron/move-expired at same time
Expected: No duplicates
Implementation:
- Query uses WHERE expiration_date <= NOW()
- Both move same subscriptions
- Both delete from active_subscriptions
- Second delete finds nothing (already deleted by first)
- No error, no duplicates
```

#### Scenario: Network timeout during Cron job
```
Condition: Database connection drops during batch operation
Expected: Atomic rollback
Implementation:
- SQL transaction: BEGIN ... COMMIT / ROLLBACK
- If error mid-operation: All changes rolled back
- No partial moves
- Next cron run retries
```

---

### Restoration Edge Cases

#### Scenario: User tries to restore after window expires
```
Condition: can_restore_until = NOW() - 1 minute
Expected: Restoration blocked
Implementation:
- Check: can_restore_until > NOW()
- If false: Return 403 error
- Button disabled on UI
```

#### Scenario: Restored record has same name as existing
```
Condition: User had Netflix, deleted it, created new Netflix, tries to restore old
Expected: Restoration fails or overwrites
Design choice: Should we allow duplicates?
- Option A: Allow (same subscription can exist twice)
- Option B: Prevent (UNIQUE constraint on user_id + name)
- Chosen: Option A (allow duplicates, user might have separate accounts)
```

---

### Data Consistency

#### Scenario: User restores while Cron deletes
```
Condition: Restore request and delete Cron run simultaneously
Expected: One succeeds, other fails gracefully
- Cron deletes from expired_subscriptions
- Restore tries to INSERT to active_subscriptions
- Both succeed independently
- No data loss, record recovered
```

---

## 8. TESTING SCENARIOS

### Happy Path
```
✅ Subscription expires, auto-moves to expired_subscriptions
✅ Restore within 24h, returns to active
✅ Cannot restore after 24h (button disabled)
✅ Auto-delete after 24h, completely gone
✅ Soft delete workflow (user delete → 24h → permanent)
✅ Cron job runs every minute without errors
✅ No duplicates after Cron runs
```

### Error Path
```
✅ Cron timeout (retry mechanism)
✅ Network error during restore (form stays open)
✅ Concurrent edit/delete (one wins, other fails gracefully)
```

---

## 9. ACCEPTANCE CRITERIA

- ✅ Subscriptions auto-move to expired at expiration
- ✅ Expired subscriptions visible in Expired tab
- ✅ Restore form works and accepts new expiration date
- ✅ Restoration moves back to Active within 24h window
- ✅ Cannot restore after 24h (button disabled)
- ✅ Auto-delete after 24h (permanent, no recovery)
- ✅ Soft delete (user delete → Deleted tab) works
- ✅ Restoration from Deleted tab works
- ✅ Cron jobs run reliably (every minute/hour)
- ✅ No data loss, no duplicates
- ✅ Real-time sync for all transitions
- ✅ No console errors

---

## 10. SUCCESS METRICS

| Metric | Target |
|--------|--------|
| Expiration accuracy | 100% |
| Auto-move success rate | 100% |
| Restore success rate | 100% |
| No duplicates | 100% |
| Cron reliability | 99.9% |
| Data consistency | 100% |

---

## 11. BLOCKERS & DEPENDENCIES

**Depends On**: PRD 1 + PRD 2 + PRD 3 (all prior features)  
**Blocks**: Nothing (final feature)

---

## 12. MONITORING & LOGS

### Cron Job Logs

Track in Vercel dashboard:
- `/api/cron/move-expired` execution time
- `/api/cron/delete-old-records` execution time
- Success/failure rate
- Number of records processed
- Errors and stack traces

### Database Monitoring

- `expired_subscriptions` record count
- `deleted_subscriptions` record count
- Average age of records (should be < 24h for most)
- Delete success rate

---

**End of Feature PRD 4**

