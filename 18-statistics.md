# Baulera

**Document:** 18-statistics.md

**Title:** Statistics Module

**Version:** 1.0

---

# 1 Purpose

The Statistics module defines how Baulera transforms raw product, inventory, shopping, and consumption events into meaningful insights.

It aggregates domain events into structured metrics that help users understand:

- Consumption patterns
- Purchase behavior
- Inventory efficiency
- Waste reduction
- Cost trends
- Household usage habits

---

# 2 Objectives

The Statistics module must:

- Provide real-time and historical insights.
- Operate fully offline using local aggregation.
- Synchronize aggregated and raw data consistently.
- Support flexible filtering (time, category, product).
- Enable dashboard and reporting features.
- Remain performant at large data scale.

---

# 3 Scope

Included:

- Consumption statistics
- Purchase statistics
- Inventory trends
- Expiration and waste tracking
- Category-based analytics
- Product-level analytics
- Household-level analytics
- Time-based aggregation

Not included:

- External financial integrations
- Banking or payment analysis
- Predictive financial modeling (future AI module)

---

# 4 Domain Model

Statistics are derived from domain events:

```text
Product Events
Shopping Events
Inventory Events
Batch Events
```

These events are aggregated into:

```text
Statistic Records
Aggregates
KPI Metrics
Time Series Data
```

---

# 5 Statistics Philosophy

The Statistics module follows strict principles:

- Statistics are derived, never manually entered.
- Raw events are the source of truth.
- Aggregations are reproducible.
- Offline calculations must match server results.
- No loss of granularity at the source level.

---

# 6 Core Entities

## 6.1 Statistic

Represents an aggregated metric.

Attributes:

- StatisticId
- HouseholdId
- Type
- Scope
- Value
- TimeRange
- GeneratedAt

---

## 6.2 Metric Types

| Type | Description |
|------|-------------|
| Consumption | Quantity used |
| Purchase | Quantity acquired |
| Waste | Expired or discarded items |
| Inventory | Current stock levels |
| Frequency | Usage patterns |
| Cost | Spending data (optional) |

---

## 6.3 Time Granularity

Supported time ranges:

- Daily
- Weekly
- Monthly
- Yearly
- Custom range

Granularity depends on query type and performance constraints.

---

# 7 Aggregation Model

Statistics are computed using a layered aggregation model:

```text
Raw Events
   ↓
Local Aggregation
   ↓
Cached Metrics
   ↓
Server Aggregation
   ↓
Final Reports
```

Each layer improves performance while preserving correctness.

---

# 8 Offline Statistics

All statistics must be computed locally when offline.

Behavior:

- Events are stored locally.
- Aggregations are recalculated incrementally.
- UI displays cached values.
- Sync merges and reconciles differences.

Offline statistics must match server output after synchronization.

---

# End of Part 1
