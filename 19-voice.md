# Baulera

**Document:** 19-voice.md  
**Title:** Voice Interaction Module  
**Version:** 1.0  

---

# 1. Purpose

The Voice module enables hands-free interaction with the Baulera system.

It allows users to:

- Add products to Shopping List
- Control Shopping List items
- Trigger Purchase Session actions
- Query inventory and products
- Operate in offline-constrained environments (partial support)

---

# 2. Scope

Included:

- Voice command recognition
- Intent mapping to domain actions
- Shopping List voice actions
- Product scanning triggers (indirect)
- Purchase Session interactions (Store Scan Mode support)
- Offline queued voice commands

Not included:

- Continuous ambient listening
- Multi-user voice identification
- Real-time conversation AI assistant (handled in AI module)

---

# 3. Voice Command Model

Voice input follows a strict pipeline:

```text
Audio Input
  ↓
Speech-to-Text
  ↓
Intent Parser
  ↓
Domain Command Mapper
  ↓
Event Generation
  ↓
Sync Queue (if offline)
```

---

# 4. Supported Command Categories

## 4.1 Shopping Commands

Examples:

- "Add milk to shopping list"
- "Remove eggs"
- "Mark rice as purchased"

Maps to:

- ShoppingItemCreated
- ShoppingItemRemoved
- ShoppingItemUpdated

---

## 4.2 Inventory Commands

Examples:

- "How much milk do I have?"
- "Check rice stock"

Maps to:

- InventoryQueryEvent

---

## 4.3 Product Commands

Examples:

- "Open milk product"
- "Scan this barcode" (if connected device supports camera)

Maps to:

- ProductLookupEvent
- ProductScanEvent

---

## 4.4 Purchase Session Commands (NEW)

Supports Store Scan Mode.

Examples:

- "Start shopping session"
- "Add this item"
- "Finish shopping"

Maps to:

- PurchaseSessionCreated
- PurchaseSessionItemScanned
- PurchaseSessionCompleted

---

# 5. Voice + Store Scan Mode Integration

Voice and scanning share the same domain model.

Rule:

> Voice commands in Store Scan Mode behave as scan events.

Example:

```text
Voice: "Add milk"
→ Treated as scanned item in PurchaseSession (if active)
```

---

# 6. Offline Voice Behavior

Voice system must support partial offline operation:

- Speech-to-text may be offline (device dependent)
- Intent parsing must work locally
- Events are queued if sync is unavailable

Offline limitations:

- No external product resolution
- No AI-based disambiguation
- Reduced vocabulary fallback mode

---

# 7. Intent Mapping Rules

Voice input is NOT interpreted freely.

It follows deterministic mapping:

| Input | Domain Action |
|------|--------------|
| Add item | ShoppingItemCreated |
| Remove item | ShoppingItemRemoved |
| Mark purchased | ShoppingItemPurchased |
| Start session | PurchaseSessionCreated |
| Finish session | PurchaseSessionCompleted |

---

# 8. Error Handling

Voice errors must be handled gracefully:

- Unrecognized command → request clarification
- Ambiguous product → fallback to search or manual confirmation
- Offline resolution failure → queue event

---

# 9. Performance Constraints

- Intent resolution must be near real-time (<300ms locally)
- Offline mode must not block UI
- Voice pipeline must not interrupt scanning flow
- No dependency on external APIs for core commands

---

# 10. Integration Points

- 17-shopping-list.md → item manipulation
- 16-products.md → product lookup
- 11-sync-engine.md → event dispatch
- 10-offline-first.md → queued voice events
- 28-evolution-log.md → Purchase Session voice support

---

# 11. Voice System Principles

- Voice is a shortcut to domain actions, not a separate system
- All voice actions must map to existing events
- Offline voice must degrade gracefully
- No free-form AI interpretation in core mode
- Store Scan Mode voice must align with scanning semantics
- Voice never bypasses PendingPlacement logic

---

# End of Document
