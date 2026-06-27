---
phase: 06-api-redirect
plan: 01
executed: 2026-03-13
status: complete
---

# Phase 06: API Redirect Fix - Plan 01 Summary

**Objective:** Fix redirect logic in verification APIs to properly handle browser navigation vs fetch API calls.

**Gap Closure:** Addresses critical GATE-06 gap where valid Turnstile token should return 302 redirect for browser navigation but client code expected JSON.

## Tasks Completed

### Task 1: Fix Danny API to detect browser vs fetch requests
**File:** `src/api/verify-danny/index.js`

**Changes:**
- Added Accept header detection after successful Turnstile validation
- Returns `Response.redirect('https://danny.tamtham.com', 302)` for HTML requests
- Returns `JSON.stringify({ redirectUrl: 'https://danny.tamtham.com' })` for fetch API calls

**Result:** API now responds appropriately based on request type.

### Task 2: Fix Helen API to detect browser vs fetch requests
**File:** `src/api/verify-helen/index.js`

**Changes:**
- Applied identical logic as Danny API but for Helen subdomain
- Returns `Response.redirect('https://helen.tamtham.com', 302)` for HTML requests
- Returns `JSON.stringify({ redirectUrl: 'https://helen.tamtham.com' })` for fetch API calls

**Result:** API now responds appropriately based on request type.

### Task 3: Update gate pages to handle JSON redirect response
**Files:** `pages/verify-danny.html`, `pages/verify-helen.html`

**Changes:**
- Added `response.redirected` check before calling `response.json()`
- If response was redirected, use `window.location.href = response.url`
- Otherwise, parse JSON and check for `redirectUrl` property

**Result:** Client code handles both 302 redirects and JSON responses gracefully.

## Files Modified

1. `src/api/verify-danny/index.js` - Added hybrid response logic
2. `src/api/verify-helen/index.js` - Added hybrid response logic
3. `pages/verify-danny.html` - Added redirect handling
4. `pages/verify-helen.html` - Added redirect handling

## Verification

**Automated checks:**
- ✅ Both APIs have Accept header detection
- ✅ Both use Response.redirect() for 302
- ✅ Both clients check response.redirected flag
- ✅ Git commit created with all changes

**Manual testing required:**
- Open `pages/verify-danny.html` in browser and complete Turnstile verification → should redirect to `https://danny.tamtham.com`
- Open `pages/verify-helen.html` in browser and complete Turnstile verification → should redirect to `https://helen.tamtham.com`
- Test with invalid token → should show error modal

## Git Commits

```
fix(06): implement hybrid redirect logic for browser and fetch requests
  - src/api/verify-danny/index.js: Added Accept header detection
  - src/api/verify-helen/index.js: Added Accept header detection
  - pages/verify-danny.html: Added response.redirected handling
  - pages/verify-helen.html: Added response.redirected handling
```

## Next Steps

Phase 6 execution complete. Ready for Phase 7 planning.
