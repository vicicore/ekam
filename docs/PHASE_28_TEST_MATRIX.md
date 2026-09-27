# SETU Phase 28 — End-to-End Test Matrix

## 1. Authentication & Authorization

| ID | Scenario | Expected |
|---|---|---|
| AUTH-01 | Login with valid citizen account | Session created |
| AUTH-02 | Invalid credentials | Rejected without sensitive detail |
| AUTH-03 | Citizen accesses own data | Allowed |
| AUTH-04 | Citizen accesses another citizen's resource | Forbidden |
| AUTH-05 | Admin accesses admin endpoint | Allowed |
| AUTH-06 | Citizen accesses admin endpoint | Forbidden |
| AUTH-07 | Officer accesses own department | Allowed |
| AUTH-08 | Officer accesses another department | Forbidden |

## 2. Citizen Application

| ID | Scenario | Expected |
|---|---|---|
| APP-01 | Create application | Application persisted |
| APP-02 | Grant consent | Consent recorded |
| APP-03 | Submit application | Connector request recorded |
| APP-04 | Duplicate submit | No duplicate external submission |
| APP-05 | Approval event | Journey advances |
| APP-06 | Rejection event | Journey shows rejection |
| APP-07 | Invalid application ID | 404 |
| APP-08 | Missing required input | 422 |

## 3. Officer Workflow

| ID | Scenario | Expected |
|---|---|---|
| OFF-01 | View department queue | Correct department items |
| OFF-02 | Assign application | Assignment persisted |
| OFF-03 | Reassign | Previous assignment audited |
| OFF-04 | Approve | Application state updated |
| OFF-05 | Reject without reason | Validation failure |
| OFF-06 | Cross-department access | Forbidden |
| OFF-07 | SLA at risk | Visible in queue |

## 4. Department Integration

| ID | Scenario | Expected |
|---|---|---|
| INT-01 | Sandbox dispatch | External reference stored |
| INT-02 | Signed webhook | Accepted |
| INT-03 | Invalid signature | Rejected |
| INT-04 | Duplicate event ID | Idempotent |
| INT-05 | Connector failure | Retry job created |
| INT-06 | Retry exhaustion | Dead letter created |

## 5. Notifications

| ID | Scenario | Expected |
|---|---|---|
| NOT-01 | Application update | Notification created |
| NOT-02 | Assignment | Officer notification created |
| NOT-03 | Mark read | Read state persisted |
| NOT-04 | Unauthorized notification access | Forbidden |
| NOT-05 | Delivery failure | Retryable record |

## 6. Grievance

| ID | Scenario | Expected |
|---|---|---|
| GRV-01 | Create grievance | Acknowledgement generated |
| GRV-02 | Citizen lists own grievances | Only own records |
| GRV-03 | Admin updates status | Status persisted |
| GRV-04 | Unauthorized update | Forbidden |
| GRV-05 | Timeline | Events visible |

## 7. Assistant

| ID | Scenario | Expected |
|---|---|---|
| AST-01 | Known SETU question | Grounded response |
| AST-02 | Unknown question | No fabricated answer |
| AST-03 | Source link | Relevant route returned |
| AST-04 | Hindi request | Hindi response shell |
| AST-05 | Marathi request | Marathi response shell |

## 8. Maharashtra Intelligence

| ID | Scenario | Expected |
|---|---|---|
| MH-01 | District lookup | District data |
| MH-02 | Service search | Matching services |
| MH-03 | Department filter | Correct department results |
| MH-04 | Empty query | Full available catalogue |
| MH-05 | Invalid district | 404 |

## 9. Security

| ID | Scenario | Expected |
|---|---|---|
| SEC-01 | Oversized request | Rejected |
| SEC-02 | Invalid upload | Rejected |
| SEC-03 | Sensitive log data | Redacted |
| SEC-04 | Missing webhook signature | Rejected |
| SEC-05 | Rate limit exceeded | 429 / configured response |
| SEC-06 | Unauthorized route | 401/403 |

## 10. Accessibility & Mobile

| ID | Scenario | Expected |
|---|---|---|
| A11Y-01 | Keyboard navigation | All primary controls reachable |
| A11Y-02 | Skip link | Focus moves to main |
| A11Y-03 | 200% zoom | Content remains usable |
| A11Y-04 | Reduced motion | Non-essential motion suppressed |
| A11Y-05 | High contrast | Controls remain distinguishable |
| MOB-01 | 320px | No unintended horizontal scroll |
| MOB-02 | Mobile navigation | Opens and closes |
| MOB-03 | Touch controls | Adequate target size |

## 11. Reliability

- [ ] API restart does not corrupt persisted records
- [ ] Worker restart safely retries jobs
- [ ] Duplicate webhook does not duplicate state transition
- [ ] Notification retry does not create uncontrolled duplicates
- [ ] Dead-letter record preserves failure context
- [ ] Audit event exists for sensitive officer actions
