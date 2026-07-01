# Baulera

**Document:** 02-functional-requirements.md  
**Part:** 1 of 8  
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

---

# End of Part 1
