# NextUp Memphis — Pilot 001 Validation

## Purpose

This directory contains the validation documents for NextUp v1.0 Pilot 001.

Pilot 001 tests whether the existing system can faithfully move a real person through the full chain:

> Narration → Interpretation → Confirmed Need → Pathway → Permission → Disclosure → Referral → Outcome → Barrier → Next Action

without misrepresenting the person's words, authority, eligibility, funding, external actions, or outcomes.

## Documents

| Document | Purpose |
|----------|---------|
| `preflight.md` | 15-check preflight verification completed before any test data is created |
| `test-script.md` | Tests A through O from the approved validation protocol |
| `observation-log.md` | Repeatable structure for recording each test execution |
| `defects.md` | Defect tracker with severity classification |
| `final-debrief.md` | Final debrief template with KEEP/MODIFY/MISSING/REMOVE and readiness gate |

## Status

- Preflight: **PASS** (all 15 checks)
- Test execution: **NOT STARTED**
- Pilot data: **NOT CREATED**

## Rules

1. Do not add features during validation.
2. Do not change schema during validation.
3. Do not modify RLS during validation.
4. Do not redesign working flows during validation.
5. Record every test result honestly — a successful pilot exposes where the system is wrong.
6. P0 findings stop Pilot 001 immediately.
