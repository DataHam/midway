---
phase: 02
slug: content-pages
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-13
---

# Phase 02 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None — static HTML site |
| **Config file** | N/A |
| **Quick run command** | `node scripts/validate-html.js pages/*.html` |
| **Full suite command** | `node scripts/validate-html.js pages/*.html && node scripts/validate-links.js` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `node scripts/validate-html.js pages/*.html`
- **After every plan wave:** Full HTML validation + link checking
- **Before `/gsd-verify-work`:** All HTML valid, all links resolve
- **Max feedback latency:** 10 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 02-01 | 1 | HOME-01 | file | `test -f pages/index.html` | ❌ W0 | ⬜ pending |
| 02-01-02 | 02-01 | 1 | HOME-02 | file | `test -f pages/index.html && grep -q "nav-grid" pages/index.html` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02-02 | 1 | BIO-01 | file | `test -f pages/danny.html` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02-02 | 1 | BIO-02 | file | `test -f pages/danny.html && grep -q "Consulting Services" pages/danny.html` | ❌ W0 | ⬜ pending |
| 02-03-01 | 02-03 | 1 | BIO-04 | file | `test -f pages/helen.html` | ❌ W0 | ⬜ pending |
| 02-03-02 | 02-03 | 1 | BIO-05 | file | `test -f pages/helen.html && grep -q "Selected Research" pages/helen.html` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `scripts/validate-html.js` — HTML validation script (W3C validator CLI)
- [ ] `scripts/validate-links.js` — Link checker for internal navigation
- [ ] No framework install required (static HTML)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Hero displays correctly | HOME-01, HOME-04 | Visual check | Open pages/index.html, verify HDMain.webp background, logo, 4 nav cards visible |
| Nav cards route correctly | HOME-02, HOME-03 | Interactive | Click each nav card, verify redirects to correct page or gate |
| Bio pages render properly | BIO-01 to BIO-07 | Visual/interactive | Open danny.html and helen.html, verify split layout, credentials, services/research, CV buttons |
| No meeting booking links | BIO-03, BIO-06 | Visual check | Search HTML for "booking", "calendar", "meet" — should return 0 results |
| Responsive layout | HOME-04 | Visual | Resize browser: verify 1 col (mobile), 2 col (tablet), 4 col (desktop) for nav grid |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify commands
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 10s
- [ ] `nyquist_compliant: true` set in frontmatter (after all verifications pass)

**Approval:** pending
