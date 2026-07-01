# Baulera

**Document:** 05-use-cases.md 
**Version:** 1.0  
**Status:** Final  
**Last Updated:** 2026-07-01

---

# 1. Introduction

## 1.1 Purpose

This document defines the functional behavior of Baulera through Use Cases.

Each Use Case describes:

- Goal
- Actors
- Preconditions
- Main Flow
- Alternative Flows
- Exceptions
- Postconditions
- Business Rules
- Related Functional Requirements

Every implemented feature shall be traceable to at least one Use Case.

---

## 1.2 Scope

This document covers:

- Inventory Management
- Product Catalog
- Shopping List
- Barcode Scanning
- Voice Commands
- Artificial Intelligence
- Statistics
- Synchronization
- Notifications
- Administration

---

# 2 Actors

---

## Household Member

Primary actor.

Responsibilities

- Consume inventory
- Register purchases
- Search products
- Scan barcodes
- View statistics

---

## Administrator

Specialization of Household Member.

Additional permissions

- Manage categories
- Manage shelves
- Configure household
- Manage members

Current version:

All users are Administrators.

---

## System

Automated actor responsible for:

- Synchronization
- Notifications
- Threshold evaluation
- Shopping suggestions
- Expiration monitoring

---

## OpenFoodFacts

External system providing product metadata.

---

## Supabase

Backend platform responsible for:

- Authentication
- Synchronization
- Storage
- Realtime events

---

# 3 Use Case Template

Every Use Case follows this structure.

- Identifier
- Name
- Goal
- Primary Actor
- Supporting Actors
- Trigger
- Preconditions
- Main Flow
- Alternative Flows
- Exceptions
- Postconditions
- Business Rules
- Related Functional Requirements

---

# UC-001 Register Purchase

## Goal

Increase inventory after returning from the supermarket.

---

## Primary Actor

Household Member

---

## Supporting Actors

System

---

## Trigger

User selects **Register Purchase**.

---

## Preconditions

- User is authenticated.
- Product exists in Catalog.

---

## Main Flow

1. User searches for a Product.
2. System displays Product information.
3. User enters purchased quantity.
4. User selects Shelf.
5. User optionally enters Expiration Date.
6. System searches for an existing compatible Inventory Batch.
7. If found, quantities are merged.
8. Otherwise, a new Inventory Batch is created.
9. Inventory Movement is generated.
10. Audit Record is generated.
11. Shopping List is updated.
12. Local database is updated.
13. Synchronization Event is queued.

---

## Alternative Flows

### A1

Barcode scan identifies Product.

Continue at Step 3.

---

### A2

Voice command initiates purchase.

Continue at Step 3.

---

### A3

Product does not exist.

Execute UC-004 Create Product.

Resume Step 3.

---

## Exceptions

E1

Quantity ≤ 0.

Operation rejected.

---

## Postconditions

- Inventory increased.
- History preserved.
- Shopping suggestion updated.
- Pending synchronization generated.

---

## Business Rules

- Quantity cannot be negative.
- Inventory never decreases.
- Expiration belongs to Inventory Batch.

---

## Related Functional Requirements

RF-041–RF-050

---

# UC-002 Consume Product

## Goal

Decrease inventory after consuming a product.

---

## Primary Actor

Household Member

---

## Trigger

User selects **Consume Product**.

---

## Preconditions

- Inventory exists.

---

## Main Flow

1. User searches Product.
2. System displays active Inventory Batches.
3. User selects Batch.
4. User enters consumed quantity.
5. System validates quantity.
6. Inventory is updated.
7. Inventory Movement is generated.
8. Audit Record is generated.
9. Threshold is evaluated.
10. Shopping List updated if necessary.
11. Synchronization Event created.

---

## Alternative Flows

### A1

User selects Batch through barcode.

---

### A2

User uses voice command.

---

### A3

User selects quantity using quick buttons.

Examples

```
-1

-2

-5
```

---

## Exceptions

Insufficient stock.

Operation rejected.

---

## Postconditions

Inventory reduced.

History preserved.

---

## Business Rules

Inventory never becomes negative.

---

## Related Functional Requirements

RF-031–RF-040

---

# UC-003 Adjust Inventory

## Goal

Correct inventory after manual counting.

---

## Primary Actor

Household Member

---

## Preconditions

Inventory Batch exists.

---

## Main Flow

1. User opens Product.
2. User selects Inventory Batch.
3. User chooses Adjust Inventory.
4. User enters actual quantity.
5. System calculates difference.
6. Inventory updated.
7. Adjustment Movement generated.
8. Audit Record generated.
9. Synchronization Event generated.

---

## Alternative Flow

Adjustment reason recorded.

---

## Exceptions

Invalid quantity.

---

## Postconditions

Inventory reflects physical reality.

---

## Business Rules

Adjustments never overwrite history.

---

## Related Functional Requirements

RF-031–RF-040

---

# UC-004 Create Product

## Goal

Create a new Product in the Catalog.

---

## Primary Actor

Household Member

---

## Trigger

Product not found.

---

## Preconditions

None.

---

## Main Flow

1. User selects Create Product.
2. User enters Product Name.
3. User selects Category.
4. User optionally selects Brand.
5. User enters Presentation.
6. User optionally enters Barcode.
7. User optionally selects Photo.
8. Threshold initialized.
9. Target Quantity initialized.
10. Product saved.
11. Audit generated.
12. Synchronization Event queued.

---

## Alternative Flows

### A1

OpenFoodFacts provides Product.

Fields pre-filled.

---

### A2

Photo captured using camera.

---

## Exceptions

Duplicate barcode.

---

## Postconditions

Product available for inventory operations.

---

## Related Functional Requirements

RF-013–RF-020

---

# UC-005 Update Product

## Goal

Modify Product metadata.

---

## Primary Actor

Household Member

---

## Preconditions

Product exists.

---

## Main Flow

1. User opens Product.
2. User edits metadata.
3. Validation executed.
4. Product updated.
5. Audit generated.
6. Synchronization queued.

---

## Exceptions

Duplicate barcode.

---

## Postconditions

Updated Product visible across Household after synchronization.

---

## Related Functional Requirements

RF-013–RF-020

---

# UC-006 Archive Product

## Goal

Archive Products that are no longer used.

---

## Primary Actor

Administrator

---

## Preconditions

Product exists.

Inventory equals zero.

---

## Main Flow

1. User selects Archive.
2. Confirmation requested.
3. Product archived.
4. Audit generated.
5. Synchronization queued.

---

## Alternative Flow

User cancels.

---

## Business Rules

Archived Products remain available in history.

---

## Related Functional Requirements

RF-013–RF-020

---

# UC-007 Relocate Inventory

## Goal

Move inventory between shelves.

---

## Primary Actor

Household Member

---

## Preconditions

Inventory exists.

---

## Main Flow

1. User selects Inventory Batch.
2. User chooses Move.
3. Select new Shelf.
4. Inventory updated.
5. Movement generated.
6. Audit generated.
7. Synchronization queued.

---

## Postconditions

Inventory stored in new location.

---

## Related Functional Requirements

RF-101–RF-110

---

# UC-008 View Product Details

## Goal

Display complete Product information.

---

## Primary Actor

Household Member

---

## Preconditions

Product exists.

---

## Main Flow

1. User opens Product.
2. System displays:
   - Metadata
   - Current Stock
   - Active Batches
   - Expiration Dates
   - Threshold
   - Shopping Status
   - Recent Movements

---

## Alternative Flow

Product has no stock.

Inventory section displays "Out of Stock".

---

## Postconditions

No data modified.

---

## Related Functional Requirements

RF-091–RF-100

---

# UC-009 View Shopping List

## Goal

Display all products that should be purchased.

---

## Primary Actor

Household Member

---

## Supporting Actors

System

---

## Trigger

User opens **Shopping List**.

---

## Preconditions

None.

---

## Main Flow

1. User opens Shopping List.
2. System loads all active Shopping Items.
3. Items are ordered by:
   - Priority
   - Category
   - Product Name
4. Each item displays:
   - Product Name
   - Current Stock
   - Threshold
   - Target Quantity
   - Suggested Quantity
5. User may filter the list.
6. User may search within the list.

---

## Alternative Flows

### A1

No active Shopping Items.

System displays:

```
Your shopping list is empty.
```

---

## Postconditions

No data modified.

---

## Business Rules

Only active Shopping Items are displayed.

---

## Related Functional Requirements

RF-061–RF-070

---

# UC-010 Complete Shopping Item

## Goal

Mark a suggested purchase as completed.

---

## Primary Actor

Household Member

---

## Preconditions

Shopping Item exists.

---

## Main Flow

1. User selects Shopping Item.
2. User chooses **Purchase**.
3. System launches Register Purchase workflow.
4. Inventory updated.
5. Shopping Item marked as Completed.
6. Audit generated.
7. Synchronization Event generated.

---

## Alternative Flows

### A1

User purchases only part of the suggested quantity.

Shopping Item remains active with recalculated Suggested Quantity.

---

## Exceptions

Purchase cancelled.

Shopping Item remains unchanged.

---

## Postconditions

Shopping List reflects remaining needs.

---

## Business Rules

Completing a Shopping Item never deletes its historical record.

---

## Related Functional Requirements

RF-061–RF-070

---

# UC-011 Ignore Shopping Suggestion

## Goal

Temporarily dismiss a shopping recommendation.

---

## Primary Actor

Household Member

---

## Preconditions

Shopping Item exists.

---

## Main Flow

1. User selects Ignore.
2. System requests confirmation.
3. Shopping Item status becomes Ignored.
4. Audit generated.
5. Synchronization queued.

---

## Alternative Flows

Ignored item later becomes active again because inventory changes.

---

## Postconditions

Suggestion hidden from active Shopping List.

---

## Business Rules

Ignored items remain in history.

---

## Related Functional Requirements

RF-061–RF-070

---

# UC-012 Manage Categories

## Goal

Create, update and archive Product Categories.

---

## Primary Actor

Administrator

---

## Preconditions

Administrator authenticated.

---

## Main Flow

1. User opens Categories.
2. User may:
   - Create
   - Edit
   - Archive
3. Validation executed.
4. Audit generated.
5. Synchronization queued.

---

## Alternative Flows

Attempt to archive a Category still referenced by active Products.

System blocks operation.

---

## Exceptions

Duplicate Category Name.

---

## Postconditions

Category Catalog updated.

---

## Business Rules

Category names shall be unique within the Household.

Categories are archived instead of deleted.

---

## Related Functional Requirements

RF-021–RF-024

---

# UC-013 Manage Brands

## Goal

Maintain the Brand catalog.

---

## Primary Actor

Administrator

---

## Preconditions

Administrator authenticated.

---

## Main Flow

1. User opens Brands.
2. User creates or edits Brand.
3. Validation executed.
4. Audit generated.
5. Synchronization queued.

---

## Alternative Flows

Brand is no longer used.

User archives Brand.

---

## Exceptions

Duplicate Brand Name.

---

## Postconditions

Brand catalog updated.

---

## Business Rules

Brand association is optional for Products.

Archived Brands remain referenced by historical Products.

---

## Related Functional Requirements

RF-013–RF-020

---

# UC-014 Manage Locations

## Goal

Create and maintain physical storage locations.

---

## Primary Actor

Administrator

---

## Preconditions

Administrator authenticated.

---

## Main Flow

1. User opens Locations.
2. User creates or edits Location.
3. Validation executed.
4. Audit generated.
5. Synchronization queued.

---

## Alternative Flows

Location contains Shelves.

User edits Location name.

---

## Exceptions

Duplicate Location Name.

---

## Postconditions

Location catalog updated.

---

## Business Rules

Locations cannot be deleted while Shelves exist.

---

## Related Functional Requirements

RF-025–RF-030

---

# UC-015 Manage Shelves

## Goal

Create and maintain Shelves within a Location.

---

## Primary Actor

Administrator

---

## Preconditions

Location exists.

---

## Main Flow

1. User selects Location.
2. User creates Shelf.
3. User enters Shelf Name.
4. Validation executed.
5. Shelf saved.
6. Audit generated.
7. Synchronization queued.

---

## Alternative Flows

Shelf renamed.

---

## Exceptions

Duplicate Shelf Name within the same Location.

---

## Postconditions

Shelf available for Inventory Batches.

---

## Business Rules

Shelf names must be unique inside their Location.

---

## Related Functional Requirements

RF-025–RF-030

---

# UC-016 Manage Household Members

## Goal

Manage users belonging to the Household.

---

## Primary Actor

Administrator

---

## Preconditions

Administrator authenticated.

Household exists.

---

## Main Flow

1. User opens Household Settings.
2. User invites a new member by email.
3. Invitation is sent.
4. New member accepts invitation.
5. Member joins Household.
6. Audit generated.
7. Synchronization propagated to all devices.

---

## Alternative Flows

### A1

Invitation expires.

Administrator sends a new invitation.

### A2

Invitation rejected.

No changes occur.

---

## Exceptions

Email already belongs to the Household.

Invitation rejected.

---

## Postconditions

Household membership updated.

---

## Business Rules

- A Household must always have at least one Administrator.
- A user cannot belong to multiple Households simultaneously (current version).
- Removing the last Administrator is prohibited.

---

## Related Functional Requirements

RF-006–RF-012

---

# UC-017 Search Products

## Goal

Find Products quickly using multiple search methods.

---

## Primary Actor

Household Member

---

## Preconditions

None.

---

## Main Flow

1. User opens Search.
2. User types one or more search terms.
3. System searches the local database.
4. Results update in real time.
5. User selects a Product.
6. Product Detail screen opens.

---

## Supported Search Fields

- Product Name
- Brand
- Category
- Barcode
- Presentation
- Shelf
- Location

---

## Alternative Flows

### A1

Search returns no results.

System displays:

```
No products found.
```

The user may create a new Product.

---

### A2

Search term matches a barcode.

Matching Product is displayed immediately.

---

## Exceptions

None.

---

## Postconditions

No data modified.

---

## Business Rules

- Search is case-insensitive.
- Search ignores accents.
- Search tolerates partial matches.
- Search works completely offline.

---

## Related Functional Requirements

RF-081–RF-090

---

# UC-018 Scan Barcode

## Goal

Identify a Product using its barcode.

---

## Primary Actor

Household Member

---

## Supporting Actors

OpenFoodFacts

---

## Preconditions

Camera permission granted.

---

## Main Flow

1. User opens Barcode Scanner.
2. Camera activates.
3. Barcode detected.
4. System searches local database.
5. If Product exists, Product Detail is opened.
6. Otherwise, OpenFoodFacts lookup is executed.
7. Retrieved Product is displayed.
8. User confirms creation.
9. Product is added to the Catalog.

---

## Alternative Flows

### A1

Internet unavailable.

Only local database is searched.

If Product is not found,

manual Product creation starts.

---

### A2

Multiple barcode formats detected.

System automatically selects the most confident result.

---

## Exceptions

Unreadable barcode.

System asks the user to retry.

---

## Postconditions

Product available for future scans.

---

## Business Rules

- Local lookup always executes before remote lookup.
- Barcode scanning works offline.
- Remote lookup is optional.

---

## Related Functional Requirements

RF-071–RF-080

RF-221–RF-230

---

# UC-019 Import Product from OpenFoodFacts

## Goal

Create a Product using OpenFoodFacts metadata.

---

## Primary Actor

Household Member

---

## Supporting Actors

OpenFoodFacts

---

## Preconditions

Internet connection available.

Barcode recognized.

---

## Main Flow

1. Barcode identified.
2. OpenFoodFacts queried.
3. Metadata downloaded.
4. Product preview displayed.
5. User reviews imported information.
6. User edits fields if desired.
7. Product saved.
8. Audit generated.
9. Synchronization queued.

---

## Imported Fields

- Name
- Brand
- Barcode
- Image
- Category (when available)

---

## Alternative Flows

### A1

User modifies imported information before saving.

---

### A2

User rejects imported Product.

Nothing is created.

---

## Exceptions

Product not found.

Manual Product creation starts.

---

## Postconditions

Catalog updated.

---

## Business Rules

User-entered information always has priority over imported metadata.

---

## Related Functional Requirements

RF-221–RF-230

---

# UC-020 Manage Expiration Dates

## Goal

Maintain expiration information for Inventory Batches.

---

## Primary Actor

Household Member

---

## Preconditions

Inventory Batch exists.

---

## Main Flow

1. User opens Inventory Batch.
2. User edits Expiration Date.
3. Validation executed.
4. Batch updated.
5. Audit generated.
6. Notification schedule recalculated.
7. Synchronization queued.

---

## Alternative Flows

Expiration Date removed.

Batch becomes "No Expiration".

---

## Exceptions

Invalid date.

---

## Postconditions

Expiration information updated.

---

## Business Rules

Expiration belongs to Inventory Batch,

never to Product.

---

## Related Functional Requirements

RF-111–RF-120

---

# UC-021 View Expiring Products

## Goal

Display Products approaching expiration.

---

## Primary Actor

Household Member

---

## Preconditions

Inventory exists.

---

## Main Flow

1. User opens Expiration screen.
2. System calculates remaining days.
3. Products sorted by nearest expiration.
4. Color indicators displayed.
5. User may open Product Details.

---

## Alternative Flows

### A1

No Products approaching expiration.

Empty state displayed.

---

## Postconditions

No data modified.

---

## Business Rules

Default warning period:

30 days.

User configurable.

---

## Related Functional Requirements

RF-111–RF-120

RF-171–RF-180

---

# UC-022 View Expired Products

## Goal

Identify Products that have already expired.

---

## Primary Actor

Household Member

---

## Preconditions

Expired Inventory Batches exist.

---

## Main Flow

1. User opens Expired Products.
2. System lists expired batches.
3. User selects one.
4. User may:
   - Discard
   - Adjust Inventory
   - Keep temporarily

---

## Alternative Flows

Batch already consumed.

No action required.

---

## Postconditions

Inventory updated if discarded.

---

## Business Rules

Discarding expired inventory generates:

- Inventory Movement
- Audit Record
- Synchronization Event

---

## Related Functional Requirements

RF-111–RF-120

---

# UC-023 Discover Similar Products

## Goal

Help users locate similar Products already present in the Catalog.

---

## Primary Actor

Household Member

---

## Preconditions

Catalog contains Products.

---

## Main Flow

1. User enters Product Name.
2. System searches for similar names.
3. Similar Products displayed.
4. User selects existing Product or creates a new one.

---

## Alternative Flows

No similar Products found.

Manual creation continues.

---

## Business Rules

Similarity considers:

- Name
- Brand
- Presentation

---

## Related Functional Requirements

RF-081–RF-090

RF-161–RF-170

---

# UC-024 Browse Product Catalog

## Goal

Browse the complete Product Catalog.

---

## Primary Actor

Household Member

---

## Preconditions

Catalog exists.

---

## Main Flow

1. User opens Product Catalog.
2. System displays Products.
3. User may:
   - Filter by Category
   - Filter by Brand
   - Filter by Availability
   - Filter by Low Stock
   - Filter by Expiration
4. User selects a Product.
5. Product Detail displayed.

---

## Alternative Flows

Only archived Products requested.

Archived view displayed.

---

## Postconditions

No data modified.

---

## Business Rules

Catalog includes Products with zero stock.

Archived Products are hidden by default.

---

## Related Functional Requirements

RF-013–RF-020

RF-081–RF-090

---

# UC-025 View Dashboard

## Goal

Provide a quick overview of the current inventory status.

---

## Primary Actor

Household Member

---

## Preconditions

None.

---

## Main Flow

1. User opens the Dashboard.
2. System displays:
   - Total Products
   - Total Inventory Units
   - Low Stock Products
   - Out of Stock Products
   - Expiring Products
   - Shopping List Summary
3. User selects any widget.
4. System navigates to the corresponding screen.

---

## Alternative Flows

Dashboard has no data.

System displays onboarding suggestions.

---

## Postconditions

No data modified.

---

## Business Rules

Dashboard data shall always be loaded from the local database.

---

## Related Functional Requirements

RF-181–RF-190

---

# UC-026 View Statistics

## Goal

Display inventory statistics.

---

## Primary Actor

Household Member

---

## Preconditions

Inventory history exists.

---

## Main Flow

1. User opens Statistics.
2. System calculates metrics.
3. Charts are displayed.
4. User changes period.
5. Statistics update immediately.

---

## Available Statistics

- Consumption by Category
- Consumption by Product
- Purchases by Month
- Products Near Expiration
- Most Consumed Products
- Least Consumed Products
- Average Stock
- Inventory Value (future)
- Shopping Frequency

---

## Alternative Flows

No historical data.

Empty charts displayed.

---

## Business Rules

Statistics never modify data.

---

## Related Functional Requirements

RF-181–RF-190

---

# UC-027 Export Statistics

## Goal

Export statistical reports.

---

## Primary Actor

Household Member

---

## Preconditions

Statistics available.

---

## Main Flow

1. User selects Export.
2. Chooses format.
3. Report generated.
4. Share dialog opens.

---

## Supported Formats

- PDF
- CSV

---

## Alternative Flows

Export cancelled.

---

## Postconditions

No inventory modified.

---

## Business Rules

Reports are generated locally whenever possible.

---

## Related Functional Requirements

RF-181–RF-190

---

# UC-028 Execute Voice Command

## Goal

Perform inventory actions using natural language.

---

## Primary Actor

Household Member

---

## Preconditions

Microphone permission granted.

---

## Main Flow

1. User taps the microphone.
2. Speech recognition starts.
3. User speaks naturally.
4. Speech is transcribed.
5. Intent is identified.
6. Parameters are extracted.
7. System shows interpreted command.
8. User confirms.
9. Action executed.
10. Audit generated.
11. Synchronization queued.

---

## Example Commands

- Add two Coca-Cola Zero.
- I bought three milk cartons.
- Remove one ketchup.
- Move rice to the top shelf.
- Set Coca-Cola threshold to two.
- Search for mayonnaise.

---

## Alternative Flows

User edits interpreted command before confirmation.

---

## Exceptions

Intent cannot be determined.

System asks the user to try again.

---

## Business Rules

Voice commands never execute without user confirmation.

---

## Related Functional Requirements

RF-191–RF-200

---

# UC-029 AI Product Interpretation

## Goal

Interpret complex natural language commands.

---

## Primary Actor

Household Member

---

## Supporting Actors

AI Provider

---

## Preconditions

Internet connection available.

AI integration enabled.

---

## Main Flow

1. Speech converted to text.
2. Local parser attempts interpretation.
3. If confidence is high:
   - Execute locally.
4. Otherwise:
   - Send text to AI.
5. AI returns structured command.
6. User reviews interpretation.
7. Action executed.

---

## Alternative Flows

Offline mode.

Only local parser available.

---

## Exceptions

AI unavailable.

Fallback to local interpretation.

---

## Business Rules

AI is optional.

Core functionality never depends on AI.

---

## Related Functional Requirements

RF-201–RF-210

---

# UC-030 Ask Inventory Questions

## Goal

Allow users to ask questions about the inventory.

---

## Primary Actor

Household Member

---

## Preconditions

Inventory exists.

---

## Example Questions

- How many Coca-Cola bottles do we have?
- What expires next week?
- What should we buy?
- Which products are almost empty?
- Which shelf has pasta?

---

## Main Flow

1. User asks a question.
2. System interprets intent.
3. Local data queried.
4. Answer generated.
5. Supporting products displayed.

---

## Alternative Flows

Question requires AI.

AI generates natural language response.

---

## Business Rules

Answers are always based on local inventory.

---

## Related Functional Requirements

RF-201–RF-210

---

# UC-031 Receive Low Stock Notification

## Goal

Notify the Household when inventory reaches configured thresholds.

---

## Primary Actor

System

---

## Supporting Actors

Household Member

---

## Preconditions

Threshold reached.

Notifications enabled.

---

## Main Flow

1. Inventory updated.
2. Threshold evaluated.
3. Shopping Item created or updated.
4. Notification scheduled.
5. Notification delivered.
6. User opens Product.

---

## Alternative Flows

Notifications disabled.

Only Shopping List updated.

---

## Business Rules

Duplicate notifications shall not be generated for the same condition.

---

## Related Functional Requirements

RF-171–RF-180

---

# UC-032 Receive Expiration Notification

## Goal

Warn users before products expire.

---

## Primary Actor

System

---

## Preconditions

Expiration date configured.

Warning period reached.

---

## Main Flow

1. Daily scheduler runs.
2. Expiring Inventory Batches identified.
3. Notification generated.
4. User opens Product.
5. Product details displayed.

---

## Alternative Flows

Batch already consumed.

Notification cancelled automatically.

---

## Exceptions

Notifications disabled.

No push notification generated.

---

## Postconditions

No inventory modified.

---

## Business Rules

Default notification schedule:

- 30 days before expiration
- 15 days before expiration
- 7 days before expiration
- 1 day before expiration

User may customize these intervals.

---

## Related Functional Requirements

RF-171–RF-180

---
# UC-033 Synchronize Pending Changes

## Goal

Synchronize local changes with the cloud without interrupting the user.

---

## Primary Actor

System

---

## Supporting Actors

Supabase

---

## Preconditions

- Pending synchronization events exist.
- Internet connection available.
- User authenticated.

---

## Main Flow

1. Connectivity is detected.
2. Synchronization starts automatically.
3. Pending events are processed in chronological order.
4. Events are sent to Supabase.
5. Remote changes are downloaded.
6. Local database updated.
7. Synchronization queue cleared.
8. UI refreshed if needed.

---

## Alternative Flows

### A1

No pending events.

Synchronization ends immediately.

---

### A2

Only remote updates exist.

Local database updated.

---

## Exceptions

Network interruption.

Synchronization pauses and retries later.

---

## Postconditions

Local and remote data become consistent.

---

## Business Rules

- Local operations always execute before synchronization.
- Synchronization never blocks the UI.
- Synchronization is idempotent.

---

## Related Functional Requirements

RF-231–RF-240

---

# UC-034 Resolve Synchronization Conflict

## Goal

Resolve conflicting modifications made on different devices.

---

## Primary Actor

System

---

## Preconditions

Conflict detected during synchronization.

---

## Main Flow

1. Conflict detected.
2. Conflict type identified.
3. Resolution strategy selected.
4. Winning version applied.
5. Audit generated.
6. Synchronization completed.

---

## Resolution Strategy

Default policy:

```
Last Write Wins
```

using server timestamp.

---

## Alternative Flows

Future versions may support:

- Manual merge
- Field-level merge
- User confirmation

---

## Exceptions

Conflict cannot be resolved automatically.

Operation marked for retry.

---

## Business Rules

Conflicts shall never produce corrupted inventory.

---

## Related Functional Requirements

RF-231–RF-240

---

# UC-035 Authenticate User

## Goal

Authenticate a Household Member.

---

## Primary Actor

Household Member

---

## Supporting Actors

Supabase Auth

---

## Preconditions

Registered account exists.

---

## Main Flow

1. User enters email.
2. User enters password.
3. Credentials validated.
4. Session created.
5. Household loaded.
6. Local synchronization starts.

---

## Alternative Flows

Existing session restored automatically.

---

## Exceptions

Invalid credentials.

Authentication denied.

---

## Postconditions

Authenticated session established.

---

## Business Rules

Authentication is required only to synchronize.

Offline mode remains available for previously authenticated users.

---

## Related Functional Requirements

RF-001–RF-012

---

# UC-036 Invite Household Member

## Goal

Invite another user to join the Household.

---

## Primary Actor

Administrator

---

## Preconditions

Administrator authenticated.

---

## Main Flow

1. Administrator enters email.
2. Invitation created.
3. Invitation sent.
4. Recipient accepts.
5. Household membership created.
6. Audit generated.

---

## Alternative Flows

Invitation resent.

---

## Exceptions

Email already belongs to Household.

---

## Business Rules

Current implementation supports a single Household.

---

## Related Functional Requirements

RF-006–RF-012

---

# UC-037 View Audit History

## Goal

Review historical changes performed in the application.

---

## Primary Actor

Household Member

---

## Preconditions

Audit records exist.

---

## Main Flow

1. User opens Audit History.
2. System displays chronological records.
3. User filters by:
   - Product
   - User
   - Date
   - Action
4. User opens record.
5. Before and After values displayed.

---

## Alternative Flows

No records available.

Empty state displayed.

---

## Postconditions

No data modified.

---

## Business Rules

Audit records are immutable.

---

## Related Functional Requirements

RF-151–RF-160

---

# UC-038 Restore Archived Product

## Goal

Return an archived Product to the active catalog.

---

## Primary Actor

Administrator

---

## Preconditions

Archived Product exists.

---

## Main Flow

1. User opens Archived Products.
2. Selects Product.
3. Chooses Restore.
4. Product marked Active.
5. Audit generated.
6. Synchronization queued.

---

## Alternative Flows

Product restored and immediately used in Register Purchase.

---

## Business Rules

Historical data remains unchanged.

---

## Related Functional Requirements

RF-013–RF-020

---

# UC-039 Backup Local Database

## Goal

Create a local backup of the application data.

---

## Primary Actor

Household Member

---

## Preconditions

Application installed.

---

## Main Flow

1. User selects Backup.
2. Local database exported.
3. Backup file generated.
4. User selects destination.

---

## Alternative Flows

Automatic scheduled backups (future).

---

## Exceptions

Storage unavailable.

Backup cancelled.

---

## Business Rules

Backup never interrupts application usage.

---

## Related Functional Requirements

RF-231–RF-240

---

# UC-040 Restore Backup

## Goal

Restore application data from a previously created backup.

---

## Primary Actor

Administrator

---

## Preconditions

Valid backup file exists.

---

## Main Flow

1. User selects Restore Backup.
2. Backup validated.
3. Confirmation requested.
4. Current database replaced.
5. Synchronization queue rebuilt.
6. Application restarted.

---

## Alternative Flows

User cancels restoration.

---

## Exceptions

Invalid backup.

Operation rejected.

---

## Business Rules

Restoration preserves UUID identifiers to avoid synchronization inconsistencies.

---

## Related Functional Requirements

RF-231–RF-240

---

