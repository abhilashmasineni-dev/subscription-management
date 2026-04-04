# FLOW PRD 3: Expiration & Restoration Flow

**Document Version**: 1.0  
**Status**: Ready for Implementation  
**Related Feature PRDs**: PRD 3 (Real-time), PRD 4 (Automation)

---

## 1. FLOW OVERVIEW

**Flow Name**: Expiration & Restoration  
**Actors**: System (Cron), User, Real-time listeners  
**Purpose**: Automatic expiration of subscriptions, user restoration within 24 hours

---

## 2. MAIN FLOW

```
START: Subscription approaching expiration

STEP 1: T-1 Minute Check
├─ Current time: 2026-05-01 17:29:00
├─ Netflix expiration: 2026-05-01 17:30:00
├─ Check runs (every 30 seconds)
└─ Detects Netflix < 1 minute away

STEP 2: Toast Alert Appears
├─ Toast notification shows:
│  - "Your Netflix subscription expires in less than 1 minute!"
│  - Warning icon (yellow)
│  - Position: Top-right corner
│  - Duration: Exactly 1 minute (auto-dismiss or manual close)
└─ User sees alert

STEP 3: Time Passes to Expiration
├─ Current time: 2026-05-01 17:30:00
├─ Netflix expiration reached
└─ Toast auto-dismisses

STEP 4: Auto-Move Triggered (Cron)
├─ Cron job /api/cron/move-expired runs (every minute)
├─ Queries: active_subscriptions WHERE expiration_date <= NOW()
├─ Finds Netflix
├─ BEGIN TRANSACTION
├─ Insert into expired_subscriptions:
│  - original_subscription_id: Netflix.id
│  - status: 'expired'
│  - expired_at: NOW()
│  - can_restore_until: NOW() + 24 hours
├─ Delete from active_subscriptions (Netflix)
├─ COMMIT TRANSACTION
└─ Real-time notification broadcast

STEP 5: Real-Time Update Received
├─ All subscribed clients receive UPDATE event
├─ Current user's dashboard detects move
├─ Netflix card removed from Active tab
├─ Netflix card added to Expired tab with badge
└─ User sees change within 1 second (if viewing)

STEP 6: Dashboard Reflects Expiration
├─ Active tab: Netflix gone
├─ Expired tab: Netflix visible
├─ Badge: "Expired on May 1, 2026 5:30 PM"
├─ Status: "Can restore within 24 hours"
├─ Three-dot menu: Restore, Delete
├─ Restore button: ENABLED (within 24h)
└─ Total monthly spending: -$15.99 (removed from active total)

STEP 7: User Clicks Restore
├─ User goes to Expired tab
├─ Clicks "Restore" button on Netflix card
├─ Restoration form modal opens
├─ Form shows:
│  - Name: Netflix (readonly/info)
│  - Original expiration: May 1, 2026
│  - NEW Expiration Date field: [blank, required]
│  - NEW Expiration Time field: [blank, required]
│  - Cancel / Restore buttons
└─ User must enter new expiration date

STEP 8: User Enters New Expiration
├─ User enters: Date = "2026-06-01", Time = "10:00 AM"
├─ Form validates:
│  - New date >= today ✓
│  - Date format valid ✓
│  - All required fields ✓
├─ Form is valid
└─ User clicks "Restore"

STEP 9: Confirm Restore
├─ Confirmation dialog: "Restore Netflix with expiration June 1, 2026?"
├─ User clicks "Confirm"
├─ Request sent: POST /api/subscriptions/restore/:id
│  - Body: { new_expiration_date: "2026-06-01T10:00:00Z" }
└─ Request in flight

STEP 10: Backend Processes Restoration
├─ Vercel receives request
├─ Validates user_id (from session)
├─ Checks restoration is within 24h window
│  - can_restore_until > NOW() ✓
├─ BEGIN TRANSACTION
├─ Insert into active_subscriptions:
│  - user_id, name, link, cost, currency: original
│  - expiration_date: user-provided (2026-06-01 10:00)
│  - status: 'active'
│  - created_at: original (preserved)
│  - updated_at: NOW()
├─ Update expired_subscriptions:
│  - status: 'restored'
│  - restored_at: NOW()
├─ COMMIT TRANSACTION
└─ Real-time notification broadcast

STEP 11: Real-Time Update
├─ All subscribed clients receive notification
├─ Netflix moves from Expired → Active
└─ Dashboard updates in real-time on all tabs

STEP 12: Dashboard Shows Restored
├─ Expired tab: Netflix removed
├─ Active tab: Netflix reappears with new date
├─ Card shows: "Netflix, expires June 1, 2026 10:00 AM"
├─ Cost: $15.99
├─ Three-dot menu: Edit, Disable, Delete
├─ Total monthly spending: +$15.99 (back in active)
└─ Sorted by new expiration date

STEP 13: Restoration Complete
├─ Subscription is active again
├─ New expiration date is May 1, 2026 10:00 AM
├─ Audit trail: Both active_subscriptions and expired_subscriptions have records
└─ Success toast: "Netflix restored"

END: Subscription restored and active again
```

---

## 3. RESTORATION WINDOW EDGE CASE

```
SCENARIO: User tries to restore after 24h window expires

STEP A: 25 hours have passed since expiration
├─ expired_at: 2026-05-01 17:30
├─ can_restore_until: 2026-05-02 17:30 (NOW() - 1 hour)
├─ Current time: 2026-05-02 18:31
└─ Window expired

STEP B: User clicks Restore
├─ Restore button is DISABLED (grayed out)
├─ Tooltip: "Can't restore (expired more than 24 hours ago)"
├─ Button click has no effect
└─ No modal opens

STEP C: Cron Deletes Old Record
├─ Cron job /api/cron/delete-old-records runs (hourly)
├─ Queries expired_subscriptions WHERE can_restore_until <= NOW()
├─ Finds Netflix (can_restore_until = 2026-05-02 17:30)
├─ PERMANENTLY DELETES Netflix from expired_subscriptions
└─ Netflix is gone forever (not recoverable)

STEP D: Dashboard Updates
├─ If user viewing Expired tab: Netflix card disappears
├─ Real-time notifies user
└─ Subscription is completely deleted
```

---

## 4. TESTING CHECKLIST

- [ ] T-1 minute alert appears 1 minute before expiration
- [ ] Toast auto-dismisses after 1 minute
- [ ] Cron moves subscription at exact expiration time
- [ ] Real-time updates all open tabs
- [ ] Restore form appears and accepts new date
- [ ] Restoration succeeds within 24h window
- [ ] Restore button disabled after 24h
- [ ] Auto-delete removes old records
- [ ] No duplicates after cron runs twice
- [ ] Audit trail preserved (both tables have records)

---

---

# FLOW PRD 4: Soft Delete & Recovery Flow

**Document Version**: 1.0  
**Status**: Ready for Implementation  
**Related Feature PRDs**: PRD 2 (CRUD), PRD 4 (Automation)

---

## 1. FLOW OVERVIEW

**Flow Name**: Soft Delete & Recovery  
**Actors**: User, Backend, Real-time  
**Purpose**: User-initiated soft delete with 24-hour recovery window, auto-permanent delete

---

## 2. MAIN FLOW

```
START: User wants to delete a subscription

STEP 1: User Clicks Delete
├─ User on Active tab with Netflix card visible
├─ User clicks three-dot menu on Netflix
├─ Menu shows: Edit, Disable, Delete
├─ User clicks "Delete"
└─ Confirmation dialog appears

STEP 2: Confirm Deletion
├─ Dialog: "Are you sure you want to delete Netflix?"
├─ Sub-text: "You can recover it within 24 hours"
├─ Options: "Delete" (red) or "Cancel" (gray)
├─ User clicks "Delete" to confirm
└─ Request sent: DELETE /api/subscriptions/:id

STEP 3: Backend Soft Deletes
├─ Vercel receives request
├─ Validates user_id
├─ Checks user owns subscription (RLS)
├─ BEGIN TRANSACTION
├─ Copy Netflix to deleted_subscriptions:
│  - All fields copied
│  - deleted_at: NOW()
│  - can_restore_until: NOW() + 24 hours
├─ Delete Netflix from active_subscriptions
├─ COMMIT TRANSACTION
└─ Real-time notification broadcast

STEP 4: Real-Time Update
├─ Notification sent to all tabs
├─ Netflix removed from Active tab
├─ Netflix added to Deleted tab
└─ Dashboard updates in real-time

STEP 5: Dashboard Shows Deleted
├─ Active tab: Netflix gone, total spending updated
├─ Deleted tab: Netflix visible with:
│  - "Deleted on May 1, 2026 at 10:00 AM"
│  - Status: "Can recover within 24 hours"
│  - Restore button: ENABLED
│  - Delete Permanently button (optional)
├─ Total monthly spending: -$15.99 (removed from active)
└─ Success toast: "Netflix deleted (can recover within 24h)"

STEP 6: User Views Deleted Subscriptions
├─ User clicks "Deleted Subscriptions" tab
├─ Netflix card visible
├─ Shows original details (name, cost, dates)
├─ Badge: "Deleted on [date]"
├─ Time remaining: "Can recover in 23 hours 45 minutes"
└─ Three-dot menu: Restore, Delete Permanently

STEP 7: User Changes Mind, Restores
├─ User clicks "Restore" button on Netflix
├─ Optional confirmation: "Restore Netflix?"
├─ User confirms
└─ Request sent: POST /api/subscriptions/restore/:id (from deleted)

STEP 8: Backend Restores from Deletion
├─ Vercel receives request
├─ Checks can_restore_until > NOW() ✓ (within 24h)
├─ BEGIN TRANSACTION
├─ Re-insert into active_subscriptions:
│  - All original data
│  - status: back to original (was 'active' or 'disabled')
│  - created_at: original (preserved)
│  - updated_at: NOW()
├─ Keep record in deleted_subscriptions (audit trail)
├─ COMMIT TRANSACTION
└─ Real-time notification broadcast

STEP 9: Real-Time Update
├─ Netflix moves from Deleted → Active (or Disabled)
├─ All tabs notified
└─ Dashboard updates instantly

STEP 10: Dashboard Shows Restored
├─ Deleted tab: Netflix removed
├─ Active tab: Netflix reappears
├─ If it was disabled before delete: Returns as disabled
├─ Card shows original details
├─ Total monthly spending: +$15.99
└─ Success toast: "Netflix restored"

STEP 11: Alternative - Auto-Delete After 24h
├─ User doesn't restore Netflix
├─ 24 hours pass after deletion
├─ Cron job /api/cron/delete-old-records runs (hourly)
├─ Queries deleted_subscriptions WHERE can_restore_until <= NOW()
├─ Finds Netflix
├─ PERMANENTLY DELETES Netflix from deleted_subscriptions
├─ Netflix is completely gone (no recovery possible)
└─ If user viewing Deleted tab: Card disappears via real-time

STEP 12: Final State
├─ Netflix has two records:
│  - active_subscriptions: DELETED (after soft delete)
│  - deleted_subscriptions: DELETED (after 24h auto-delete)
└─ No trace of Netflix remains in active database
```

---

## 3. EDGE CASES

### Case 1: Restore After 24h Window Expires
```
SCENARIO: User tries to restore 25 hours after deletion

BEFORE:
- can_restore_until: 2026-05-02 10:00
- Current time: 2026-05-02 11:01 (past window)

DURING:
- Restore button is DISABLED
- Tooltip: "Can't restore (>24 hours ago)"
- Button click has no effect

AFTER CRON RUNS:
- Netflix permanently deleted from deleted_subscriptions
- Gone forever, cannot be recovered
```

### Case 2: Delete Disabled Subscription
```
FLOW:
1. Hulu is disabled (status='disabled')
2. User deletes Hulu from Disabled tab
3. Moved to deleted_subscriptions
4. User restores within 24h
5. Hulu restored to active_subscriptions
6. Status: 'disabled' (or 'active', design choice)

CHOICE: Returns as 'active' (cleaner UX)
```

### Case 3: Multiple Deletes
```
SCENARIO: User deletes Netflix, then Spotify in quick succession

DELETION 1 (Netflix):
- deleted_at: 2026-05-01 10:00:00
- can_restore_until: 2026-05-02 10:00:00

DELETION 2 (Spotify):
- deleted_at: 2026-05-01 10:02:00
- can_restore_until: 2026-05-02 10:02:00

CRON RUNS AT 2026-05-02 10:01:00:
- Finds Netflix (can_restore_until = 10:00, expired)
- Deletes Netflix
- Spotify still there (can_restore_until = 10:02, not yet)

CRON RUNS AT 2026-05-02 10:03:00:
- Finds Spotify (can_restore_until = 10:02, expired)
- Deletes Spotify
- Both now permanently gone
```

---

## 4. TESTING CHECKLIST

- [ ] User deletes subscription, moves to Deleted tab
- [ ] Deleted tab shows deletion timestamp
- [ ] Total monthly spending updates correctly
- [ ] Restore button works within 24h window
- [ ] Restore button disabled after 24h
- [ ] Restored subscription returns to Active tab
- [ ] Audit trail preserved (both tables have records)
- [ ] Cron permanently deletes after 24h
- [ ] Multiple deletes handled correctly
- [ ] Real-time sync works for deletion and restoration
- [ ] Form shows confirmation before delete

---

## 5. DATA FLOW DIAGRAM

```
User Deletes → active_subscriptions
    │              ↓ (delete row)
    │
    ├→ deleted_subscriptions
    │  ├─ deleted_at: NOW()
    │  ├─ can_restore_until: NOW() + 24h
    │  └─ [other fields copied]
    │
    ├→ [24 hours pass]
    │  
    ├→ Cron /api/cron/delete-old-records
    │
    └→ deleted_subscriptions
       └─ PERMANENTLY DELETED
          (no recovery possible)
```

---

**End of Flow PRD 3 & 4**

