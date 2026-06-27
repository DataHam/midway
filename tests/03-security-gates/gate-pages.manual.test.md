# Gate Pages Manual Verification Checklist

**Phase:** 03-security-gates  
**Plan:** 04  
**Date:** 2026-03-13

---

## Test Environment Setup

### Prerequisites
1. Ensure `TAMTHAM_SITEKEY` is configured in the build environment
2. Open browser DevTools (Network tab enabled)
3. Have two browser tabs/windows ready for testing both pages

### Test URLs
- Danny Gate: `file://<project-root>/pages/verify-danny.html`
- Helen Gate: `file://<project-root>/pages/verify-helen.html`

---

## Verification Checklist

### Task 1: Turnstile Widget Renders on verify-danny.html

**Steps:**
1. Open `pages/verify-danny.html` in browser
2. Check page loads without JavaScript errors
3. Look for Turnstile widget container (`<div id="turnstile-widget">`)
4. Verify widget appears (Cloudflare checkbox or challenge)

**Expected Results:**
- ✅ Page loads without errors
- ✅ Turnstile widget visible in center of page
- ✅ No console errors about missing sitekey

**Status:** [ ] Pass [ ] Fail

---

### Task 2: Turnstile Widget Renders on verify-helen.html

**Steps:**
1. Open `pages/verify-helen.html` in browser
2. Check page loads without JavaScript errors
3. Look for Turnstile widget container (`<div id="turnstile-widget">`)
4. Verify widget appears (Cloudflare checkbox or challenge)

**Expected Results:**
- ✅ Page loads without errors
- ✅ Turnstile widget visible in center of page
- ✅ No console errors about missing sitekey

**Status:** [ ] Pass [ ] Fail

---

### Task 3: Widget Loads from challenges.cloudflare.com

**Steps:**
1. Open browser DevTools → Network tab
2. Open `pages/verify-danny.html`
3. Filter by "turnstile" or "challenges.cloudflare.com"
4. Verify script request appears

**Expected Results:**
- ✅ Request to `https://challenges.cloudflare.com/turnstile/v0/api.js`
- ✅ Status code 200
- ✅ Script loads before widget renders

**Status:** [ ] Pass [ ] Fail

---

### Task 4: Submit Button Disabled After Widget Completion

**Steps:**
1. Open `pages/verify-danny.html`
2. Complete Turnstile verification (click checkbox)
3. Observe submit button behavior

**Expected Results:**
- ✅ Submit button appears after widget renders
- ✅ Button is disabled immediately after callback fires
- ✅ Button opacity reduces to ~60%
- ✅ Cursor changes to "not-allowed"

**Status:** [ ] Pass [ ] Fail

---

### Task 5: API Call Made to /api/verify-danny

**Steps:**
1. Open browser DevTools → Network tab
2. Open `pages/verify-danny.html`
3. Complete Turnstile verification
4. Watch for POST request

**Expected Results:**
- ✅ POST request to `/api/verify-danny`
- ✅ Content-Type: `application/json`
- ✅ Body contains `{ "token": "<turnstile-token>" }`
- ✅ Status code 200 (or 302 if redirect configured)

**Status:** [ ] Pass [ ] Fail

---

### Task 6: Modal Appears on Invalid Token

**Steps:**
1. This requires API mock or local testing
2. If API returns error response, modal should appear
3. Alternative: Manually trigger error modal via console:
   ```javascript
   showErrorModal('INVALID_CODE', 'Test error message');
   ```

**Expected Results:**
- ✅ Modal overlay appears (semi-transparent black background)
- ✅ Modal content centered on screen
- ✅ Modal has "Verification Failed" title
- ✅ Error message displays correctly
- ✅ Close button visible

**Status:** [ ] Pass [ ] Fail

---

### Task 7: Modal Shows Correct Error Codes

**Steps:**
Test each error code by calling `showErrorModal()` with different codes:

| Error Code | Expected Title |
|------------|----------------|
| INVALID_CODE | Verification Failed |
| EXPIRED_TOKEN | Token Expired |
| RATE_LIMITED | Too Many Attempts |
| SERVICE_UNAVAILABLE | Service Unavailable |
| CONFIG_ERROR | Configuration Error |
| TURNSTILE_ERROR | Security Check Failed |
| TIMEOUT_ERROR | Timeout Error |

**Expected Results:**
- ✅ Each error code maps to correct title
- ✅ Modal displays immediately
- ✅ Title uses red color (#D64E34)

**Status:** [ ] Pass [ ] Fail

---

### Task 8: Modal Shows Correct Error Messages

**Steps:**
Test each error message per CONTEXT.md locked decisions:

| Error Code | Expected Message |
|------------|------------------|
| INVALID_CODE | "The verification code was incorrect. Please try again." |
| EXPIRED_TOKEN | "The verification code has expired. Please start over." |
| RATE_LIMITED | "Too many failed attempts. Please wait before trying again." |
| SERVICE_UNAVAILABLE | "The security service is temporarily unavailable. Please try again later." |

**Expected Results:**
- ✅ Messages match exactly per CONTEXT.md
- ✅ Text color is grey (#535A60)
- ✅ Message wraps correctly in modal

**Status:** [ ] Pass [ ] Fail

---

### Task 9: Widget Resets After Modal Closed

**Steps:**
1. Trigger error modal (via API error or manual call)
2. Click "Close" button
3. Verify widget state

**Expected Results:**
- ✅ Modal closes (display: none)
- ✅ Turnstile widget resets to initial state
- ✅ User can re-complete verification
- ✅ New token can be generated

**Status:** [ ] Pass [ ] Fail

---

### Task 10: Redirect to danny.tamtham.com on Valid Token

**Steps:**
1. Open `pages/verify-danny.html`
2. Complete Turnstile verification
3. Ensure API returns valid response with redirectUrl

**Expected Results:**
- ✅ Browser navigates to `https://danny.tamtham.com`
- ✅ Or uses redirect query parameter if provided
- ✅ No error modal appears on success

**Status:** [ ] Pass [ ] Fail

---

### Task 11: Helen Gate Pages (Same Checklist)

**Steps:**
Repeat Tasks 1-10 for `pages/verify-helen.html`:

| Task | Danny Result | Helen Result |
|------|--------------|--------------|
| 1. Widget renders | [ ] | [ ] |
| 2. Widget renders | [ ] | [ ] |
| 3. Loads from CDN | [ ] | [ ] |
| 4. Button disabled | [ ] | [ ] |
| 5. API call made | [ ] | [ ] |
| 6. Modal on error | [ ] | [ ] |
| 7. Error codes | [ ] | [ ] |
| 8. Error messages | [ ] | [ ] |
| 9. Widget resets | [ ] | [ ] |
| 10. Redirect | [ ] | [ ] |

**Redirect URL:** Should be `https://helen.tamtham.com` (not danny.tamtham.com)

**Status:** [ ] Pass [ ] Fail

---

## Test Scenarios

### Scenario A: Valid Token Flow
1. Open gate page
2. Complete Turnstile verification
3. API validates token successfully
4. **Expected:** Redirect to subdomain

**Result:** [ ] Pass [ ] Fail

---

### Scenario B: Invalid Token Flow
1. Open gate page
2. Complete Turnstile verification
3. API rejects token (invalid/expired)
4. **Expected:** Error modal appears with INVALID_CODE

**Result:** [ ] Pass [ ] Fail

---

### Scenario C: Expired Token Flow
1. Open gate page
2. Wait for token to expire (or simulate)
3. Submit expired token
4. **Expected:** Error modal with EXPIRED_TOKEN

**Result:** [ ] Pass [ ] Fail

---

### Scenario D: Rate Limited Flow
1. Open gate page
2. Submit 3+ failed verification attempts
3. **Expected:** Error modal with RATE_LIMITED

**Result:** [ ] Pass [ ] Fail

---

### Scenario E: Network Error Flow
1. Open gate page
2. Disable network in DevTools
3. Complete Turnstile verification
4. **Expected:** Error modal with SERVICE_UNAVAILABLE

**Result:** [ ] Pass [ ] Fail

---

## Pass/Fail Criteria

**Overall Result:** [ ] PASS [ ] FAIL

**Requirements:**
- ✅ All 11 checklist items pass
- ✅ All 5 test scenarios pass
- ✅ No console errors or warnings
- ✅ Modal styling matches brand colors
- ✅ Widget loads from correct CDN

**Notes:**
```
[Document any issues, deviations, or observations here]
```

---

## Human Verification Checkpoint

**Action Required:** Complete all checklist items above and mark as Pass/Fail.

**To Continue:** Type "approved" if all checks pass, or describe specific issues if any fail.

---

*Created: 2026-03-13*  
*Phase: 03-security-gates*  
*Plan: 04*
