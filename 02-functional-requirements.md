# Baulera

**Document:** 02-functional-requirements.md   
**Version:** 1.0  
**Status:** Final  
**Last Updated:** 2026-07-01

---

# 1. Introduction

## 1.1 Purpose

This document defines every functional requirement of Baulera.

All requirements contained in this document are mandatory unless explicitly marked as optional.

Each requirement has:

- Unique identifier
- Priority
- Description
- Business Rules
- Acceptance Criteria

---

## 1.2 Requirement Priority

| Priority | Description |
|-----------|-------------|
| Critical | Mandatory for MVP |
| High | Mandatory for V1 |
| Medium | Future version |
| Low | Nice to have |

---

# 2 Authentication

---

## RF-001 User Registration

**Priority**

Critical

### Description

The system shall allow a new user to create an account using an email address and password.

### Business Rules

- Email must be unique.
- Password must satisfy the configured security policy.
- Email verification is required.
- Registration does not automatically create a Household.

### Acceptance Criteria

- User receives verification email.
- User cannot authenticate before verification.
- Duplicate email is rejected.

---

## RF-002 User Login

**Priority**

Critical

### Description

The system shall authenticate users using email and password.

### Business Rules

- Authentication is performed through Supabase Auth.
- Session shall persist between application launches.
- Login must work after offline restoration if a valid local session exists.

### Acceptance Criteria

- Valid credentials authenticate successfully.
- Invalid credentials return an appropriate error.
- Existing session restores automatically.

---

## RF-003 Logout

**Priority**

Critical

### Description

Users shall be able to terminate their current session.

### Business Rules

- Local credentials shall be removed.
- Cached inventory remains available according to offline policy.
- Synchronization queue must finish pending uploads before logout whenever possible.

### Acceptance Criteria

- User returns to Login screen.
- Session token becomes invalid.

---

## RF-004 Password Reset

**Priority**

High

### Description

Users shall be able to reset forgotten passwords.

### Business Rules

- Reset is initiated through email.
- Password reset token expires.
- Previous sessions may be invalidated.

### Acceptance Criteria

- Reset email is sent.
- User can define a new password.

---

## RF-005 Session Persistence

**Priority**

Critical

### Description

The application shall automatically restore valid sessions.

### Business Rules

- User should not authenticate every time the application opens.
- Expired tokens shall be refreshed automatically.

### Acceptance Criteria

- Application opens directly into the main screen when session is valid.

---

# 3 Household Management

---

## RF-006 Household Creation

**Priority**

Critical

### Description

A user shall be able to create a Household.

### Business Rules

- One creator becomes Household Owner.
- Household name is mandatory.
- Household UUID is generated automatically.

### Acceptance Criteria

- Household is created successfully.
- Creator becomes administrator.

---

## RF-007 Household Membership

**Priority**

Critical

### Description

Multiple users shall share the same inventory.

### Business Rules

- Inventory belongs to Household.
- Products belong to Household.
- Categories belong to Household.
- Shopping List belongs to Household.

### Acceptance Criteria

- All members visualize identical information after synchronization.

---

## RF-008 Invite User

**Priority**

Critical

### Description

Administrators shall invite another user by email.

### Business Rules

- Invitation is unique.
- Invitation expires after configurable period.
- Duplicate active invitations are forbidden.

### Acceptance Criteria

- Invitation is sent.
- Recipient may accept.

---

## RF-009 Accept Invitation

**Priority**

Critical

### Description

An invited user shall join the Household.

### Business Rules

- Invitation must be valid.
- User may belong to only one Household.

### Acceptance Criteria

- Household membership is created.
- Inventory becomes available.

---

## RF-010 Remove Member

**Priority**

Medium

### Description

Administrators shall remove members.

### Business Rules

- Removed members lose synchronization.
- Audit history remains.

### Acceptance Criteria

- User immediately loses access.

---

# 4 User Profile

---

## RF-011 Edit Profile

**Priority**

Medium

### Description

Users may edit their personal profile.

### Editable fields

- Display Name
- Avatar

### Acceptance Criteria

Changes synchronize across devices.

---

## RF-012 Profile Photo

**Priority**

Low

### Description

Users may upload profile images.

---

# 5 Catalog

The Catalog represents permanent product definitions.

Catalog entries never contain inventory information.

---

## RF-013 Create Product

**Priority**

Critical

### Description

Users shall manually create products.

### Required Fields

- Name
- Category

### Optional Fields

- Brand
- Barcode
- Presentation
- Photo

### Business Rules

- Duplicate products should be detected.
- Product UUID generated automatically.

### Acceptance Criteria

Product becomes available for inventory.

---

## RF-014 Edit Product

**Priority**

Critical

### Description

Users shall edit product information.

### Editable Fields

- Name
- Brand
- Presentation
- Category
- Barcode
- Photo

### Business Rules

Editing a product never changes inventory.

---

## RF-015 Archive Product

**Priority**

High

### Description

Products shall never be permanently deleted.

### Business Rules

Archived products:

- disappear from searches by default
- remain referenced by history
- remain referenced by audit
- remain referenced by statistics

---

## RF-016 Restore Product

**Priority**

Medium

Archived products may be restored.

---

## RF-017 Product Photo

**Priority**

Medium

Product photo may originate from:

- OpenFoodFacts
- Manual upload

Priority order:

1. Manual
2. OpenFoodFacts

---

## RF-018 Barcode

**Priority**

Critical

A product may contain one barcode.

Business Rules:

- Barcode must be unique.
- Barcode is optional.
- Missing barcode allows manual creation.

---

## RF-019 Presentation

**Priority**

Critical

Presentation replaces weight/volume.

Examples:

- 500 ml
- 1.5 L
- 250 g
- Pack x6
- Bottle
- Can
- Box

---

## RF-020 Brand

**Priority**

Medium

Brand is optional.

Examples

- Coca-Cola
- Arcor
- La Serenísima

---

# 6 Categories

---

## RF-021 Create Category

**Priority**

Critical

Users shall create custom categories.

Examples

- Drinks
- Snacks
- Frozen
- Cleaning

---

## RF-022 Edit Category

**Priority**

Critical

Category name may change.

Changing category shall never modify inventory.

---

## RF-023 Archive Category

**Priority**

Medium

Categories shall be archived instead of deleted.

---

## RF-024 Default Categories

**Priority**

Critical

New Households shall receive default categories.

Minimum:

- Drinks
- Food
- Frozen
- Cleaning
- Bathroom
- Pet
- Other

---

# 7 Locations

---

## RF-025 Create Location

**Priority**

Critical

Locations represent physical areas.

Examples

- Pantry
- Storage Room
- Kitchen
- Freezer

---

## RF-026 Edit Location

**Priority**

Medium

Users may rename locations.

---

## RF-027 Archive Location

**Priority**

Medium

Archived locations remain referenced historically.

---

# 8 Shelves

---

## RF-028 Create Shelf

**Priority**

Critical

Users may create shelves inside locations.

Examples

Shelf A

Shelf B

Shelf C

---

## RF-029 Edit Shelf

**Priority**

Medium

Shelf names are editable.

---

## RF-030 Archive Shelf

**Priority**

Medium

Archived shelves remain in historical movements.

Inventory currently assigned must be relocated before archival.


# 9 Inventory

The Inventory module manages the physical stock available in the household.

Unlike the Product Catalog, Inventory represents **real physical items** stored in one or more locations.

Each inventory entry represents a **batch (lot)** of the same product.

---

## RF-031 Create Inventory Item

**Priority**

Critical

### Description

Users shall create an inventory item for an existing catalog product.

### Required Fields

- Product
- Quantity
- Location
- Shelf

### Optional Fields

- Expiration Date
- Notes

### Business Rules

- Product must already exist in the Catalog.
- Quantity must be greater than zero.
- A new Inventory Item always creates an Inventory Movement.

### Acceptance Criteria

Inventory becomes immediately available.

---

## RF-032 Multiple Batches

**Priority**

Critical

### Description

The system shall allow multiple batches of the same product.

### Example

```
Coca-Cola Zero 1.5L

Batch A
Quantity: 3
Expiration: 12/2026

Batch B
Quantity: 5
Expiration: 03/2027
```

### Business Rules

- Batches remain independent.
- Stock is calculated as the sum of all active batches.

---

## RF-033 Consume Inventory

**Priority**

Critical

### Description

Users shall register product consumption.

### Business Rules

- Quantity consumed must be positive.
- Quantity cannot exceed available stock.
- Consumption creates an Inventory Movement.
- Consumption creates an Audit Log.
- Shopping List must be re-evaluated.

### Acceptance Criteria

Stock is updated correctly.

---

## RF-034 Consume Partial Quantity

**Priority**

Critical

Users may consume part of a batch.

Example

```
Current

Quantity 10

↓

Consume 3

↓

Remaining 7
```

---

## RF-035 Consume Entire Batch

**Priority**

Critical

Users may consume all remaining units.

Business Rules

- Quantity becomes zero.
- Batch remains stored.
- Product remains active.
- History remains available.

---

## RF-036 Batch Selection

**Priority**

Critical

When multiple batches exist, users shall choose which batch is being consumed.

Example

```
Coca-Cola

Batch 1

2 units

12/2026

-----------------

Batch 2

5 units

03/2027
```

---

## RF-037 FIFO Consumption

**Priority**

High

The application shall support automatic FIFO consumption.

Business Rules

When enabled,

oldest expiration date is selected automatically.

Users may override.

---

## RF-038 Manual Batch Selection

**Priority**

Critical

Users may manually select the batch regardless of expiration.

---

## RF-039 Inventory Adjustment

**Priority**

High

Users shall manually adjust inventory.

Examples

- Counting correction
- Damaged products
- Lost products

Business Rules

Adjustment always generates Inventory Movement.

---

## RF-040 Inventory Notes

**Priority**

Low

Inventory Items may contain notes.

Example

```
Opened package

Broken packaging

Reserved
```

---

# 10 Purchases

---

## RF-041 Register Purchase

**Priority**

Critical

Users shall register grocery purchases.

### Business Rules

Purchase may:

- create Product
- create Batch
- increase existing Batch

### Acceptance Criteria

Inventory reflects purchased quantity.

---

## RF-042 Purchase Existing Product

**Priority**

Critical

Existing catalog products shall be reused.

Duplicate catalog entries should be avoided.

---

## RF-043 Purchase Unknown Product

**Priority**

Critical

If product does not exist,

user may create it immediately.

---

## RF-044 Purchase Quantity

**Priority**

Critical

Purchased quantity must be greater than zero.

---

## RF-045 Purchase Expiration

**Priority**

Critical

Expiration date is optional.

If supplied,

new batch is created.

---

## RF-046 Purchase without Barcode

**Priority**

Critical

Products without barcode shall be supported.

---

## RF-047 Purchase from Shopping List

**Priority**

High

Users may register purchases directly from Shopping List.

Purchased items shall automatically update suggested quantities.

---

## RF-048 Bulk Purchase

**Priority**

Medium

Users may register multiple products in one operation.

---

## RF-049 Purchase History

**Priority**

Critical

Every purchase shall remain permanently stored.

---

## RF-050 Purchase Audit

**Priority**

Critical

Purchase shall record

- User
- Timestamp
- Device
- Inventory affected

---

# 11 Inventory Movements

Inventory Movements represent the source of truth for inventory history.

---

## RF-051 Movement Types

**Priority**

Critical

Supported types

- Purchase
- Consumption
- Adjustment
- Relocation
- Expiration

---

## RF-052 Movement Timestamp

Every movement records

- Date
- Time

UTC internally.

---

## RF-053 Movement Author

Every movement stores

- User

---

## RF-054 Movement Device

Every movement stores

Device Identifier.

Useful for synchronization diagnostics.

---

## RF-055 Movement UUID

Every movement shall have UUID.

---

## RF-056 Immutable Movements

Inventory Movements shall never be edited.

Corrections require new movements.

---

## RF-057 Movement Reason

Adjustments require a reason.

Examples

```
Inventory Count

Broken

Expired

Lost

Donation

Other
```

---

## RF-058 Movement History

Users shall inspect movement history of every product.

---

## RF-059 Movement Search

Users shall search movement history by

- Product
- User
- Date
- Type

---

## RF-060 Movement Filters

Supported filters

- Purchases
- Consumptions
- Adjustments
- Relocations
- Expirations


# 12 Shopping List

The Shopping List is automatically generated from inventory status.

It is not intended to be a manually maintained checklist, although manual additions are allowed.

The Shopping List is continuously recalculated based on inventory thresholds and user actions.

---

## RF-061 Automatic Shopping Suggestions

**Priority**

Critical

### Description

The system shall automatically suggest products for purchase whenever inventory reaches its configured threshold.

### Business Rules

- Suggestions are generated automatically.
- Suggestions remain until resolved.
- Suggestions update whenever inventory changes.

### Acceptance Criteria

Products appear automatically after reaching the threshold.

---

## RF-062 Product Threshold

**Priority**

Critical

### Description

Each Product shall define a minimum desired quantity (Threshold).

### Business Rules

- Threshold belongs to the Product definition.
- Default Threshold = 0.
- Threshold may be modified at any time.

### Example

```
Product

Milk

Threshold

3
```

---

## RF-063 Target Quantity

**Priority**

Critical

### Description

Each Product shall define a Target Quantity.

Target Quantity represents the preferred inventory level after shopping.

### Example

```
Threshold

3

Target

8
```

### Business Rules

Target Quantity must be greater than or equal to Threshold.

---

## RF-064 Suggested Purchase Quantity

**Priority**

Critical

### Description

Suggested Quantity shall be automatically calculated.

### Formula

```
Target Quantity

-

Current Stock

=

Suggested Purchase
```

### Example

```
Target

8

Current

2

↓

Suggested

6
```

---

## RF-065 Stock Recalculation

**Priority**

Critical

Whenever inventory changes,

the Shopping List shall be recalculated automatically.

---

## RF-066 Shopping Item Status

**Priority**

High

Shopping Items shall support the following states:

- Suggested
- Selected
- Purchased
- Ignored

---

## RF-067 Manual Shopping Item

**Priority**

Medium

Users may manually add products to the Shopping List.

Business Rules

- Product may exist without affecting inventory.
- Manual items remain until completed or removed.

---

## RF-068 Complete Shopping Item

**Priority**

Critical

Users shall mark Shopping Items as purchased.

Business Rules

Completing an item shall immediately start the Purchase workflow.

---

## RF-069 Ignore Suggestion

**Priority**

Medium

Users may ignore a suggestion.

Ignored suggestions shall not reappear unless inventory changes again.

---

## RF-070 Shopping History

**Priority**

High

Completed Shopping Items shall remain available historically.

---

# 13 Barcode Scanning

The application shall support barcode scanning as the preferred method of product identification.

---

## RF-071 Scan Barcode

**Priority**

Critical

Users shall scan product barcodes using the device camera.

---

## RF-072 Continuous Scan Mode

**Priority**

High

The application shall support continuous barcode scanning.

Business Rules

- Multiple products may be scanned sequentially.
- Camera remains open.
- Confirmation occurs after each successful scan.

---

## RF-073 Barcode Lookup

**Priority**

Critical

After scanning,

the application shall search the Product Catalog.

Lookup order:

1. Local Database
2. OpenFoodFacts
3. Manual Creation

---

## RF-074 Existing Product Recognition

**Priority**

Critical

If barcode already exists locally,

the existing Product shall be reused.

Duplicate Products shall never be created.

---

## RF-075 Unknown Barcode

**Priority**

Critical

If barcode is unknown,

the application shall retrieve product information from OpenFoodFacts.

If unavailable,

manual creation shall begin automatically.

---

## RF-076 Barcode Validation

**Priority**

Medium

The application shall validate barcode format before processing.

Supported formats depend on scanner capabilities.

Examples

- EAN-13
- UPC-A
- UPC-E

---

## RF-077 Duplicate Barcode Prevention

**Priority**

Critical

Only one Product may own a specific barcode.

Attempts to assign duplicated barcodes shall be rejected.

---

## RF-078 Manual Barcode Assignment

**Priority**

Medium

Users may manually enter a barcode.

---

## RF-079 Barcode Editing

**Priority**

Medium

Existing barcodes may be modified.

Business Rules

Uniqueness must remain enforced.

---

## RF-080 Barcode History

**Priority**

Low

Barcode changes shall be recorded in Audit History.

---

# 14 Product Search

The application shall provide fast product search.

Search is expected to be the primary navigation mechanism.

---

## RF-081 Search by Name

**Priority**

Critical

Users shall search products by name.

Search shall begin while typing.

---

## RF-082 Search by Barcode

**Priority**

Critical

Barcode values shall be searchable.

---

## RF-083 Search by Brand

**Priority**

Medium

Users shall search products by Brand.

---

## RF-084 Search by Category

**Priority**

Medium

Users shall filter products by Category.

---

## RF-085 Search by Location

**Priority**

Medium

Users shall filter products by Location.

---

## RF-086 Search by Shelf

**Priority**

Medium

Users shall filter products by Shelf.

---

## RF-087 Search by Expiration

**Priority**

Medium

Users shall search inventory using expiration dates.

Examples

- Expired
- Today
- Next 7 days
- Next 30 days

---

## RF-088 Favorites

**Priority**

Low

Users may mark Products as favorites.

Favorites shall appear first in search results.

---

## RF-089 Recently Used

**Priority**

High

Recently consumed or purchased Products shall be prioritized in search results.

---

## RF-090 Intelligent Ranking

**Priority**

High

Search results shall be ranked using the following priority:

1. Exact match
2. Recently used
3. Frequently consumed
4. Favorites
5. Alphabetical order

The ranking algorithm shall execute locally and work without Internet connectivity.


# 15 Product Detail

The Product Detail screen is the central place to inspect a product, its current inventory, history and available actions.

---

## RF-091 Product Detail

**Priority**

Critical

### Description

Users shall view complete information about a Product.

### Information Displayed

- Product Name
- Brand
- Presentation
- Category
- Barcode
- Product Photo
- Current Stock
- Number of Batches
- Threshold
- Target Quantity

### Acceptance Criteria

The Product Detail screen loads in less than one second using local data.

---

## RF-092 Inventory Batches

**Priority**

Critical

The Product Detail screen shall display every active Inventory Batch.

Each batch displays:

- Quantity
- Expiration Date
- Location
- Shelf

---

## RF-093 Inventory Actions

**Priority**

Critical

The Product Detail screen shall expose the following actions:

- Consume
- Register Purchase
- Adjust Inventory
- Relocate
- View History

---

## RF-094 Batch Detail

**Priority**

Medium

Users shall inspect the complete information of an Inventory Batch.

---

## RF-095 Batch Notes

**Priority**

Low

Users may edit notes attached to an Inventory Batch.

---

## RF-096 Product Availability

**Priority**

Critical

The application shall clearly indicate whether the Product is:

- In Stock
- Low Stock
- Out of Stock

---

## RF-097 Product Status Color

**Priority**

Medium

Product status shall use semantic colors.

Example

- Green → Available
- Orange → Low Stock
- Red → Out of Stock

The actual color palette is defined in the Design System.

---

## RF-098 Expiration Indicator

**Priority**

Critical

Products approaching expiration shall display a visual warning.

Warning thresholds are configurable.

---

## RF-099 Batch Sorting

**Priority**

Medium

Inventory Batches shall be sortable by:

- Expiration
- Quantity
- Creation Date
- Location

---

## RF-100 Product History Shortcut

**Priority**

High

The Product Detail screen shall provide direct access to the complete movement history.

---

# 16 Product Relocation

Inventory may be physically relocated without changing ownership.

---

## RF-101 Move Inventory

**Priority**

Critical

Users shall move Inventory between Shelves.

Business Rules

Moving Inventory never creates a new Product.

---

## RF-102 Move Between Locations

**Priority**

Critical

Inventory may move between Locations.

Example

```
Storage Room

↓

Kitchen
```

---

## RF-103 Partial Relocation

**Priority**

High

Users may relocate only part of a Batch.

Example

```
Current

10

↓

Move 4

↓

Storage

6

Kitchen

4
```

---

## RF-104 Full Relocation

**Priority**

Critical

Users may move an entire Batch.

---

## RF-105 Relocation History

**Priority**

Critical

Every relocation shall generate an Inventory Movement.

---

## RF-106 Relocation Audit

**Priority**

Critical

Audit records shall include:

- Previous Location
- Previous Shelf
- New Location
- New Shelf

---

## RF-107 Destination Validation

**Priority**

Critical

Destination Shelf must belong to the selected Location.

---

## RF-108 Empty Shelf Support

**Priority**

Critical

Inventory may be relocated to an empty Shelf.

---

## RF-109 Batch Merge

**Priority**

Medium

If relocation creates two identical batches
(same Product, Expiration, Location and Shelf),

the system shall automatically merge them.

---

## RF-110 Relocation Undo

**Priority**

Medium

Immediately after relocation,
users may undo the operation.

Undo creates a new Inventory Movement.

---

# 17 Expiration Management

Expiration is tracked per Inventory Batch.

---

## RF-111 Expiration Date

**Priority**

Critical

Every Inventory Batch may define an Expiration Date.

Expiration Date is optional.

---

## RF-112 Expired Inventory

**Priority**

Critical

Expired Inventory shall remain visible until consumed,
discarded or adjusted.

The system never removes expired inventory automatically.

---

## RF-113 Days Remaining

**Priority**

High

The application shall calculate remaining days before expiration.

---

## RF-114 Expiration Warning

**Priority**

Critical

Users shall receive warnings before expiration.

Default warning period

```
30 days
```

Configurable.

---

## RF-115 Expired Status

**Priority**

Critical

Expired Inventory shall display a distinct status.

---

## RF-116 Expiration Filters

**Priority**

Medium

Users shall filter Inventory by:

- Expired
- Expires Today
- Next 7 Days
- Next 30 Days
- Next 90 Days

---

## RF-117 Consume Expired Product

**Priority**

Medium

The application shall allow consuming expired products after explicit confirmation.

---

## RF-118 Discard Expired Product

**Priority**

High

Users shall discard expired inventory.

Business Rules

Discarding inventory creates:

- Inventory Movement
- Audit Record

---

## RF-119 Expiration Statistics

**Priority**

Medium

Expired Inventory shall contribute to statistics.

Examples

- Products Expired
- Quantity Lost
- Expiration Rate

---

## RF-120 Expiration History

**Priority**

Medium

The application shall permanently store expiration-related events.

History shall include:

- Product
- Batch
- User
- Timestamp
- Quantity

---

# 18 Audit & Activity History

The Audit subsystem records every business operation performed within the application.

Audit information is immutable and intended for traceability, diagnostics and accountability.

Audit records are different from Inventory Movements.

Inventory Movements describe changes in stock.

Audit records describe changes made to the system.

---

## RF-121 Audit Record Creation

**Priority**

Critical

### Description

Every operation modifying business data shall create an Audit Record.

### Operations Included

- Product Creation
- Product Update
- Purchase
- Consumption
- Adjustment
- Relocation
- Shopping Item Update
- Category Update
- Location Update
- Shelf Update

---

## RF-122 Audit Metadata

**Priority**

Critical

Every Audit Record shall contain:

- UUID
- Timestamp (UTC)
- User
- Device Identifier
- Entity
- Entity Identifier
- Action
- Previous State
- New State

---

## RF-123 Immutable Audit

**Priority**

Critical

Audit Records shall never be edited or deleted.

---

## RF-124 Before and After Values

**Priority**

Critical

Audit Records shall preserve the complete state before and after each modification.

---

## RF-125 Audit Search

**Priority**

Medium

Users shall search Audit Records using:

- User
- Product
- Date
- Entity
- Action

---

## RF-126 Audit Filters

**Priority**

Medium

Supported filters:

- Today
- Yesterday
- Last 7 Days
- Last 30 Days
- Custom Range

---

## RF-127 Product Activity Timeline

**Priority**

High

Each Product shall expose a chronological activity timeline.

Timeline includes:

- Purchases
- Consumptions
- Relocations
- Adjustments
- Expirations

---

## RF-128 User Activity Timeline

**Priority**

Medium

Users shall inspect operations performed by a specific Household member.

---

## RF-129 Household Activity Feed

**Priority**

High

The application shall expose a Household Activity Feed ordered by timestamp.

---

## RF-130 Audit Export

**Priority**

Low

Audit information may be exported to CSV.

---

# 19 Dashboard

The Dashboard provides a high-level summary of the Household inventory.

It is the default screen after authentication.

---

## RF-131 Dashboard Overview

**Priority**

Critical

The Dashboard shall display:

- Total Products
- Total Inventory Units
- Shopping List Count
- Low Stock Count
- Expiring Products
- Recently Updated Products

---

## RF-132 Shopping Summary

**Priority**

Critical

The Dashboard shall summarize current Shopping List.

---

## RF-133 Low Stock Summary

**Priority**

Critical

The Dashboard shall display products below their Threshold.

---

## RF-134 Expiration Summary

**Priority**

Critical

The Dashboard shall display products approaching expiration.

---

## RF-135 Recent Activity

**Priority**

High

The Dashboard shall display the latest Household activity.

Maximum items displayed:

20

---

## RF-136 Quick Actions

**Priority**

Critical

The Dashboard shall provide shortcuts for:

- Register Purchase
- Consume Product
- Voice Command
- Scan Barcode

---

## RF-137 Search Shortcut

**Priority**

Critical

The Dashboard shall expose global search.

---

## RF-138 Dashboard Refresh

**Priority**

High

Dashboard information shall automatically refresh whenever local inventory changes.

---

## RF-139 Dashboard Offline

**Priority**

Critical

The Dashboard shall operate entirely using local data.

Internet access shall not be required.

---

## RF-140 Dashboard Customization

**Priority**

Low

Users may reorder Dashboard cards.

---

# 20 Statistics

Statistics are generated entirely from Inventory Movements.

Inventory quantities shall never be used directly for historical statistics.

---

## RF-141 Consumption Statistics

**Priority**

High

The application shall calculate product consumption.

Supported periods:

- Week
- Month
- Year
- Custom Range

---

## RF-142 Purchase Statistics

**Priority**

High

The application shall calculate purchase frequency.

---

## RF-143 Most Consumed Products

**Priority**

High

The application shall rank products by consumption quantity.

---

## RF-144 Least Consumed Products

**Priority**

Medium

The application shall rank products with the lowest consumption.

---

## RF-145 Consumption by Category

**Priority**

High

Consumption shall be aggregated by Product Category.

---

## RF-146 Expiration Statistics

**Priority**

Medium

Statistics shall include:

- Expired Products
- Expired Quantity
- Waste Percentage

---

## RF-147 Inventory Value

**Priority**

Low

If purchase prices become available in future versions,

the application shall calculate total inventory value.

---

## RF-148 Average Consumption Interval

**Priority**

Medium

The application shall calculate the average time between consumptions of each Product.

---

## RF-149 Product Lifetime

**Priority**

Medium

The application shall estimate how long a Product usually lasts before requiring replenishment.

---

## RF-150 Statistics Charts

**Priority**

High

Statistics shall be presented using interactive charts.

Minimum supported chart types:

- Bar Chart
- Line Chart
- Pie Chart

Charts shall operate entirely offline using locally available data.

---

# 21 Voice Commands

Voice interaction is a first-class feature of the application.

Users should be able to perform the most common daily actions without touching the screen.

The system shall prioritize natural language understanding over rigid command syntax.

---

## RF-151 Voice Recognition

**Priority**

High

### Description

The application shall allow users to dictate voice commands using the device microphone.

### Business Rules

- Recognition uses the native speech recognition service.
- Internet connectivity shall not be required whenever the operating system provides offline speech recognition.
- Voice recognition language follows the application language.

---

## RF-152 Natural Language

**Priority**

High

The application shall understand natural language.

Examples

```
I bought six Coke Zero.

Take one milk.

We finished the rice.

Move the coffee to Shelf B.

There are only two bottles of water left.

I bought three packs of pasta that expire in December.
```

---

## RF-153 Supported Intents

**Priority**

Critical

The minimum supported intents are:

- Register Purchase
- Consume Product
- Adjust Quantity
- Move Product
- Search Product
- Open Shopping List
- Show Statistics

---

## RF-154 Quantity Extraction

**Priority**

Critical

The system shall extract quantities expressed naturally.

Examples

```
one

two

half dozen

twelve

3

```

---

## RF-155 Product Identification

**Priority**

Critical

The system shall identify products using:

- Exact Name
- Similar Name
- Brand
- Historical Purchases
- Historical Consumption

---

## RF-156 Ambiguous Commands

**Priority**

Critical

If more than one product matches,

the application shall request clarification.

Example

```
Did you mean

• Coke Zero 1.5L

or

• Coke Zero 500ml
```

---

## RF-157 Voice Confirmation

**Priority**

High

Potentially destructive operations shall require confirmation.

Examples

- Inventory Adjustment
- Large Consumption
- Delete Draft

---

## RF-158 Voice Feedback

**Priority**

Medium

After successful execution,

the application shall provide confirmation.

Example

```
Three bottles of Coke Zero added successfully.
```

---

## RF-159 Voice Error Handling

**Priority**

Medium

If interpretation confidence is below the configured threshold,

the command shall not be executed automatically.

---

## RF-160 Voice History

**Priority**

Low

Voice commands may be stored locally for diagnostic purposes.

Storage is optional and configurable.

---

# 22 Artificial Intelligence

Artificial Intelligence enhances user experience but never replaces core business rules.

The application must remain fully functional without AI services.

---

## RF-161 AI Intent Recognition

**Priority**

Medium

AI may be used to interpret complex natural language.

Business Rules

- AI receives only the minimum information required.
- Inventory data shall not be unnecessarily transmitted.

---

## RF-162 Product Suggestions

**Priority**

Medium

When recognition confidence is low,

AI may suggest the most probable Product.

Suggestions shall consider:

- Purchase History
- Consumption History
- Frequently Used Products

---

## RF-163 Smart Search

**Priority**

Medium

AI may improve search relevance.

Examples

```
cola

↓

Coca-Cola Zero 1.5L
```

---

## RF-164 Purchase Suggestions

**Priority**

Low

AI may suggest products commonly purchased together.

Example

```
Coffee

↓

Sugar

↓

Milk
```

---

## RF-165 Inventory Insights

**Priority**

Low

AI may generate inventory insights.

Examples

- Unusual consumption
- Frequently expired products
- Products never consumed

---

## RF-166 Consumption Prediction

**Priority**

Low

AI may estimate future consumption trends.

---

## RF-167 Privacy

**Priority**

Critical

AI services shall never receive:

- Authentication credentials
- User passwords
- Access tokens
- Sensitive household information

Only the minimum context necessary to perform the requested task may be transmitted.

---

## RF-168 AI Availability

**Priority**

Critical

Failure of AI services shall never prevent normal application usage.

---

## RF-169 AI Transparency

**Priority**

High

Whenever AI performs an interpretation,

users shall be able to review the interpreted action before execution.

---

## RF-170 AI Configuration

**Priority**

Medium

Users shall enable or disable AI-assisted features independently.

---

# 23 Notifications

Notifications help users proactively manage inventory.

---

## RF-171 Expiration Notification

**Priority**

High

Users shall receive notifications before products expire.

Default warning:

30 days

Configurable.

---

## RF-172 Low Stock Notification

**Priority**

High

Products reaching Threshold shall generate notifications.

---

## RF-173 Shopping Reminder

**Priority**

Medium

The application may remind users that items remain on the Shopping List.

---

## RF-174 Synchronization Notification

**Priority**

Medium

Synchronization failures shall generate notifications.

---

## RF-175 Household Activity Notification

**Priority**

Low

Users may receive notifications when another Household member performs inventory changes.

---

## RF-176 Notification Preferences

**Priority**

High

Users shall independently configure:

- Expiration Notifications
- Low Stock Notifications
- Shopping Notifications
- Synchronization Notifications
- Household Activity Notifications

---

## RF-177 Quiet Hours

**Priority**

Medium

Users may define Quiet Hours.

Notifications shall be delayed until the configured period ends.

---

## RF-178 Notification History

**Priority**

Low

The application shall keep a local history of generated notifications.

---

## RF-179 Notification Actions

**Priority**

Medium

Notifications may expose quick actions.

Examples

- Register Purchase
- Consume Product
- Open Shopping List
- View Product

---

## RF-180 Local Notifications

**Priority**

Critical

Expiration and Threshold notifications shall work entirely offline using scheduled local notifications.

---


# 24 Offline Operation

Offline capability is a core architectural principle.

The application shall remain fully functional without Internet connectivity.

The local database is the primary data source.

---

## RF-181 Offline Availability

**Priority**

Critical

### Description

The application shall allow users to perform all daily inventory operations while offline.

### Supported Offline Operations

- Login using an existing session
- Browse Products
- Search Products
- Register Purchases
- Register Consumption
- Inventory Adjustment
- Product Relocation
- Shopping List
- Statistics
- Dashboard
- Barcode Scan (except remote lookup)
- Notifications

---

## RF-182 Local Database

**Priority**

Critical

The local database shall be the authoritative data source for the application.

Remote services shall never be queried before consulting the local database.

---

## RF-183 Local Persistence

**Priority**

Critical

Every modification shall be committed to the local database before synchronization.

---

## RF-184 Offline Product Creation

**Priority**

Critical

Users shall create Products while offline.

Synchronization shall occur automatically when connectivity returns.

---

## RF-185 Offline Purchase Registration

**Priority**

Critical

Purchases shall be fully supported while offline.

---

## RF-186 Offline Consumption

**Priority**

Critical

Consumption shall be fully supported while offline.

---

## RF-187 Offline Shopping List

**Priority**

Critical

Shopping List shall remain available while offline.

---

## RF-188 Offline Statistics

**Priority**

Critical

Statistics shall be generated exclusively from local data whenever Internet is unavailable.

---

## RF-189 Offline Search

**Priority**

Critical

Product Search shall never require Internet connectivity.

---

## RF-190 Offline Queue

**Priority**

Critical

Every modification performed while offline shall be placed into the Synchronization Queue.

---

# 25 Synchronization

Synchronization guarantees eventual consistency between all Household devices.

Synchronization shall occur automatically.

---

## RF-191 Automatic Synchronization

**Priority**

Critical

The application shall automatically synchronize pending changes whenever connectivity becomes available.

---

## RF-192 Manual Synchronization

**Priority**

Medium

Users may manually trigger synchronization.

---

## RF-193 Background Synchronization

**Priority**

High

Synchronization shall occur in the background whenever possible.

---

## RF-194 Incremental Synchronization

**Priority**

Critical

Only pending changes shall be synchronized.

The complete database shall never be uploaded unnecessarily.

---

## RF-195 Bidirectional Synchronization

**Priority**

Critical

Synchronization shall upload local changes and download remote changes during the same synchronization cycle.

---

## RF-196 Synchronization Order

**Priority**

Critical

Synchronization shall preserve event order.

Events generated earlier shall be synchronized first.

---

## RF-197 Synchronization Retry

**Priority**

Critical

Failed synchronization attempts shall be retried automatically using exponential backoff.

---

## RF-198 Conflict Detection

**Priority**

Critical

The synchronization engine shall detect conflicting modifications.

Examples

- Same Inventory Batch edited on multiple devices.
- Same Product updated simultaneously.

---

## RF-199 Conflict Resolution

**Priority**

Critical

Conflicts shall be resolved according to business rules.

Resolution strategy:

1. Merge when modifications affect different fields.
2. Merge inventory operations when mathematically possible.
3. Request user intervention only when automatic resolution is impossible.

Data loss shall never occur silently.

---

## RF-200 Synchronization Status

**Priority**

High

The application shall display synchronization status.

Supported states:

- Up to Date
- Pending
- Synchronizing
- Conflict
- Error

---

# 26 Realtime Collaboration

Multiple Household members may use the application simultaneously.

---

## RF-201 Live Inventory Updates

**Priority**

High

Inventory updates from other Household members shall appear automatically after synchronization.

---

## RF-202 Shopping List Updates

**Priority**

High

Shopping List changes shall synchronize automatically across devices.

---

## RF-203 Activity Feed Updates

**Priority**

Medium

Household Activity Feed shall refresh automatically when new movements are received.

---

## RF-204 Product Updates

**Priority**

Medium

Product Catalog modifications shall propagate automatically.

---

## RF-205 Category Updates

**Priority**

Medium

Category changes shall synchronize automatically.

---

## RF-206 Location Updates

**Priority**

Medium

Location and Shelf modifications shall synchronize automatically.

---

## RF-207 Concurrent Usage

**Priority**

Critical

Multiple users shall operate simultaneously without requiring manual synchronization.

---

## RF-208 Eventual Consistency

**Priority**

Critical

Given successful synchronization,

all Household devices shall converge to the same inventory state.

---

## RF-209 Synchronization Diagnostics

**Priority**

Medium

Users shall inspect synchronization information.

Minimum information:

- Last Synchronization
- Pending Events
- Failed Events
- Conflict Count

---

## RF-210 Remote Refresh

**Priority**

Medium

Users may manually refresh remote changes independently of uploading local modifications.

---

