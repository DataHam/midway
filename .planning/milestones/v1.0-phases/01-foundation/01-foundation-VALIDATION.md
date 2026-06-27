---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-12
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (Node.js) |
| **Config file** | vitest.config.js — Wave 0 installs |
| **Quick run command** | `vitest run optimize-images.test.js` |
| **Full suite command** | `vitest run` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Run `vitest run optimize-images.test.js`
- **After every plan wave:** Run `vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 60 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | DESIGN-01 to DESIGN-04 | config | `grep -q "primary.*#1a56db" tailwind.config.js` | ✅ | ⬜ pending |
| 01-02-01 | 02 | 1 | IMG-01 to IMG-05 | unit | `npm test -- optimize-images.test.js` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/optimize-images.test.js` — tests for image optimization
- [ ] `vitest.config.js` — Vitest configuration
- [ ] `npm install --save-dev vitest` — install test framework

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Lighthouse accessibility score ≥ 90 | DESIGN-04 | Requires browser automation | Run Lighthouse audit on any HTML page |
| No Google Fonts CDN requests | DESIGN-02 | Network-level check | Open DevTools Network tab, verify no requests to fonts.gstatic.com |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
