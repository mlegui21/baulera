# Baulera - Evolution Log

**Document:** 28-evolution-log.md  
**Type:** Append-only system change specification  
**Scope:** Complete implementation changes (not just conceptual tracking)

This document is the single source of truth for *incremental system modifications*.  
Each entry is a **concentrated patch specification** describing exactly what must be added/changed across the existing 01–27 documents.

---

# 1. Evolution Principles

## EP-001 — Full Patch Specification
Each entry MUST describe:

- New concepts
- State changes
- Domain model updates
- UI behavior changes
- Sync engine modifications
- Database schema changes
- Required updates per document

---

## EP-002 — No Partial Descriptions
Entries are not summaries.  
They are **implementation-ready change sets**.

---

## EP-003 — Backward Compatibility
Core documents (01–27) remain unchanged except where explicitly indicated.

---

# 2. [2026-07] Store Scan Mode + Purchase Session System

---

## 2.1 Summary

Introduces a **Store Scan Mode** and **Purchase Session aggregate** to support real-world supermarket workflows where:

- Items are scanned continuously in-store
- Items are not immediately placed into inventory
- Final storage location is assigned later at home (Baulera)

This introduces a new domain stage:

```text
Scan → Purchase Session → Pending Placement → Inventory
```

2.2 NEW DOMAIN CONCEPTS (04-domain-model.md update)
ADD: PurchaseSession Aggregate
PurchaseSession
- id: UUID
- householdId: UUID
- status: Active | Completed | Abandoned
- storeContext: string (optional)
- startedAt: timestamp
- endedAt: timestamp
- items: PurchaseSessionItem[]
ADD: PurchaseSessionItem
PurchaseSessionItem
- id: UUID
- sessionId: UUID
- productId: UUID (nullable)
- barcode: string
- quantity: decimal
- state: Scanned | Purchased | PendingPlacement | Completed
- createdAt: timestamp
ADD: New Domain State (ShoppingItem extension)
PendingPlacement

Represents:

Purchased in store
Not yet assigned storage location in Baulera
UPDATE: Shopping Item Lifecycle (17-shopping-list.md)

Replace lifecycle with:

Suggested → Added → Active → Purchased → PendingPlacement → Completed
2.3 USE CASE ADDITION (05-use-cases.md)
ADD UC-SH-09: Store Scan Mode Shopping

Actor: User
Context: Supermarket

Flow:
User enters Store Scan Mode
User scans product repeatedly
System resolves product using local-first strategy
Item is added to Purchase Session
Item is marked as Purchased
Item enters PendingPlacement state
Session is stored locally or synced later
User later assigns storage location at home
Postconditions:
Purchase recorded
Inventory NOT updated yet
Items remain in PendingPlacement
2.4 ARCHITECTURE CHANGES (06-architecture.md)
ADD: PurchaseSession Service (Application Layer)
PurchaseSessionService
- createSession()
- addScannedItem()
- closeSession()
- reconcileSession()
ADD: New Bounded Context behavior
Shopping List → Intent layer
Purchase Session → Execution layer (real-world acquisition)
Inventory → Final state layer
2.5 DATABASE CHANGES (08-database-design.md)
ADD TABLE: purchase_sessions
CREATE TABLE purchase_sessions (
  id UUID PRIMARY KEY,
  household_id UUID NOT NULL,
  status TEXT NOT NULL,
  store_context TEXT,
  started_at TIMESTAMP NOT NULL,
  ended_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
ADD TABLE: purchase_session_items
CREATE TABLE purchase_session_items (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES purchase_sessions(id),
  product_id UUID NULL,
  barcode TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  state TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
UPDATE: Inventory update rule

Inventory MUST NOT be updated at scan time.

Inventory updates occur ONLY when:

PendingPlacement → Completed
2.6 SYNC ENGINE CHANGES (11-sync-engine.md)
ADD EVENT TYPES
PurchaseSessionCreated
PurchaseSessionItemScanned
PurchaseSessionItemUpdated
PurchaseSessionCompleted
ProductPlacementConfirmed
ADD RULE: Session grouping

All scan events MUST:

Belong to a session
Preserve order
Be replayable offline
Be applied atomically when possible
ADD RULE: PendingPlacement consistency

PendingPlacement items MUST NOT:

Modify inventory
Trigger consumption events
Trigger statistics updates until finalized
2.7 OFFLINE-FIRST CHANGES (10-offline-first.md)
ADD RULE: Scan resolution priority
1. Local product DB
2. Local cached metadata
3. External API (online only)
4. Minimal fallback product
ADD RULE: Offline scan behavior
Sessions can be created offline
Items can be scanned offline
Sync preserves session structure exactly
No loss of scan order allowed
2.8 PRODUCTS MODULE CHANGES (16-products.md)
MODIFY: Barcode workflow

Replace existing barcode flow with:

Scan Barcode
→ Local lookup (priority)
→ If found → open product
→ If not found:
   → minimal product OR deferred enrichment
ADD: Store Scan Mode behavior
Scanned items in store belong to PurchaseSession
They are NOT immediately inventory updates
They remain PendingPlacement until confirmed at home
2.9 SHOPPING LIST CHANGES (17-shopping-list.md)
ADD: new state
PendingPlacement
MODIFY lifecycle
Suggested → Added → Active → Purchased → PendingPlacement → Completed
ADD RULE

Shopping List MUST NOT directly update inventory when Store Scan Mode is active.

2.10 UI/UX CHANGES (14-ui-ux.md)
ADD SCREEN: Store Scan Mode

Features:

Continuous barcode scanning
Session-based grouping
No navigation interruptions
Lightweight confirmations
Session summary screen
UX RULE
No modal interruptions during scan mode
Single-tap scan repetition
Batch review at session end
2.11 SECURITY / INTEGRITY RULES (12-security.md implicit update)
ADD RULE

PurchaseSession events:

Must be immutable after sync
Must preserve audit trail
Must prevent duplicate inventory application
2.12 BUSINESS RULES SUMMARY
BR-PS-001

PurchaseSession groups all store scans.

BR-PS-002

Inventory is NOT updated during scanning.

BR-PS-003

PendingPlacement is mandatory before final inventory update.

BR-PS-004

Local product resolution is always prioritized.

BR-PS-005

External APIs are optional enrichment only.

BR-PS-006

Scan order must never be lost across sync.

3. [2026-07] Barcode Resolution Enhancement
3.1 Summary

Enforces strict local-first barcode resolution strategy.

3.2 CHANGE: Resolution priority
1. Local DB
2. Cached metadata
3. OpenFoodFacts (online only)
4. Fallback product creation
3.3 IMPACTED MODULES
10-offline-first.md
16-products.md
3.4 RULE

Barcode scanning must NEVER depend on external APIs when local match exists.

4. SYSTEM-WIDE IMPACT SUMMARY
New System Flow
SCAN
  ↓
PurchaseSession
  ↓
PendingPlacement
  ↓
Inventory Finalization
New System Capabilities
Supermarket continuous scanning
Offline scan reliability
Deferred inventory assignment
Session-based purchase tracking
Strict separation of purchase vs storage
5. STATUS
Feature	Status
PurchaseSession	Defined
Store Scan Mode	Defined
PendingPlacement	Defined
Barcode Enhancement	Defined
6. FINAL NOTE

This evolution log is not descriptive.

It is an implementation contract that fully specifies:

what must be added
where it must be added
how existing systems change
how data flows are modified
how offline + sync behave
