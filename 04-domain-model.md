# Baulera

**Document:** 04-domain-model.md  
**Version:** 1.0  
**Status:** Final  
**Last Updated:** 2026-07-01

---

# 1. Introduction

## 1.1 Purpose

This document defines the **Domain Model** for Baulera.

The domain model represents the business concepts independently of:

- Flutter
- Supabase
- SQLite / Drift
- REST APIs
- UI
- Infrastructure

It is the heart of the application and the single source of truth for business rules.

---

## 1.2 Design Principles

The domain model follows the principles of:

- Domain-Driven Design (DDD)
- Clean Architecture
- Offline First
- Event-Based Inventory
- Immutable History
- High Cohesion
- Low Coupling

Business rules belong exclusively to the Domain Layer.

---

# 2 Domain Overview

The domain models a household inventory stored in a pantry or storage room ("Baulera").

The application tracks:

- Products
- Physical inventory
- Inventory batches
- Purchases
- Consumption
- Shopping suggestions
- Expiration dates
- Audit history

The inventory is shared by one Household.

---

# 3 Ubiquitous Language

The following terminology shall be used consistently throughout the project.

| Term | Definition |
|------|------------|
| Household | Shared workspace containing users, products and inventory. |
| Product | Permanent definition of an item independent of stock. |
| Inventory | Current physical stock. |
| Inventory Batch | Physical quantity of a Product sharing expiration and location. |
| Movement | Immutable stock operation. |
| Audit Record | Immutable business history. |
| Shopping Item | Suggested purchase. |
| Threshold | Minimum acceptable stock. |
| Target Quantity | Desired stock after replenishment. |
| Location | Physical area where products are stored. |
| Shelf | Subdivision of a Location. |

These names shall be used consistently in:

- Source Code
- Database
- Documentation
- APIs
- Tests

---

# 4 Bounded Contexts

The system is divided into cohesive business contexts.

---

## 4.1 Household Context

Responsible for:

- Household
- Members
- Shared configuration

Aggregate Root

```
Household
```

---

## 4.2 Catalog Context

Responsible for permanent product definitions.

Aggregate Root

```
Product
```

Contains

- Brand
- Category
- Presentation
- Barcode

---

## 4.3 Inventory Context

Responsible for physical stock.

Aggregate Root

```
InventoryBatch
```

Contains

- Quantity
- Expiration
- Location
- Shelf

---

## 4.4 Shopping Context

Responsible for purchase planning.

Aggregate Root

```
ShoppingItem
```

---

## 4.5 Statistics Context

Read-only context.

Consumes

- Inventory Movements
- Audit Records

Produces

- Charts
- Reports
- Metrics

---

## 4.6 Synchronization Context

Responsible for

- Offline Queue
- Sync Events
- Conflict Resolution

---

# 5 Aggregate Roots

Only Aggregate Roots may be referenced from outside their aggregate.

---

## Household

Responsibilities

- Members
- Configuration
- Ownership

Children

- HouseholdMember

---

## Product

Responsibilities

- Product Identity
- Product Metadata
- Threshold
- Target Quantity

Children

- ProductImage

---

## InventoryBatch

Responsibilities

- Current Quantity
- Expiration
- Shelf
- Location

Children

- Batch Notes

---

## ShoppingItem

Responsibilities

- Suggested Quantity
- Status

---

## InventoryMovement

Responsibilities

- Immutable inventory history

---

## AuditRecord

Responsibilities

- Immutable audit history

---

# 6 Domain Entities

The following entities exist in the system.

---

## Household

Represents a family inventory.

### Identity

```
HouseholdId
```

### Attributes

- Name
- CreatedAt
- UpdatedAt

---

## HouseholdMember

Represents a user inside a Household.

Attributes

- UserId
- DisplayName
- Email
- Role

---

## Product

Represents a catalog item.

A Product exists even if inventory equals zero.

Attributes

- ProductId
- Name
- Brand
- Category
- Presentation
- Barcode
- Threshold
- TargetQuantity
- PhotoUrl

---

## InventoryBatch

Represents physical stock.

Attributes

- BatchId
- ProductId
- Quantity
- ExpirationDate
- LocationId
- ShelfId

---

## InventoryMovement

Represents an immutable stock operation.

Attributes

- MovementId
- BatchId
- Quantity
- Type
- Timestamp
- UserId

---

## ShoppingItem

Represents a suggested purchase.

Attributes

- ShoppingItemId
- ProductId
- SuggestedQuantity
- Status

---

## AuditRecord

Represents immutable business history.

Attributes

- AuditId
- Entity
- EntityId
- Action
- Before
- After
- Timestamp

---

## Category

Product classification.

Examples

- Beverages
- Dairy
- Frozen Food

---

## Brand

Manufacturer.

Examples

- Coca-Cola
- Nestlé
- La Serenísima

---

## Location

Physical storage area.

Examples

- Pantry
- Storage Room
- Kitchen

---

## Shelf

Subdivision of a Location.

Example

```
Pantry

↓

Top Shelf

↓

Middle Shelf

↓

Bottom Shelf
```

---

# 7 Value Objects

Value Objects are immutable.

They have no identity.

---

## Barcode

Represents

```
7790895000999
```

Rules

- Immutable
- Validated

---

## Presentation

Examples

```
500 ml

1.5 L

750 g

12 units
```

---

## Quantity

Represents inventory amount.

Rules

- Cannot be negative.

---

## Threshold

Minimum desired stock.

Example

```
Milk

Threshold

3
```

---

## TargetQuantity

Desired stock after shopping.

Rules

Must be greater than or equal to Threshold.

---

## ExpirationDate

Represents the expiration of an Inventory Batch.

May be absent.

---

## ProductName

Immutable textual representation of the Product.

Normalization rules:

- Trim leading/trailing whitespace.
- Collapse consecutive spaces.
- Preserve original casing for display.
- Store normalized value for search.

---

## EmailAddress

Represents a validated email address associated with a Household Member.

Rules

- RFC-compliant validation.
- Stored in lowercase.
- Immutable after creation unless explicitly updated.

---

## UserRole

Represents permissions within a Household.

Supported values

- Administrator

Future values

- Editor
- Viewer

---


# 8 Aggregate Boundaries

Aggregate boundaries define transaction consistency.

Business rules shall always be enforced inside an Aggregate.

Communication between Aggregates occurs through identifiers or Domain Events.

---

## Household Aggregate

### Aggregate Root

```
Household
```

### Contains

- Household
- HouseholdMember

### Responsibilities

- Membership
- Ownership
- Shared configuration

### Invariants

- A Household must have at least one Administrator.
- Members belong to exactly one Household.
- Household deletion is not allowed.

---

## Product Aggregate

### Aggregate Root

```
Product
```

### Contains

- Product

### References

- Category
- Brand

### Responsibilities

- Product identity
- Product metadata
- Purchase thresholds

### Invariants

- Product name cannot be empty.
- Barcode is unique inside a Household.
- Threshold ≥ 0.
- Target Quantity ≥ Threshold.

---

## Inventory Aggregate

### Aggregate Root

```
InventoryBatch
```

### Contains

- InventoryBatch

### References

- Product
- Shelf

### Responsibilities

- Physical inventory
- Current quantity
- Expiration

### Invariants

- Quantity ≥ 0.
- Product reference is mandatory.
- Shelf reference is mandatory.
- Expiration belongs to the Batch, never to the Product.

---

## Shopping Aggregate

### Aggregate Root

```
ShoppingItem
```

### Responsibilities

- Purchase suggestion
- Suggested quantity
- Status

### Invariants

- Suggested Quantity > 0.
- Product reference is mandatory.

---

## Audit Aggregate

### Aggregate Root

```
AuditRecord
```

### Responsibilities

- Immutable business history

### Invariants

Audit records are append-only.

---

# 9 Entity Relationships

---

## Household → HouseholdMember

Relationship

```
Household

1

↓

*

HouseholdMember
```

Rules

- Every member belongs to one Household.
- A Household contains multiple members.

---

## Household → Product

```
Household

1

↓

*

Product
```

Products are private to a Household.

---

## Household → Category

```
Household

1

↓

*

Category
```

Categories are Household-specific.

Future versions may support shared categories.

---

## Household → Brand

```
Household

1

↓

*

Brand
```

Brands are reusable.

---

## Household → Location

```
Household

1

↓

*

Location
```

---

## Location → Shelf

```
Location

1

↓

*

Shelf
```

A Shelf cannot exist without a Location.

---

## Category → Product

```
Category

1

↓

*

Product
```

Every Product belongs to one Category.

---

## Brand → Product

```
Brand

1

↓

*

Product
```

Brand is optional.

---

## Product → InventoryBatch

```
Product

1

↓

*

InventoryBatch
```

Multiple batches represent different physical lots.

---

## Product → ShoppingItem

```
Product

1

↓

0..1

ShoppingItem
```

Business Rule

Only one active Shopping Item may exist for a Product.

---

## InventoryBatch → InventoryMovement

```
InventoryBatch

1

↓

*

InventoryMovement
```

Inventory history is immutable.

---

## Product → AuditRecord

```
Product

1

↓

*

AuditRecord
```

Indirect relationship through EntityId.

---

# 10 Cardinality Summary

| Parent | Child | Cardinality |
|---------|--------|------------|
| Household | HouseholdMember | 1 : N |
| Household | Product | 1 : N |
| Household | Category | 1 : N |
| Household | Brand | 1 : N |
| Household | Location | 1 : N |
| Location | Shelf | 1 : N |
| Category | Product | 1 : N |
| Brand | Product | 0..1 : N |
| Product | InventoryBatch | 1 : N |
| Product | ShoppingItem | 1 : 0..1 |
| InventoryBatch | InventoryMovement | 1 : N |

---

# 11 Composition

Some entities cannot exist independently.

---

## Household owns Members

Composition

```
Household

◆──── HouseholdMember
```

Deleting a Household would delete all members.

Although Household deletion is currently prohibited.

---

## Location owns Shelves

```
Location

◆──── Shelf
```

Shelf lifetime depends on Location.

---

## Product owns Inventory

No.

Inventory references Product.

Deleting Product does not remove Inventory History.

---

## Inventory owns Movements

No.

Movements remain forever.

InventoryBatch may reach zero.

History remains immutable.

---

# 12 Reference Rules

References across Aggregates shall use identifiers only.

Correct

```
InventoryBatch

↓

ProductId
```

Incorrect

```
InventoryBatch

↓

Complete Product Object
```

Reason

Keeps Aggregates independent.

---

# 13 Identity Rules

Every Entity uses UUID.

Examples

```
ProductId

InventoryBatchId

MovementId

AuditId

HouseholdId
```

Identifiers never change.

---

# 14 Lifecycle Rules

---

## Product Lifecycle

```
Created

↓

Updated

↓

Archived

↓

Still Available For History
```

Products are never physically deleted.

---

## Inventory Batch Lifecycle

```
Created

↓

Updated

↓

Quantity Zero

↓

Archived
```

Batch history remains.

---

## Shopping Item Lifecycle

```
Suggested

↓

Selected

↓

Purchased

↓

Completed
```

Alternative

```
Suggested

↓

Ignored
```

---

## Audit Record Lifecycle

```
Created

↓

Immutable Forever
```

---

## Inventory Movement Lifecycle

```
Created

↓

Immutable Forever
```

---

# 15 Entity Business Rules

## Product

- Product Name is required.
- Threshold cannot be negative.
- Target Quantity cannot be below Threshold.
- Barcode must be unique within the Household.
- Presentation is required.
- Category is required.

---

## InventoryBatch

- Quantity cannot be negative.
- Shelf is required.
- Product is required.
- Expiration Date is optional.
- A Batch with quantity zero is considered inactive but retained.

---

## ShoppingItem

- Suggested Quantity must be positive.
- Product is mandatory.
- Only one active Shopping Item per Product.
- Completing a Shopping Item never deletes it; it transitions to a completed state for historical purposes.

---

## HouseholdMember

- Email must be unique within the Household.
- Role is mandatory.
- At least one Administrator must always exist.

---

## Shelf

- Shelf name must be unique within its Location.
- Shelf cannot exist without a Location.

---

# 16 Domain Constraints

The following constraints apply globally.

### DC-001

A Product cannot exist without a Household.

---

### DC-002

Inventory cannot exist without a Product.

---

### DC-003

A Shelf cannot exist without a Location.

---

### DC-004

Every Inventory Movement belongs to exactly one Inventory Batch.

---

### DC-005

Audit Records are immutable.

---

### DC-006

Inventory Movements are immutable.

---

### DC-007

Historical data shall never be physically deleted.

---

### DC-008

Every inventory modification generates:

- Inventory Movement
- Audit Record
- Synchronization Event

---

### DC-009

Threshold and Target Quantity belong to the Product definition, never to an Inventory Batch.

---

### DC-010

Inventory quantity is always calculated from the current state of active Inventory Batches.

Historical movements are used for auditing and statistics, not for reconstructing current inventory in the initial implementation.

---

