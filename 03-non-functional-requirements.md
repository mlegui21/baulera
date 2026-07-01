# Baulera

**Document:** 03-non-functional-requirements.md  
**Version:** 1.0  
**Status:** Final  
**Last Updated:** 2026-07-01

---

# 1. Introduction

## 1.1 Purpose

This document defines all **Non-Functional Requirements (NFRs)** for Baulera.

While Functional Requirements describe **what** the system does, Non-Functional Requirements define **how well** it performs those functions.

These requirements are mandatory unless explicitly stated otherwise.

---

## 1.2 Scope

This specification covers:

- Performance
- Reliability
- Availability
- Offline Operation
- Security
- Scalability
- Maintainability
- Portability
- Accessibility
- Usability
- Observability
- Compatibility
- Internationalization

---

## 1.3 Requirement Identifier

Every requirement uses the format

```
NFR-XXX
```

Example

```
NFR-001
```

---

# 2 Performance

---

## NFR-001 Application Startup

**Priority**

Critical

### Requirement

Cold startup shall complete in less than **3 seconds** on a mid-range device.

Warm startup shall complete in less than **1 second**.

---

## NFR-002 Screen Navigation

**Priority**

Critical

Navigation between screens shall complete in less than **300 ms**.

No visible loading indicator should be required for locally available data.

---

## NFR-003 Product Search

**Priority**

Critical

Search results shall begin appearing in less than **100 ms** after user input.

Search shall execute entirely on the local database.

---

## NFR-004 Inventory Update

**Priority**

Critical

Inventory operations shall complete locally in less than **150 ms**.

---

## NFR-005 Barcode Scan

**Priority**

Critical

Barcode recognition shall occur in less than **2 seconds** under normal lighting conditions.

---

## NFR-006 Dashboard Loading

**Priority**

High

Dashboard shall become interactive in less than **500 ms**.

---

## NFR-007 Statistics Generation

**Priority**

High

Monthly statistics shall be generated in less than **2 seconds**.

Yearly statistics shall be generated in less than **5 seconds**.

---

## NFR-008 Synchronization

**Priority**

High

Synchronization shall execute in the background without blocking the user interface.

---

## NFR-009 Scroll Performance

**Priority**

Critical

Scrolling shall maintain **60 FPS** on supported devices.

---

## NFR-010 Animation Performance

**Priority**

Medium

Animations shall execute at the native refresh rate whenever supported.

---

# 3 Reliability

---

## NFR-011 Zero Silent Data Loss

**Priority**

Critical

The system shall never silently discard user data.

Every failure shall be recoverable or explicitly reported.

---

## NFR-012 Atomic Operations

**Priority**

Critical

Inventory operations shall be atomic.

Either:

- Entire operation succeeds

or

- No data changes occur.

---

## NFR-013 Database Consistency

**Priority**

Critical

The local database shall always remain internally consistent.

---

## NFR-014 Synchronization Reliability

**Priority**

Critical

Temporary synchronization failures shall never corrupt local information.

---

## NFR-015 Crash Recovery

**Priority**

Critical

Following an unexpected application termination,

the application shall recover without data corruption.

---

## NFR-016 Transaction Integrity

**Priority**

Critical

Database transactions shall use ACID guarantees.

---

## NFR-017 Retry Strategy

**Priority**

High

Transient failures shall be retried automatically using exponential backoff.

---

## NFR-018 Event Ordering

**Priority**

Critical

Business events shall preserve chronological ordering.

---

## NFR-019 Duplicate Prevention

**Priority**

Critical

Repeated synchronization shall never generate duplicated business events.

---

## NFR-020 Idempotency

**Priority**

Critical

Every synchronization request shall be idempotent.

Executing the same synchronization twice shall not change the resulting state.

---

# 4 Availability

---

## NFR-021 Offline Availability

**Priority**

Critical

The application shall remain fully operational without Internet connectivity.

---

## NFR-022 Local Availability

**Priority**

Critical

The local database shall always be available during normal application usage.

---

## NFR-023 Server Availability

**Priority**

High

Cloud services should achieve at least **99.9% monthly availability**.

Temporary cloud outages shall not prevent local operation.

---

## NFR-024 Graceful Degradation

**Priority**

Critical

Unavailable cloud services shall disable only dependent functionality.

Core inventory operations shall remain operational.

---

## NFR-025 Background Recovery

**Priority**

High

Synchronization shall automatically resume when connectivity is restored.

---

# 5 Scalability

---

## NFR-026 Household Size

**Priority**

Medium

The system shall support at least **20 Household members** without architectural changes.

Current expected usage is 2–5 members.

---

## NFR-027 Product Catalog Size

**Priority**

Critical

The application shall support at least **10,000 catalog products**.

Current expected usage is fewer than 500.

---

## NFR-028 Inventory Size

**Priority**

Critical

The application shall support at least **100,000 inventory batches**.

---

## NFR-029 Inventory Movements

**Priority**

Critical

The system shall support an unlimited historical number of Inventory Movements.

Performance degradation shall remain minimal.

---

## NFR-030 Future Growth

**Priority**

Critical

The architecture shall support future growth without requiring fundamental redesign.

Examples

- Multiple households
- Enterprise mode
- Shared inventories
- Cloud analytics

---

# 6 Security

---

## NFR-031 Authentication Security

**Priority**

Critical

### Requirement

Authentication shall be delegated to Supabase Auth.

The application shall never implement its own authentication mechanism.

---

## NFR-032 Password Storage

**Priority**

Critical

User passwords shall never be stored locally.

Passwords shall never be logged, cached or transmitted outside the authentication provider.

---

## NFR-033 Secure Communication

**Priority**

Critical

All communication with remote services shall use HTTPS/TLS 1.2 or higher.

Unencrypted communication is prohibited.

---

## NFR-034 Secure Token Storage

**Priority**

Critical

Authentication tokens shall be stored using the secure storage facilities provided by the operating system.

Examples

- Android Keystore
- iOS Keychain

---

## NFR-035 Database Protection

**Priority**

High

Sensitive locally stored information should support encrypted database storage.

---

## NFR-036 Authorization

**Priority**

Critical

Every remote request shall validate that the authenticated user belongs to the requested Household.

---

## NFR-037 Least Privilege

**Priority**

Critical

Users shall only have access to the minimum data required for their Household.

---

## NFR-038 Sensitive Data Logging

**Priority**

Critical

Logs shall never contain:

- Passwords
- Authentication Tokens
- Refresh Tokens
- Personal Secrets

---

## NFR-039 Security Updates

**Priority**

High

Third-party dependencies shall be updated regularly to address known security vulnerabilities.

---

## NFR-040 Secure Defaults

**Priority**

Critical

Default configuration shall always favor security over convenience.

---

# 7 Maintainability

---

## NFR-041 Clean Architecture

**Priority**

Critical

The application shall follow Clean Architecture principles.

Dependencies shall point inward toward the domain.

---

## NFR-042 Layer Isolation

**Priority**

Critical

Presentation, Domain and Data layers shall remain independent.

---

## NFR-043 Modularization

**Priority**

Critical

Business features shall be organized into independent modules.

---

## NFR-044 Dependency Injection

**Priority**

Critical

Dependencies shall be resolved through Dependency Injection.

No service locator pattern shall be used.

---

## NFR-045 Code Readability

**Priority**

Critical

Code shall prioritize readability over clever implementations.

---

## NFR-046 Documentation

**Priority**

High

Public APIs and architectural decisions shall be documented.

---

## NFR-047 Naming Consistency

**Priority**

Critical

Naming conventions shall remain consistent across:

- Database
- Domain
- Flutter
- API
- Documentation

---

## NFR-048 Low Coupling

**Priority**

Critical

Modules shall minimize dependencies between one another.

---

## NFR-049 High Cohesion

**Priority**

Critical

Each module shall encapsulate a single business responsibility.

---

## NFR-050 Replaceable Infrastructure

**Priority**

Critical

Infrastructure technologies (database, backend, storage) shall be replaceable without affecting business logic.

---

# 8 Portability

---

## NFR-051 Mobile Platforms

**Priority**

Critical

The application shall support:

- Android
- iOS

using a single Flutter codebase.

---

## NFR-052 Device Independence

**Priority**

High

The application shall adapt to different screen sizes without layout issues.

---

## NFR-053 Operating System Versions

**Priority**

High

Support shall target currently supported Android and iOS versions.

---

## NFR-054 Orientation

**Priority**

Medium

The application shall support portrait orientation.

Landscape support is optional.

---

## NFR-055 Future Platform Support

**Priority**

Medium

Architecture shall allow future support for:

- Web
- Windows
- macOS
- Linux

without redesigning the domain layer.

---

# 9 Accessibility

---

## NFR-056 Screen Reader Support

**Priority**

High

All interactive elements shall expose semantic accessibility information.

---

## NFR-057 Touch Targets

**Priority**

Critical

Interactive controls shall provide a minimum touch area of 48 x 48 dp.

---

## NFR-058 Color Accessibility

**Priority**

High

Information shall never rely exclusively on color.

Icons, labels or additional indicators shall always accompany color-based status.

---

## NFR-059 Dynamic Text

**Priority**

Medium

The application shall support operating system text scaling.

Layouts shall remain usable at increased font sizes.

---

## NFR-060 Keyboard Navigation

**Priority**

Low

Where supported by the platform, users shall be able to navigate using external keyboards.

---

# 10 Usability

---

## NFR-061 Learning Curve

**Priority**

Critical

### Requirement

A new user shall be able to perform the two primary workflows without external documentation.

Primary workflows:

- Register Purchase
- Consume Product

---

## NFR-062 Interaction Efficiency

**Priority**

Critical

Common operations should require the minimum possible number of interactions.

Target values:

| Operation | Target |
|-----------|--------|
| Consume Product | ≤ 5 seconds |
| Register Purchase | ≤ 10 seconds |
| Barcode Scan | ≤ 5 seconds |
| Voice Command | ≤ 5 seconds |

---

## NFR-063 Consistency

**Priority**

Critical

The application shall maintain consistent:

- Navigation
- Terminology
- Icons
- Colors
- Interaction patterns

across all screens.

---

## NFR-064 Error Prevention

**Priority**

Critical

The user interface shall minimize opportunities for user mistakes.

Examples

- Disable invalid actions.
- Validate input immediately.
- Display clear warnings before destructive actions.

---

## NFR-065 User Feedback

**Priority**

Critical

Every user action shall provide immediate visual feedback.

Examples

- Success
- Error
- Loading
- Synchronization status

---

# 11 Observability

---

## NFR-066 Structured Logging

**Priority**

High

Application logs shall follow a structured format.

Each log entry shall include:

- Timestamp
- Severity
- Module
- Event
- Correlation Identifier

---

## NFR-067 Error Reporting

**Priority**

High

Unexpected application errors should be reported automatically when the user has granted consent.

---

## NFR-068 Performance Monitoring

**Priority**

Medium

The application should collect anonymous performance metrics.

Examples

- Startup time
- Synchronization duration
- Search latency

---

## NFR-069 Diagnostic Information

**Priority**

Medium

Users shall be able to access diagnostic information useful for troubleshooting.

---

## NFR-070 Audit Completeness

**Priority**

Critical

Every business event shall be traceable through the Audit subsystem.

---

# 12 Compatibility

---

## NFR-071 Flutter Compatibility

**Priority**

Critical

The application shall be developed using the current stable Flutter release.

---

## NFR-072 Package Stability

**Priority**

High

Third-party packages shall be actively maintained and widely adopted.

Experimental packages shall be avoided in production.

---

## NFR-073 Database Compatibility

**Priority**

Critical

The local persistence layer shall be based on SQLite through Drift.

---

## NFR-074 Backend Compatibility

**Priority**

Critical

The backend shall be based on Supabase using PostgreSQL.

The data model shall remain portable to any PostgreSQL-compatible environment.

---

## NFR-075 API Compatibility

**Priority**

High

External APIs shall be abstracted behind repositories to avoid vendor lock-in.

---

# 13 Internationalization

---

## NFR-076 Multiple Languages

**Priority**

Medium

The application architecture shall support multiple languages.

Initial language:

- English (internal development)

Future languages:

- Spanish
- Portuguese

---

## NFR-077 Localization

**Priority**

Medium

Dates, times and numeric formats shall follow the user's locale.

---

## NFR-078 Unicode Support

**Priority**

Critical

The application shall fully support Unicode.

---

## NFR-079 Time Zone Awareness

**Priority**

Critical

Displayed dates shall respect the user's local time zone.

Internally, all timestamps shall use UTC.

---

## NFR-080 Text Externalization

**Priority**

High

All user-facing strings shall be externalized into localization resources.

---

# 14 Quality Attributes

---

## NFR-081 Offline First

**Priority**

Critical

Offline operation takes precedence over cloud availability.

Every feature shall be designed assuming intermittent connectivity.

---

## NFR-082 Local-First Reads

**Priority**

Critical

All read operations shall use the local database as the primary source.

---

## NFR-083 Event-Driven Design

**Priority**

Critical

Business operations shall generate immutable domain events.

---

## NFR-084 Data Integrity

**Priority**

Critical

Historical information shall never be lost due to synchronization, updates or application failures.

---

## NFR-085 Extensibility

**Priority**

Critical

The architecture shall support new modules without requiring significant modifications to existing modules.

---

## NFR-086 Testability

**Priority**

Critical

Business logic shall be independently testable without Flutter or Supabase dependencies.

---

## NFR-087 Replaceable Infrastructure

**Priority**

Critical

Infrastructure components shall be replaceable through interfaces.

Examples

- Authentication
- Database
- Storage
- AI Provider
- Barcode Provider

---

## NFR-088 Predictable Behavior

**Priority**

Critical

The same input under the same conditions shall always produce the same business result.

---

## NFR-089 Simplicity

**Priority**

Critical

When multiple technically valid solutions exist, the simplest maintainable solution shall be preferred.

---

## NFR-090 Long-Term Maintainability

**Priority**

Critical

Architectural decisions shall prioritize long-term maintainability over short-term implementation convenience.

---

# Quality Attribute Summary

| Attribute | Target |
|-----------|--------|
| Availability | Offline First |
| Reliability | Zero Silent Data Loss |
| Performance | Local-first, <100 ms search |
| Scalability | Supports future growth without redesign |
| Maintainability | Clean Architecture |
| Security | Least Privilege + Secure by Default |
| Testability | Business logic independent from infrastructure |
| Extensibility | Modular architecture |
| Accessibility | WCAG-oriented design |
| Portability | Flutter + PostgreSQL |

---

# Acceptance Criteria

The Non-Functional Requirements Specification shall be considered complete when:

- Every architectural decision satisfies at least one NFR.
- Every measurable requirement can be validated through automated or manual testing.
- No functional implementation contradicts any Critical NFR.
- Performance targets are validated during testing.
- Security requirements are enforced throughout the application.
- Offline-first behavior is preserved across all business workflows.

---

# Traceability

| Document | Relationship |
|----------|--------------|
| 01-vision.md | Defines product goals that motivate these quality attributes. |
| 02-functional-requirements.md | Specifies the functional behavior constrained by these NFRs. |
| 04-domain-model.md | Must satisfy modularity, maintainability and extensibility requirements. |
| 06-architecture.md | Implements the architectural decisions required by these NFRs. |
| 10-offline-first.md | Details the Offline First strategy introduced here. |
| 11-sync-engine.md | Implements reliability, consistency and synchronization requirements. |
| 12-security.md | Expands the security requirements defined in this document. |
| 23-testing.md | Verifies compliance with all measurable NFRs. |

---

# Glossary

| Term | Definition |
|------|------------|
| ACID | Database transaction guarantees: Atomicity, Consistency, Isolation and Durability. |
| Offline First | Architectural approach where local functionality is independent of network availability. |
| Eventual Consistency | All devices converge to the same state after successful synchronization. |
| Idempotency | Repeating the same operation produces the same final result without side effects. |
| Local-First | Read operations prioritize the local database over remote services. |
| Correlation Identifier | Identifier used to trace related operations across logs and services. |
| Graceful Degradation | Loss of optional functionality without affecting core business operations. |
| Modular Architecture | Software organization where features are isolated into cohesive modules. |

---

# Summary

**Total Non-Functional Requirements:** 90

**Categories Covered**

- Performance
- Reliability
- Availability
- Scalability
- Security
- Maintainability
- Portability
- Accessibility
- Usability
- Observability
- Compatibility
- Internationalization
- Quality Attributes

---

# Guiding Principles

All future architectural and implementation decisions shall respect the following priority order:

1. Preserve user data.
2. Keep the application fully operational offline.
3. Maintain data consistency across devices.
4. Favor simplicity over unnecessary complexity.
5. Optimize for long-term maintainability.
6. Minimize user interaction.
7. Prefer local execution over remote dependencies.
8. Ensure extensibility without architectural redesign.

These principles take precedence over implementation convenience.

---
