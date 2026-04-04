# FEATURE PRD 2: Subscription CRUD & Dashboard UI

**Document Version**: 1.0  
**Last Updated**: April 4, 2026  
**Status**: Ready for Development  
**Priority**: P0 (Critical - Core Feature)

---

## 1. FEATURE OVERVIEW

### Feature Name
**Subscription CRUD & Dashboard UI**

### What This Feature Does
This is the core feature users interact with daily. It allows creating, viewing, editing, disabling, and soft-deleting subscriptions. The dashboard displays all subscriptions as cards organized in 4 tabs (Active, Disabled, Expired, Deleted) with sorting, filtering, and total monthly spending calculation.

### Why It Matters
- **Core Value**: Users can finally track all their subscriptions in one place
- **UX**: Clean, intuitive dashboard with cards and tabs
- **Soft Delete**: Users can recover deleted items within 24 hours
- **DBMS Concept**: Demonstrates CRUD operations, soft delete pattern, and data lifecycle

### Dependencies
- **Requires**: PRD 1 (Authentication) - need user_id for all operations
- **Blocks**: PRD 3 (Real-time) - real-time listens to subscription changes

### Estimated Complexity
- **Complexity Level**: High (most user-facing features)
- **Reason**: Multiple forms, dashboard tabs, sorting logic, soft delete pattern
- **Development Time**: 4-5 days

---

## 2. USER STORIES WITH ACCEPTANCE CRITERIA

### Story 1: Add New Subscription

**As a** user  
**I want to** add a new subscription to my tracker  
**So that** I can keep track of all my recurring payments

#### Acceptance Criteria

```gherkin
Scenario 1.1: Successful Subscription Creation
Given: I'm on the dashboard (logged in)
When: I click "+ Add Subscription" button
Then: A form modal opens with fields:
  - Subscription Name (required, text)
  - Website Link (optional, URL)
  - Start Date (required, date picker)
  - Expiration Date (required, date/time picker)
  - Cost (required, decimal number)
  - Currency (dropdown, default USD)
And: I fill in all fields:
  - Name: "Netflix"
  - Link: "netflix.com"
  - Start: "2026-03-01"
  - Expiration: "2026-05-01 17:30"
  - Cost: 12.99
  - Currency: USD
And: I click "Add Subscription" button
Then: Form is submitted via POST /api/subscriptions
And: Subscription is inserted into active_subscriptions table
And: Success toast appears: "Netflix added successfully"
And: Modal closes
And: Netflix card appears on dashboard (Active tab)
And: Card shows: Netflix, expires May 1 5:30 PM, $12.99/month
And: Three-dot menu visible on card (Edit, Disable, Delete)
And: Total monthly spending updates to include Netflix

Scenario 1.2: Date Validation - Expiration Before Start
Given: Add Subscription form is open
When: I set Start: "2026-05-01" and Expiration: "2026-03-01"
Then: Error message shows "Expiration date must be after start date"
And: Form remains open
And: "Add" button disabled until fixed

Scenario 1.3: Invalid Cost
Given: Add Subscription form is open
When: I enter Cost: "-5.99" (negative)
Then: Error message shows "Cost must be greater than 0"
And: Form remains open

Scenario 1.4: Empty Required Field
Given: Add Subscription form is open
When: I leave "Subscription Name" empty
And: I click "Add Subscription"
Then: Error message shows "Subscription name is required"
And: Form remains open
And: Focus moves to Name field

Scenario 1.5: Duplicate Subscription
Given: Netflix subscription already exists in my active subscriptions
When: I try to add another subscription with name "Netflix"
Then: Error message shows "You already have a subscription named 'Netflix'"
And: Form remains open
And: Can use different name

Scenario 1.6: Network Error During Add
Given: Form filled with valid data
When: I click "Add Subscription" and network drops
Then: Error message shows "Network error. Please check connection and try again"
And: Form remains open
And: Can retry or cancel

Scenario 1.7: Invalid URL
Given: Add Subscription form is open
When: I enter Link: "not a valid url"
Then: Error message shows "Please enter a valid URL"
And: Form remains open
```

---

### Story 2: View Subscriptions

**As a** user  
**I want to** see all my subscriptions in one dashboard  
**So that** I can quickly see my current subscriptions and upcoming renewals

#### Acceptance Criteria

```gherkin
Scenario 2.1: Dashboard Loads with Active Subscriptions
Given: I'm logged in and have 5 active subscriptions
When: I navigate to dashboard (/)
Then: Page loads in <2 seconds
And: Active Subscriptions tab is selected by default
And: All 5 subscriptions appear as cards
And: Cards are sorted by expiration date (earliest first)
And: Each card displays:
  - Subscription name (e.g., "Netflix")
  - Website link (clickable, opens in new tab)
  - Expiration date/time (e.g., "May 1, 2026 5:30 PM")
  - Cost (e.g., "$12.99/month")
  - Three-dot menu button

Scenario 2.2: Empty Active Subscriptions
Given: I'm logged in with no subscriptions
When: I navigate to dashboard
Then: Active tab shows empty state
And: Message displays: "Add a new subscription to get started"
And: "+ Add Subscription" button visible
And: No cards displayed

Scenario 2.3: Switch to Disabled Tab
Given: Dashboard is showing Active subscriptions
And: I have 2 disabled subscriptions
When: I click on "Disabled Subscriptions" tab
Then: Tab switches to Disabled
And: 2 disabled subscriptions appear as grayed-out cards
And: Cards appear at bottom of list (below active if mixed view)
And: "No disabled subscriptions" message if tab is empty

Scenario 2.4: Switch to Expired Tab
Given: Dashboard is showing Active subscriptions
And: I have 3 expired subscriptions
When: I click on "Expired Subscriptions" tab
Then: Tab switches to Expired
And: 3 expired subscriptions appear
And: Each card shows "Expired on [date]"
And: Restore button visible if within 24 hours
And: "Can't restore (expired >24h ago)" if outside window

Scenario 2.5: Switch to Deleted Tab
Given: Dashboard is showing Active subscriptions
And: I have 2 deleted subscriptions
When: I click on "Deleted Subscriptions" tab
Then: Tab switches to Deleted
And: 2 deleted subscriptions appear
And: Each card shows "Deleted on [date]"
And: Restore button visible if within 24 hours
And: "Can't restore (>24h)" if outside window

Scenario 2.6: Total Monthly Spending
Given: Dashboard is showing subscriptions:
  - Netflix: $12.99
  - Spotify: $9.99
  - Adobe: $20.00
  - Disabled Hulu: $10.99
When: I look at dashboard header
Then: "Total Monthly Spending" shows "$42.98" (active only, not disabled)
And: Calculation excludes disabled subscriptions

Scenario 2.7: Sorting by Expiration Date
Given: Dashboard is showing Active subscriptions
And: Subscriptions expire on: May 1, Apr 15, May 20
When: Subscriptions are sorted
Then: Order is: Apr 15, May 1, May 20 (ascending by default)
And: I can click sort button to reverse to descending

Scenario 2.8: Sorting by Cost
Given: Dashboard is showing Active subscriptions
And: Costs are: $20, $9.99, $12.99
When: I click "Sort by: Cost"
Then: Order becomes: $9.99, $12.99, $20 (ascending)
And: I can reverse to descending
```

---

### Story 3: Edit Subscription

**As a** user  
**I want to** update a subscription's details  
**So that** I can fix mistakes or adjust renewal dates

#### Acceptance Criteria

```gherkin
Scenario 3.1: Successful Edit
Given: Netflix subscription exists with details:
  - Name: Netflix
  - Cost: $12.99
  - Expiration: May 1, 2026
When: I click three-dot menu on Netflix card
Then: Menu shows: Edit, Disable, Delete
When: I click "Edit"
Then: Edit form modal opens
And: All fields are pre-filled:
  - Name: Netflix
  - Cost: $12.99
  - Expiration: May 1, 2026 00:00
  - All other fields
And: I change Cost to $15.99
And: I click "Update Subscription"
Then: PUT /api/subscriptions/:id is called
And: Database updates cost to $15.99
And: Success toast: "Netflix updated successfully"
And: Modal closes
And: Card on dashboard shows new cost: $15.99
And: Total spending updated

Scenario 3.2: Edit Expiration Date
Given: Netflix subscription with expiration "May 1, 2026 5:30 PM"
When: I click Edit
Then: Date/time fields show current values
When: I change to "June 15, 2026 9:00 AM"
And: I click "Update"
Then: Subscription updated
And: Dashboard card shows new date

Scenario 3.3: Edit Multiple Fields
Given: Edit form is open
When: I change:
  - Name: Netflix → Netflix Premium
  - Cost: 12.99 → 15.99
  - Expiration: May 1 → June 1
And: I click "Update"
Then: All fields updated in database
And: Dashboard reflects all changes
And: Toast confirms update

Scenario 3.4: Invalid Data in Edit
Given: Edit form is open with Netflix data
When: I change cost to "-5.99"
And: I click "Update"
Then: Error: "Cost must be > 0"
And: Form remains open
And: No changes saved

Scenario 3.5: Network Error During Edit
Given: Edit form filled with new data
When: I click "Update" and network drops
Then: Error: "Network error..."
And: Form remains open
And: Can retry

Scenario 3.6: Edit Disabled Subscription
Given: Hulu is disabled
When: I click Edit on Hulu card
Then: Edit form opens with Hulu data
When: I update details and click "Update"
Then: Subscription updated
And: Remains in disabled state (status unchanged)
And: Card returns to disabled section
```

---

### Story 4: Delete Subscription (Soft Delete)

**As a** user  
**I want to** delete a subscription with 24-hour recovery  
**So that** I can remove unwanted subscriptions but recover if accidental

#### Acceptance Criteria

```gherkin
Scenario 4.1: Successful Soft Delete
Given: Netflix subscription exists
When: I click three-dot menu on Netflix card
And: I click "Delete"
Then: Confirmation dialog appears:
  "Are you sure you want to delete Netflix? You can recover it within 24 hours."
When: I click "Delete" to confirm
Then: Subscription is moved to deleted_subscriptions table
And: Success toast: "Netflix deleted (can recover within 24h)"
And: Card disappears from dashboard
And: Netflix appears in "Deleted" tab with "Restore" button
And: original_subscription_id stored for restoration

Scenario 4.2: Cancel Delete
Given: Delete confirmation dialog is open
When: I click "Cancel"
Then: Dialog closes
And: Subscription remains on dashboard
And: No changes to database

Scenario 4.3: Recover Deleted Within 24h
Given: Netflix was deleted 2 hours ago
When: I navigate to "Deleted Subscriptions" tab
Then: Netflix card appears with:
  - "Deleted on [date/time]"
  - "Restore" button (enabled)
  - Restore within 2 hours message
When: I click "Restore"
Then: Confirmation: "Restore Netflix to active subscriptions?"
When: I click "Confirm"
Then: Subscription moved back to active_subscriptions
And: Status set to original (was 'active' or 'disabled')
And: Success toast: "Netflix restored"
And: Card appears in appropriate tab (Active or Disabled)

Scenario 4.4: Cannot Recover After 24h
Given: Netflix was deleted 25 hours ago
When: I go to Deleted Subscriptions tab
Then: Netflix card shows:
  - "Can't restore (expired 1 hour ago)"
  - "Restore" button is DISABLED
And: Subscription will be auto-deleted soon

Scenario 4.5: Auto-Delete After 24h
Given: Netflix deleted >24 hours ago
When: Cron job /api/cron/delete-old-records runs
Then: Netflix is PERMANENTLY deleted from deleted_subscriptions
And: Cannot be recovered
And: Disappears from Deleted tab

Scenario 4.6: Network Error During Delete
Given: Delete confirmation showing
When: I click "Delete" and network drops
Then: Error: "Network error..."
And: Dialog closes
And: Subscription still on dashboard (not deleted)
And: Can retry

Scenario 4.7: Delete Disabled Subscription
Given: Hulu is disabled
When: I delete Hulu (same process)
Then: Hulu moved to deleted_subscriptions
And: Status='disabled' is preserved
And: Can restore and it returns as disabled (grayed out)
```

---

### Story 5: Disable Subscription

**As a** user  
**I want to** temporarily pause a subscription without deleting it  
**So that** I can keep the record but remove it from my active list

#### Acceptance Criteria

```gherkin
Scenario 5.1: Successful Disable
Given: Netflix subscription is active
When: I click three-dot menu on Netflix card
And: I click "Disable"
Then: Confirmation dialog appears:
  "Are you sure you want to disable Netflix?"
When: I click "Disable" to confirm
Then: Status updated to 'disabled' in database
And: Success toast: "Netflix disabled"
And: Netflix card moves to Disabled tab
And: Card appears grayed out (opacity 50-60%)
And: Card text lighter/muted color
And: Card shows "Disabled" badge

Scenario 5.2: Disabled Subscription Appearance
Given: Netflix is disabled (in Disabled tab)
When: I view the dashboard
Then: Netflix card appears:
  - Grayed out / low opacity
  - Text color muted
  - Optional strikethrough on name
  - Badge: "Disabled" or grayed styling makes it obvious

Scenario 5.3: Cancel Disable
Given: Disable confirmation dialog is open
When: I click "Cancel"
Then: Dialog closes
And: Subscription remains active
And: No changes to database

Scenario 5.4: Disable Already Disabled
Given: Hulu is already disabled
When: I look at Hulu card in Disabled tab
Then: Three-dot menu shows: Edit, Re-enable, Delete
And: No "Disable" option (already disabled)

Scenario 5.5: Network Error During Disable
Given: Disable confirmation showing
When: I click "Disable" and network drops
Then: Error: "Network error..."
And: Dialog closes
And: Subscription still active (not disabled)
And: Can retry
```

---

### Story 6: Re-enable Subscription

**As a** user  
**I want to** re-enable a disabled subscription  
**So that** it appears in my active list again

#### Acceptance Criteria

```gherkin
Scenario 6.1: Successful Re-enable
Given: Netflix is disabled (in Disabled tab)
When: I click three-dot menu on Netflix card
Then: Menu shows: Edit, Re-enable, Delete
When: I click "Re-enable"
Then: Optional confirmation: "Reactivate Netflix?"
When: I confirm
Then: Status updated to 'active' in database
And: Success toast: "Netflix reactivated"
And: Card disappears from Disabled tab
And: Card appears in Active tab
And: Card styling returns to normal (not grayed out)
And: Sorted alphabetically or by expiration date

Scenario 6.2: Re-enable Disabled with Upcoming Expiry
Given: Hulu disabled, expires in 5 days
When: I re-enable Hulu
Then: Hulu appears in Active tab
And: Shows expiration in 5 days
And: Can be edited, disabled, or deleted again
```

---

### Story 7: Dashboard Organization & Sorting

**As a** user  
**I want to** organize my subscriptions by various criteria  
**So that** I can quickly find and manage specific subscriptions

#### Acceptance Criteria

```gherkin
Scenario 7.1: Sort by Expiration Date (Default)
Given: Dashboard is showing Active subscriptions:
  - Spotify: expires May 10
  - Netflix: expires April 20
  - Apple: expires May 5
When: Page loads
Then: Default sort order is by expiration date (ascending)
And: Order shows: Netflix (Apr 20), Apple (May 5), Spotify (May 10)
And: "Nearest to expire" appears first

Scenario 7.2: Sort Descending
Given: Subscriptions sorted ascending by expiration
When: I click sort dropdown and select "Descending"
Then: Order reverses: Spotify, Apple, Netflix
And: Farthest from expiring now first

Scenario 7.3: Sort by Cost
Given: Dashboard is showing Active subscriptions
When: I click sort dropdown and select "Cost: Low to High"
Then: Subscriptions sorted by cost ascending:
  - Spotify: $9.99
  - Netflix: $12.99
  - Apple: $15.99
When: I select "Cost: High to Low"
Then: Order reverses

Scenario 7.4: Sort by Name
Given: Dashboard is showing Active subscriptions:
  - Netflix, Spotify, Apple
When: I click sort dropdown and select "Name: A-Z"
Then: Order: Apple, Netflix, Spotify
When: I select "Name: Z-A"
Then: Order: Spotify, Netflix, Apple

Scenario 7.5: Disabled Always at Bottom (Mixed View if applicable)
Given: Dashboard shows active and disabled together (future feature)
When: Sorting is applied
Then: Active subscriptions sorted by selected field
And: Disabled subscriptions below, also sorted
And: Disabled never mixed with active

Scenario 7.6: Sort Persistence
Given: I set sort to "Cost: High to Low"
When: I add a new subscription
Then: Dashboard remains sorted by Cost: High to Low
And: New subscription appears in correct position
And: Sort preference persists across page refresh (optional: localStorage)
```

---

### Story 8: Three-Dot Menu (Context Menu)

**As a** user  
**I want to** access subscription actions from a menu  
**So that** the dashboard stays clean and uncluttered

#### Acceptance Criteria

```gherkin
Scenario 8.1: Menu on Active Subscription Card
Given: Netflix card is active
When: I hover over or click three-dot menu icon
Then: Menu appears with options:
  - Edit (pencil icon)
  - Disable (pause icon)
  - Delete (trash icon)

Scenario 8.2: Menu on Disabled Subscription Card
Given: Hulu card is disabled
When: I click three-dot menu
Then: Menu appears with options:
  - Edit (pencil icon)
  - Re-enable (play icon)
  - Delete (trash icon)
Note: No "Disable" option (already disabled)

Scenario 8.3: Menu on Expired Subscription Card
Given: Netflix card is expired
When: I click three-dot menu
Then: Menu appears with options:
  - Restore (if within 24h) - arrow icon
  - Delete (trash icon)
Note: Edit option not available for expired

Scenario 8.4: Menu on Deleted Subscription Card
Given: Hulu card is deleted
When: I click three-dot menu
Then: Menu appears with options:
  - Restore (if within 24h) - arrow icon
  - Delete Permanently (trash icon, if >24h)

Scenario 8.5: Menu Closes on Outside Click
Given: Menu is open
When: I click anywhere outside menu
Then: Menu closes
And: No action triggered

Scenario 8.6: Menu on Mobile
Given: Dashboard on mobile device (viewport <768px)
When: I tap three-dot menu
Then: Menu appears (may be positioned differently for smaller screen)
And: Menu doesn't go off-screen
```

---

## 3. DATABASE SCHEMA

### Table: `active_subscriptions`

```sql
CREATE TABLE IF NOT EXISTS active_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_name VARCHAR(255) NOT NULL,
  website_link VARCHAR(255),
  start_date DATE NOT NULL,
  expiration_date TIMESTAMP NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT expiration_after_start CHECK (expiration_date >= start_date),
  CONSTRAINT positive_cost CHECK (cost > 0),
  CONSTRAINT unique_name_per_user UNIQUE (user_id, subscription_name)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_active_subscriptions_user_id ON active_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_subscriptions_user_status_expiry 
  ON active_subscriptions(user_id, status, expiration_date);
CREATE INDEX IF NOT EXISTS idx_active_subscriptions_expiration 
  ON active_subscriptions(expiration_date);
CREATE INDEX IF NOT EXISTS idx_active_subscriptions_cost 
  ON active_subscriptions(cost);
```

### Table: `deleted_subscriptions` (Soft Delete)

```sql
CREATE TABLE IF NOT EXISTS deleted_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_subscription_id UUID REFERENCES active_subscriptions(id),
  subscription_name VARCHAR(255),
  website_link VARCHAR(255),
  start_date DATE,
  expiration_date TIMESTAMP,
  cost DECIMAL(10, 2),
  currency VARCHAR(3),
  deleted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  can_restore_until TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_restore_window CHECK (can_restore_until > deleted_at)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_deleted_subscriptions_user_id ON deleted_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_deleted_subscriptions_user_deleted 
  ON deleted_subscriptions(user_id, deleted_at);
CREATE INDEX IF NOT EXISTS idx_deleted_subscriptions_restore 
  ON deleted_subscriptions(user_id, can_restore_until);
```

### RLS Policies

```sql
-- Enable RLS
ALTER TABLE active_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deleted_subscriptions ENABLE ROW LEVEL SECURITY;

-- active_subscriptions policies
CREATE POLICY "Users can view own active subscriptions"
  ON active_subscriptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own subscriptions"
  ON active_subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own subscriptions"
  ON active_subscriptions FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own subscriptions"
  ON active_subscriptions FOR DELETE
  USING (user_id = auth.uid());

-- deleted_subscriptions policies (read-only after deletion)
CREATE POLICY "Users can view own deleted subscriptions"
  ON deleted_subscriptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert to deleted subscriptions (system only)"
  ON deleted_subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update deleted subscriptions (for restoration)"
  ON deleted_subscriptions FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

---

## 4. API ENDPOINTS

### Endpoint 1: POST /api/subscriptions

**Purpose**: Create a new subscription

**Request**:
```json
{
  "subscription_name": "Netflix",
  "website_link": "https://netflix.com",
  "start_date": "2026-03-01",
  "expiration_date": "2026-05-01T17:30:00Z",
  "cost": 12.99,
  "currency": "USD"
}
```

**Response (Success - 201)**:
```json
{
  "success": true,
  "message": "Subscription created",
  "subscription": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "...",
    "subscription_name": "Netflix",
    "website_link": "https://netflix.com",
    "start_date": "2026-03-01",
    "expiration_date": "2026-05-01T17:30:00Z",
    "cost": 12.99,
    "currency": "USD",
    "status": "active",
    "created_at": "2026-04-04T10:00:00Z"
  }
}
```

**Errors**:

| Status | Error | Reason |
|--------|-------|--------|
| 400 | `invalid_request` | Missing required fields |
| 400 | `invalid_dates` | Expiration before start date |
| 400 | `invalid_cost` | Cost ≤ 0 |
| 409 | `duplicate_name` | User already has subscription with this name |
| 401 | `unauthorized` | Not logged in |
| 500 | `server_error` | Database error |

---

### Endpoint 2: GET /api/subscriptions

**Purpose**: Get all subscriptions for logged-in user

**Query Parameters**:
```
?tab=active|disabled|expired|deleted
?sort_by=expiration|cost|name
?sort_order=asc|desc
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "subscriptions": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "subscription_name": "Netflix",
      "website_link": "https://netflix.com",
      "expiration_date": "2026-05-01T17:30:00Z",
      "cost": 12.99,
      "currency": "USD",
      "status": "active"
    }
  ],
  "total_monthly_spending": 42.98,
  "count": 5
}
```

---

### Endpoint 3: PUT /api/subscriptions/:id

**Purpose**: Update a subscription

**Request**:
```json
{
  "subscription_name": "Netflix Premium",
  "cost": 15.99,
  "expiration_date": "2026-06-01T17:30:00Z"
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Subscription updated",
  "subscription": { ... }
}
```

**Errors**:

| Status | Error | Reason |
|--------|-------|--------|
| 400 | `invalid_data` | Invalid field values |
| 401 | `unauthorized` | Not logged in |
| 403 | `forbidden` | Not owner of subscription |
| 404 | `not_found` | Subscription doesn't exist |
| 500 | `server_error` | Database error |

---

### Endpoint 4: DELETE /api/subscriptions/:id

**Purpose**: Soft-delete a subscription (move to deleted_subscriptions)

**Request**:
```json
{
  "confirm": true
}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Subscription deleted (can restore within 24h)"
}
```

---

### Endpoint 5: PUT /api/subscriptions/:id/disable

**Purpose**: Disable a subscription (set status='disabled')

**Request**:
```json
{}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Subscription disabled"
}
```

---

### Endpoint 6: PUT /api/subscriptions/:id/enable

**Purpose**: Re-enable a subscription (set status='active')

**Request**:
```json
{}
```

**Response (Success - 200)**:
```json
{
  "success": true,
  "message": "Subscription reactivated"
}
```

---

## 5. FRONTEND COMPONENTS & UI

### Component 1: Dashboard Page

**Location**: `/pages/dashboard.tsx`

**Features**:
- 4 tabs: Active, Disabled, Expired, Deleted
- Sorting dropdown
- Filter options (future)
- Total monthly spending header
- Subscription cards list

---

### Component 2: SubscriptionCard

**Location**: `/components/SubscriptionCard.tsx`

**Props**:
```typescript
interface SubscriptionCardProps {
  subscription: Subscription;
  status: 'active' | 'disabled' | 'expired' | 'deleted';
  onEdit: (id: string) => void;
  onDisable: (id: string) => void;
  onEnable: (id: string) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
}
```

**Features**:
- Card layout with subscription details
- Website link (clickable, opens in new tab)
- Expiration date/time
- Cost
- Three-dot menu button
- Status badge (for disabled/expired/deleted)
- Hover effects

---

### Component 3: AddSubscriptionForm

**Location**: `/components/SubscriptionForm.tsx` (shared with edit)

**Features**:
- Form fields: Name, Link, Start Date, Expiration Date+Time, Cost, Currency
- Validation feedback
- Submit button
- Cancel button
- Loading spinner
- Error messages
- Pre-filled for edit mode

---

### Component 4: ThreeDotMenu

**Location**: `/components/ThreeDotMenu.tsx`

**Props**:
```typescript
interface ThreeDotMenuProps {
  subscriptionId: string;
  status: 'active' | 'disabled' | 'expired' | 'deleted';
  canRestore: boolean;  // If within 24h window
  onEdit: () => void;
  onDisable?: () => void;
  onEnable?: () => void;
  onDelete: () => void;
  onRestore?: () => void;
}
```

---

### Component 5: ConfirmationDialog

**Location**: `/components/ConfirmationDialog.tsx`

**Usage**:
```typescript
<ConfirmationDialog
  title="Delete Netflix?"
  message="You can recover it within 24 hours"
  onConfirm={() => deleteSubscription(id)}
  onCancel={() => closeDialog()}
  confirmText="Delete"
  cancelText="Cancel"
/>
```

---

## 6. EDGE CASES & ERROR HANDLING

### Validation Errors

#### Invalid Cost
```
Condition: User enters cost "-5.99"
Expected: "Cost must be greater than 0"
Implementation: 
  - Client: Validate before submit
  - Server: Check cost > 0 constraint
```

#### Dates Not in Order
```
Condition: Start: 2026-05-01, Expiration: 2026-04-01
Expected: "Expiration must be after start date"
Implementation:
  - Client: Show error on blur
  - Server: CHECK constraint
```

#### Missing Required Fields
```
Condition: User submits form without name
Expected: "Subscription name is required"
Implementation:
  - HTML5 required attribute
  - Server-side validation
```

---

### Duplicate Prevention

#### Duplicate Subscription Name
```
Condition: User adds "Netflix", tries to add another "Netflix"
Expected: "You already have subscription named 'Netflix'"
Implementation:
  - UNIQUE constraint: (user_id, subscription_name)
  - Server returns 409 conflict
```

---

### Concurrency Issues

#### Simultaneous Edit & Delete
```
Condition: User A edits subscription, User B deletes it
Expected: One operation succeeds, other fails gracefully
Implementation:
  - Optimistic updates (show change immediately)
  - If delete succeeds, refresh dashboard
  - If edit fails, show "Subscription was deleted" message
```

---

### Network Errors

#### Timeout During Add
```
Condition: Network drops during POST /api/subscriptions
Expected: "Network error. Please try again"
Response: Form stays open, user can retry
```

---

### Data Consistency

#### Stale UI After Delete
```
Condition: Delete succeeds, but card still shows on dashboard
Expected: Card removed within 1-2 seconds
Implementation:
  - Optimistic update: Remove card immediately
  - If delete fails, add card back
  - Real-time sync (PRD 3) ensures consistency
```

---

## 7. REAL-TIME CONSIDERATIONS

### Real-Time Subscriptions
- When user adds subscription, all open tabs update
- When subscription is disabled/enabled, tabs sync
- When subscription expires, tabs sync

(Detailed in PRD 3)

---

## 8. SECURITY & RLS

### RLS Policies
- User can only see own subscriptions
- User can only edit own subscriptions
- User can only delete own subscriptions

---

## 9. TESTING SCENARIOS

### Happy Path
```
✅ Add subscription successfully
✅ View all subscriptions on dashboard
✅ Edit subscription (all fields)
✅ Delete subscription (soft delete)
✅ Restore deleted subscription
✅ Disable subscription
✅ Re-enable subscription
✅ Sorting by expiration/cost/name
```

### Error Path
```
✅ Invalid cost (negative)
✅ Date validation (start > expiration)
✅ Duplicate subscription name
✅ Network timeout
✅ Missing required fields
```

---

## 10. ACCEPTANCE CRITERIA

- ✅ Add, Edit, Delete (soft) working
- ✅ Disable/Re-enable working
- ✅ Dashboard shows 4 tabs with correct data
- ✅ Sorting working (expiration, cost, name)
- ✅ Total monthly spending calculated
- ✅ Three-dot menus functional
- ✅ Form validation working
- ✅ Error messages clear
- ✅ No RLS bypass
- ✅ No console errors

---

## 11. SUCCESS METRICS

| Metric | Target |
|--------|--------|
| Add success rate | 100% |
| Edit success rate | 100% |
| Delete recovery rate | 100% (within 24h) |
| RLS enforcement | 100% (no data leaks) |
| Form validation | 100% |
| Dashboard load time | <2 sec |
| Error handling | 100% |

---

## 12. BLOCKERS & DEPENDENCIES

**Depends On**: PRD 1 (Authentication)  
**Blocks**: PRD 3 (Real-time), PRD 4 (Automation)

---

**End of Feature PRD 2**

