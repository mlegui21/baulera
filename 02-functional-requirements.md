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
