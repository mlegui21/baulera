# Baulera

**Document:** 18-statistics.md  
**Title:** Statistics Module  
**Version:** 1.0  

---

# 1. Purpose

The Statistics module provides insights into:

- Consumption behavior
- Shopping patterns
- Inventory usage
- Household trends
- Product lifecycle efficiency

It transforms raw events into meaningful aggregated metrics.

---

# 2. Scope

Included:

- Consumption analytics
- Shopping frequency analysis
- Product usage statistics
- Inventory turnover
- Category-based insights
- Time-based trends

Not included:

- Financial reporting
- External market analysis
- Predictive AI recommendations (handled in AI module)

---

# 3. Data Sources

Statistics are derived from event streams:

- Inventory events
- Shopping List events
- Purchase events
- Product lifecycle events
- Sync engine events

All statistics MUST be event-driven.

---

# 4. Core Metrics

## 4.1 Consumption Rate

Measures how fast products are consumed.

```text
Consumption Rate = Units consumed / Time period
```

---

## 4.2 Purchase Frequency

How often items are added to shopping list or purchased.

- Weekly
- Monthly
- Category-based frequency

---

## 4.3 Inventory Turnover

Tracks how quickly inventory is replaced.

```text
Turnover = Purchases / Average Stock
```

---

## 4.4 Waste Indicators

Identifies inefficiencies:

- Expired products
- Over-purchased items
- Unused stock

---

# 5. Aggregation Model

Statistics are computed using:

- Event streams (primary source)
- Cached aggregates (performance layer)
- Periodic recomputation jobs

Rules:

- Raw events are immutable
- Aggregates are derived and replaceable
- Recalculation must not lose historical fidelity

---

# 6. Time Windows

Statistics can be computed over:

- Daily
- Weekly
- Monthly
- Yearly
- Custom ranges

Time windows are always configurable.

---

# 7. Category-Based Analytics

All metrics can be grouped by category:

- Food
- Dairy
- Cleaning
- Personal Care
- Household

Category segmentation enables behavioral insights.

---

# 8. Product-Level Analytics

Each product tracks:

- Total consumption
- Purchase frequency
- Average interval between purchases
- Stock depletion rate

Example:

```text
Milk:
- Bought: 12 times/month
- Consumed: 3L/week
- Average lifespan: 4 days
```

---

# 9. Shopping Behavior Metrics

Derived from Shopping List:

- Items added per session
- Suggestion acceptance rate
- Manual vs suggested ratio
- Pending items ratio
- Purchase conversion rate

---

# 10. Inventory Efficiency Metrics

Measures how well inventory is managed:

- Stockout frequency
- Overstock frequency
- Average idle stock time
- Expiration waste ratio

---

# 11. Purchase Session Analytics (NEW)

Supports Store Scan Mode evolution.

Metrics:

- Items scanned per session
- Session duration
- Store efficiency (items/minute)
- PendingPlacement ratio
- Completion delay (purchase → placement)

---

# 12. Pending Placement Analytics (NEW)

Tracks the gap between purchase and storage:

- Average pending time
- Bottlenecks in organization
- Items frequently left unplaced
- Location assignment delays

---

# 13. Event-Based Computation

All statistics MUST be derived from:

- Domain events
- Sync events
- Shopping events
- Purchase session events

Rules:

- No direct database mutations for analytics
- No loss of event history
- Recomputable at any time

---

# 14. Offline Considerations

- Statistics are cached locally
- Updates are incremental
- Full recomputation occurs after sync
- Offline mode uses approximate values

---

# 15. Performance Requirements

- Aggregations must be precomputed where possible
- Real-time updates allowed for small datasets
- Large datasets must use batch processing
- UI must remain responsive under heavy computation

---

# 16. Visualization Layer (Future-ready)

Statistics module is designed to support:

- Charts
- Time series graphs
- Category breakdowns
- Heatmaps (future)
- Trend analysis dashboards

---

# 17. Integration Points

- 16-products.md → consumption data
- 17-shopping-list.md → behavior patterns
- 11-sync-engine.md → event streams
- 10-offline-first.md → local caching
- 18-statistics.md → analytics engine
- 28-evolution-log.md → Purchase Session metrics

---

# 18. Statistics Principles

- Everything is event-driven
- No mutable historical data
- Offline data is approximate but consistent
- Performance is achieved via pre-aggregation
- Insights are derived, not stored manually
- Purchase Session metrics are first-class citizens
- PendingPlacement is a measurable system state

---

