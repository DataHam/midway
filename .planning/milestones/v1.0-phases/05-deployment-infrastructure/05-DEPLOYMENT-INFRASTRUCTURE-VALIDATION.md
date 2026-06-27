---
phase: 05
slug: deployment-infrastructure
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-03-13
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Manual verification + git commit checks |
| **Config file** | N/A — deployment-phase (no unit tests) |
| **Quick run command** | `git status` |
| **Full suite command** | `cat .github/workflows/azure-static-web-apps.yml` |
| **Estimated runtime** | ~5 seconds |

---

## Sampling Rate

- **After every task commit:** Verify file exists and has correct structure
- **After every plan wave:** Verify all required files created, commit to git
- **Before `/gsd-verify-work`:** All deployment artifacts present and valid
- **Max feedback latency:** 5 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 05-01 | 1 | DEPLOY-01 | file-check | `test -f .github/workflows/azure-static-web-apps.yml` | ⬜ W0 | ⬜ pending |
| 05-01-02 | 05-01 | 1 | DEPLOY-02 | file-check | `grep -q "dopplerhq/action" .github/workflows/azure-static-web-apps.yml` | ⬜ W0 | ⬜ pending |
| 05-01-03 | 05-01 | 1 | DEPLOY-03 | file-check | `grep -q "@v" .github/workflows/azure-static-web-apps.yml` | ⬜ W0 | ⬜ pending |
| 05-02-01 | 05-02 | 1 | CLOUD-01 | file-check | `test -f .planning/phases/05-deployment-infrastructure/CLOUDFLARE-SETUP.md` | ⬜ W0 | ⬜ pending |
| 05-02-02 | 05-02 | 1 | CLOUD-02 | file-check | `test -f .planning/phases/05-deployment-infrastructure/TUNNEL-CONFIG.md` | ⬜ W0 | ⬜ pending |
| 05-02-03 | 05-02 | 1 | CLOUD-03 | file-check | `grep -q "danny.tamtham.com" .planning/phases/05-deployment-infrastructure/TUNNEL-CONFIG.md` | ⬜ W0 | ⬜ pending |
| 05-03-01 | 05-03 | 2 | CLOUD-04 | manual | `curl -I https://tamtham.com` | ⬜ W0 | ⬜ pending |
| 05-03-02 | 05-03 | 2 | CLOUD-05 | manual | `curl https://api.cloudflare.com/client/v4/zones/*/cache_rules` | ⬜ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `.github/workflows/` directory created
- [ ] `.doppler/` directory created for Doppler configs
- [ ] `.planning/phases/05-deployment-infrastructure/` directory created
- [ ] `tests/05-deployment/` directory created
- [ ] No framework install needed (deployment-phase)

*Existing infrastructure covers all phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| GitHub Actions workflow triggers on push | DEPLOY-04 | Requires git push to verify | `git push origin main` → check Actions tab |
| Cloudflare DNS resolves correctly | CLOUD-01 | Requires live DNS propagation | `dig tamtham.com` or `nslookup tamtham.com` |
| Cloudflare Tunnel accessible | CLOUD-02, CLOUD-03 | Requires tunnel running | `curl http://danny.tamtham.com` |
| Bot Fight Mode active | CLOUD-04 | Requires Cloudflare dashboard | Cloudflare Dashboard → Security → Bot Fight Mode |
| Cache Rules configured | CLOUD-05 | Requires Cloudflare API | Cloudflare Dashboard → Caching → Cache Rules |

*Some phase behaviors require manual deployment verification.*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 5s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
