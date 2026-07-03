# Baulera

**Document:** 21-openfoodfacts.md

**Title:** OpenFoodFacts Integration

**Version:** 1.0

---

# 1 Purpose

The OpenFoodFacts integration provides external product metadata to enrich Baulera's internal product catalog.

It is used to:

- Auto-populate product information
- Improve product recognition
- Standardize categories and nutrition data
- Assist in barcode-based product creation
- Reduce manual data entry

External data is always optional and never overrides user-defined data without confirmation.

---

# 2 Objectives

The OpenFoodFacts module must:

- Provide reliable product lookup by barcode.
- Enrich product metadata (name, brand, category).
- Support offline caching of known products.
- Reduce duplicate product creation.
- Work seamlessly with the Product domain.
- Remain fully replaceable by other providers.

---

# 3 Scope

Included:

- Barcode lookup
- Product metadata retrieval
- Category mapping
- Ingredient data extraction
- Nutrition facts ingestion
- Image URLs (front/back packaging)
- Language normalization

Excluded:

- Product pricing
- Availability tracking
- Retailer-specific data
- User reviews
- Commercial ranking

---

# 4 Integration Position

OpenFoodFacts is an **external data provider**, not a domain source of truth.

```text
Barcode Scan

↓

OpenFoodFacts API

↓

Structured External Product Data

↓

User Confirmation

↓

Internal Product Creation/Update
```

The domain model always remains authoritative.

---

# 5 Data Ownership Rules

- External data is read-only.
- Internal product data belongs to the domain.
- User edits always override external values.
- External updates do not mutate existing user-confirmed fields.
- Conflicts require explicit resolution.

---

# 6 External Product Model

OpenFoodFacts returns a structured product object.

Typical fields:

- Product name
- Brands
- Barcode (EAN/UPC)
- Categories
- Ingredients
- Nutritional values
- Image URLs
- Language-specific labels

Example:

```json
{
  "barcode": "7622210449283",
  "product_name": "Chocolate Bar",
  "brands": "Example Brand",
  "categories": "Snacks, Sweet Snacks",
  "ingredients": "Sugar, Cocoa, Milk",
  "image_url": "https://..."
}
```

---

# 7 Domain Mapping

External fields must be mapped to internal domain entities.

| OpenFoodFacts | Internal Model |
|---------------|----------------|
| product_name | Product.name |
| brands | Product.brand |
| categories | Product.category |
| barcode | Product.barcode |
| ingredients | Product.ingredients |
| image_url | Product.images |

Mapping must be validated before persistence.

---

# 8 Product Resolution Flow

When a barcode is scanned:

```text
Barcode Input

↓

Local Cache Check

↓

OpenFoodFacts API Call (if not cached)

↓

Normalization

↓

Domain Mapping

↓

User Confirmation

↓

Product Creation/Update
```

If multiple matches exist, user selection is required.

---

# 9 Caching Strategy

To support offline-first behavior, OpenFoodFacts data is cached locally.

Caching rules:

- Every successful barcode lookup is stored locally.
- Cached entries are immutable unless explicitly refreshed.
- Cache is keyed by barcode (EAN/UPC).
- Expiration is time-based only for metadata refresh, not deletion.
- User-confirmed product mappings take priority over cached data.

Cache layers:

```text
Barcode Request

↓

Memory Cache
↓

Local Database Cache
↓

OpenFoodFacts API
```

---

# 10 Offline Behavior

When offline, the system must:

- Resolve barcodes from local cache.
- Allow product creation using cached metadata.
- Fall back to minimal product entry if no cache exists.
- Queue enrichment requests for later sync.

Fallback behavior:

```text
No Internet + No Cache

↓

Basic Product Stub Creation

↓

User Confirmation

↓

Deferred Enrichment (Sync Engine)
```

---

# 11 Enrichment Pipeline

External data is used to enrich internal products after creation.

Pipeline:

```text
Internal Product Created

↓

Background Enrichment Task

↓

OpenFoodFacts Lookup

↓

Merge Non-Conflicting Fields

↓

Update Internal Product Metadata
```

Rules:

- Never overwrite user-edited fields.
- Only fill missing or empty attributes.
- Store provenance metadata for traceability.

---

# 12 Data Normalization

OpenFoodFacts data is not guaranteed to be consistent.

Normalization includes:

- Category standardization
- Brand cleanup
- Ingredient parsing
- Unit normalization
- Language normalization
- Image selection prioritization

Example:

```text
"Snacks, Sweet Snacks, Chocolate"

↓

"Snacks > Sweet Snacks"
```

Normalization ensures consistency across the domain model.

---

# 13 Conflict Resolution

Conflicts occur when external data differs from internal data.

Resolution rules:

| Source | Priority |
|--------|---------|
| User input | Highest |
| Internal product data | High |
| OpenFoodFacts | Lowest |

Example:

- User sets product name: "Milk Whole Organic"
- OpenFoodFacts returns: "Milk"

Result:

- Keep user value
- Store external value as reference only

---

# 14 Product Matching Logic

Matching is primarily barcode-based.

Fallback strategies:

- Partial barcode match
- Brand + name similarity
- Fuzzy text matching (low confidence only)

Matching hierarchy:

```text
EAN/UPC Match
↓

Exact Barcode Match
↓

Fuzzy Match (brand + name)
↓

No Match → New Product
```

Fuzzy matching always requires user confirmation.

---

# 15 Image Handling

OpenFoodFacts provides multiple image types:

- Front packaging
- Ingredients label
- Nutrition table
- Generic product image

Selection rules:

- Prefer front packaging image.
- Validate image availability.
- Cache images locally.
- Allow user replacement.

Images are never mandatory for product creation.

---

# 16 Ingredient Processing

Ingredients are parsed into structured format.

Example:

```text
Sugar, Cocoa Butter, Milk Powder
```

↓

```json
[
  "Sugar",
  "Cocoa Butter",
  "Milk Powder"
]
```

Future versions may support allergen detection and filtering.

---

# 17 Nutritional Data Mapping

OpenFoodFacts provides nutritional values per 100g or per serving.

The system normalizes all nutritional data into a consistent internal format.

Supported fields:

- Energy (kcal / kJ)
- Fat
- Saturated fat
- Carbohydrates
- Sugars
- Fiber
- Protein
- Salt

Normalization rules:

- Always store values per 100g as canonical reference.
- Serving-based values are stored as secondary metadata.
- Missing fields are left null (not assumed).

Example mapping:

```json
{
  "energy_kcal_per_100g": 250,
  "fat_g_per_100g": 12,
  "sugar_g_per_100g": 18,
  "protein_g_per_100g": 6
}
```

---

# 18 Unit Standardization

OpenFoodFacts data may use inconsistent units.

The system enforces standard units:

| External | Internal |
|----------|----------|
| g | g |
| mg | mg |
| µg | µg |
| kcal | kcal |
| kJ | kJ |

Conversion rules:

- No implicit conversions unless explicitly defined.
- All conversions must be deterministic.
- Units are stored alongside values for traceability.

---

# 19 Language Normalization

Product data may appear in multiple languages.

Normalization strategy:

- Prefer user's app language.
- Store original language string.
- Provide fallback translations if available.
- Do not overwrite user-defined names.

Example:

```text
"Chocolate au lait" (FR)
```

↓

```text
"Milk Chocolate" (EN internal display)
```

Original is preserved for auditability.

---

# 20 Category Mapping Strategy

OpenFoodFacts categories are hierarchical and inconsistent.

Mapping approach:

Raw:

```text
"Plant-based Foods and Beverages, Plant-based Beverages, Almond Drinks"
```

Internal:

```text
Beverages > Plant-based > Almond Milk
```

Rules:

- Flatten hierarchy into controlled taxonomy.
- Avoid duplication across categories.
- Ensure consistency with internal product schema.
- Map unknown categories to "Uncategorized".

---

# 21 Product Deduplication

The system prevents duplicate products during ingestion.

Detection signals:

- Same barcode
- Similar name + brand
- Similar ingredient structure
- Similar category classification

Deduplication rules:

- Barcode match always merges.
- Similarity match requires user confirmation.
- User-defined products take precedence over external duplicates.

Example:

```text
"Milk Whole 1L"
"Whole Milk"
```

May be merged only after confirmation.

---

# 22 Confidence Scoring

Each external product match includes a confidence score.

Factors:

- Barcode match (highest confidence)
- Exact name match
- Brand match
- Category match
- Ingredient similarity

Confidence levels:

| Score | Meaning |
|-------|--------|
| 0.90–1.00 | Strong match |
| 0.70–0.89 | Probable match |
| 0.50–0.69 | Weak match (needs confirmation) |
| < 0.50 | Not reliable |

Low-confidence matches must never auto-apply.

---

# 23 Enrichment Rules

External data enrichment must follow strict rules:

- Only fill missing fields.
- Never overwrite user-edited values.
- Store original external payload for traceability.
- Mark source as `OpenFoodFacts`.
- Allow re-enrichment only on user request.

Example:

```text
User Product:
Name: "Milk"

OpenFoodFacts:
Name: "Whole Milk 1L"
Brand: "Example"

Result:
Keep "Milk"
Add brand if missing
```

---

# 24 Error Handling Strategy

OpenFoodFacts integration must gracefully handle external failures.

Possible failure cases:

- API unavailable
- Timeout or slow response
- Invalid barcode format
- Empty or incomplete product data
- Rate limiting
- Network errors

---

## 24.1 Handling Rules

| Scenario | Behavior |
|----------|----------|
| API timeout | Return cached data if available |
| No cache | Create minimal product stub |
| Invalid response | Log and skip enrichment |
| Rate limit | Queue request for later retry |
| Network error | Offline fallback mode |

---

## 24.2 Degraded Mode

When the API is unavailable:

```text
Barcode Scan

↓

Local Cache Lookup

↓

Fallback Product Stub

↓

User Confirmation

↓

Deferred Enrichment
```

The system must remain fully usable without external connectivity.

---

# 25 Retry and Backoff Policy

External API calls use exponential backoff:

- Initial retry after 1s
- Second retry after 2s
- Third retry after 4s
- Maximum retry attempts: 3

After exceeding retries:

- Request is queued for background processing
- User flow continues without blocking

---

# 26 Rate Limiting Strategy

To avoid overloading OpenFoodFacts:

- Cache-first strategy is mandatory
- Duplicate requests are deduplicated
- Background enrichment is batched
- API calls are throttled per device and per user session

Priority order:

1. User-initiated barcode scans
2. Manual product search
3. Background enrichment jobs

---

# 27 Background Sync Enrichment

Unresolved or partial products are enriched asynchronously.

Workflow:

```text
Stub Product Created
        ↓
Sync Queue Entry Created
        ↓
Batch Worker Processes Queue
        ↓
OpenFoodFacts Lookup
        ↓
Merge with Existing Product
        ↓
Update Local Database
```

Rules:

- Must not block UI operations
- Must respect user modifications
- Must retry failed jobs automatically

---

# 28 Data Provenance Tracking

All external data must include provenance metadata.

Example:

```json
{
  "source": "openfoodfacts",
  "fetchedAt": "2026-07-03T12:00:00Z",
  "confidence": 0.92
}
```

Provenance fields:

- Source system
- Fetch timestamp
- Confidence score
- Cache status (hit/miss)

This ensures traceability of all enriched fields.

---

# 29 Merge Strategy

When merging external data into internal product:

Rule hierarchy:

1. User-defined values (highest priority)
2. Existing internal data
3. OpenFoodFacts data (lowest priority)

Merge behavior:

- Missing internal fields are filled.
- Conflicting fields are ignored unless user approves.
- Arrays (ingredients, categories) are merged only if empty.

Example:

```text
Internal:
  name = "Milk"

External:
  name = "Whole Milk 1L"
  brand = "DairyCo"

Result:
  name = "Milk"
  brand = "DairyCo"
```

---

# 30 Consistency Rules

To ensure deterministic behavior:

- Same barcode always produces same canonical product mapping (unless user overrides).
- Cached data overrides API calls.
- Enrichment does not modify existing confirmed user data.
- Conflicts require explicit resolution workflow.
- Background updates must not alter user-visible data without versioning.

---

# 31 Observability

The system must track integration health:

Metrics:

- API success rate
- Cache hit rate
- Average lookup latency
- Enrichment queue size
- Failure rate by reason

Logs should include:

- Barcode requested
- Response status
- Data source used (cache/API/fallback)

---

# 32 Security Considerations

OpenFoodFacts is a public external service, but integration must still follow application security standards.

Security rules:

- No user authentication tokens are exposed to OpenFoodFacts.
- Requests must not include sensitive household data.
- Only barcode or minimal query strings are transmitted.
- Responses are sanitized before persistence.
- External payloads are never executed as code or scripts.

Threat model considerations:

- Malformed API responses
- Data injection through product fields
- Unexpected category or ingredient formats
- Large payload abuse

Mitigations:

- Strict schema validation on all responses
- Payload size limits
- Sanitization of text fields
- Safe parsing of structured data only

---

# 33 Privacy Constraints

OpenFoodFacts requests must respect privacy boundaries.

Rules:

- No user identity is included in requests.
- No household structure is transmitted.
- No inventory state is sent externally.
- Requests are stateless and minimal.
- Cached lookups are preferred over external calls.

Data minimization principle:

```text
Barcode → API
NOT
Barcode + User Profile + Inventory State
```

---

# 34 Offline-First Behavior

The module is fully compatible with offline-first architecture.

Offline capabilities:

- Barcode lookup from local cache
- Product creation using cached metadata
- Deferred enrichment via sync engine
- Queueing of failed requests

Offline flow:

```text
Scan Barcode
        ↓
Check Local Cache
        ↓
If Found → Use Data
If Not Found → Create Stub
        ↓
Queue for Sync
```

No feature in this module requires constant connectivity.

---

# 35 Sync Engine Integration

OpenFoodFacts enrichment is tightly integrated with the sync engine.

Sync responsibilities:

- Retry failed API calls
- Process queued enrichment jobs
- Merge updated metadata
- Resolve conflicts with internal changes
- Maintain idempotency of operations

Sync flow:

```text
Local Product Stub
        ↓
Sync Job Created
        ↓
OpenFoodFacts Fetch
        ↓
Validation
        ↓
Merge Strategy Applied
        ↓
Local Update
```

Idempotency ensures repeated syncs produce identical results.

---

# 36 Performance Considerations

To ensure responsiveness:

Performance targets:

| Operation | Target |
|-----------|--------|
| Cache lookup | < 20ms |
| Barcode resolution | < 100ms |
| API fallback | < 2s |
| Background enrichment | non-blocking |
| Batch sync processing | throttled |

Optimizations:

- Memory caching of frequent barcodes
- Lazy enrichment (only when needed)
- Batch API requests when possible
- Debounced duplicate scans
- Asynchronous processing pipeline

---

# 37 Resilience Strategy

System must remain functional under partial or full API failure.

Resilience patterns:

- Circuit breaker for repeated API failures
- Retry with exponential backoff
- Graceful fallback to cached or stub data
- Background recovery jobs
- Isolation from core domain logic

Failure handling flow:

```text
API Failure
      ↓
Fallback to Cache
      ↓
If unavailable → Stub Product
      ↓
Queue for later enrichment
```

Core principle:

> External data failure must never block user workflows.

---

# 38 Data Validation Rules

All external data must pass validation before use.

Validation checks:

- Barcode format (EAN-13 / UPC)
- Required fields presence
- String length limits
- Category normalization rules
- Numeric bounds for nutrition data

Invalid data handling:

- Reject invalid fields
- Log validation errors
- Continue processing valid subset
- Never persist unvalidated payloads

---

# 39 Future Enhancements

Planned improvements for OpenFoodFacts integration:

- Smarter fuzzy matching using embeddings
- Multi-source product enrichment (additional databases)
- Improved ingredient normalization using AI
- Allergen detection and classification
- Regional product variations support
- Offline-first model preloading by category
- Image-based product verification improvements
- Confidence recalibration based on user corrections

All enhancements must preserve backward compatibility and deterministic mapping rules.

---

# 40 Advanced Matching Strategy

Future matching improvements may include hybrid approaches:

- Barcode-first deterministic matching
- Text similarity using embeddings
- Brand + category weighted scoring
- Image feature comparison (optional vision model)
- User correction feedback loop

However:

> Barcode match remains the only fully authoritative identifier.

---

# 41 User Correction Feedback Loop

User actions are used to improve matching quality.

Signals:

- Product rename
- Merge confirmation
- Duplicate rejection
- Manual category correction

These signals may be used to:

- Adjust confidence scoring
- Improve fuzzy matching heuristics
- Refine category mappings
- Reduce future duplicate suggestions

No automatic learning modifies domain data directly.

---

# 42 Extensibility Model

The integration is designed to support multiple external providers.

Future providers may include:

- Retailer APIs
- Regional food databases
- Private household catalogs
- Nutrition-specific datasets

All providers must implement the same interface:

```text
ProductLookupProvider
  - getByBarcode()
  - searchByText()
  - enrichProduct()
```

The domain layer must remain unchanged regardless of provider.

---

# 43 Testing Strategy

OpenFoodFacts integration must be covered by:

Unit tests

- Mapping correctness
- Validation rules
- Merge logic
- Normalization behavior

Integration tests

- API contract validation
- Cache behavior
- Offline fallback scenarios

Contract tests

- Response schema validation
- Field mapping consistency

Failure simulation tests

- Timeout behavior
- Invalid payload handling
- Rate limiting scenarios

---

# 44 Acceptance Criteria

| Area | Requirement |
|------|------------|
| Barcode lookup | Must resolve valid EAN/UPC codes correctly |
| Offline mode | Must function using local cache only |
| Enrichment | Must not overwrite user-defined fields |
| Performance | Cache-first lookup must be sub-100ms |
| Resilience | API failures must not block product creation |
| Consistency | Same barcode yields deterministic mapping |
| Validation | Invalid external data must be rejected safely |
| Sync | Background enrichment must be idempotent |

---

# 45 Cross-Module Traceability

| Feature | Related Module |
|---------|----------------|
| Product creation | 16-products.md |
| Inventory updates | 04-domain-model.md |
| Sync behavior | 11-sync-engine.md |
| Offline support | 10-offline-first.md |
| AI enrichment | 20-ai.md |
| Notifications | 22-notifications.md |
| Statistics | 18-statistics.md |

---

# 46 Design Principles Summary

- External data is supportive, not authoritative.
- Barcode is the primary product identifier.
- User data always overrides external sources.
- System must remain fully functional offline.
- Failures degrade gracefully without blocking workflows.
- All external data is validated and normalized before use.
- Sync engine ensures eventual consistency with enrichment sources.
- Integration remains provider-agnostic and replaceable.
- Deterministic behavior is mandatory for identical inputs.

---

# 47 Final Summary

The OpenFoodFacts integration enables Baulera to automatically enrich product data using a reliable external dataset while preserving full control within the internal domain model.

Key characteristics:

- Barcode-based product resolution
- Offline-first cache system
- Asynchronous enrichment pipeline
- Strict data validation and normalization
- User-driven conflict resolution
- Provider abstraction layer
- Fully deterministic merge rules
- Strong separation between external and internal data

This ensures a balance between automation and user control, while maintaining system reliability, privacy, and consistency.

---

