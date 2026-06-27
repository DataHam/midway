---
phase: 03-security-gates
plan: 04
type: execute
wave: 3
depends_on:
  - 03-security-gates-01
  - 03-security-gates-02
  - 03-security-gates-03
files_modified:
  - pages/verify-danny.html
  - pages/verify-helen.html
  - tests/03-security-gates/gate-pages.manual.test.md
autonomous: false
requirements:
  - GATE-01
  - GATE-02
  - GATE-03
user_setup:
  - service: cloudflare
    why: "Turnstile widget requires sitekey"
    env_vars:
      - name: TAMTHAM_SITEKEY
        source: "Cloudflare Dashboard -> Turnstile -> Your Sites"
    dashboard_config:
      - task: "Create Turnstile site"
        location: "https://dash.cloudflare.com/turnstile"
        description: "Register domain for Turnstile widget"

must_haves:
  truths:
    - Turnstile widget renders on verify-danny.html
    - Turnstile widget renders on verify-helen.html
    - Widget loads from challenges.cloudflare.com/turnstile/v0/api.js
    - Submit button disabled during validation
    - Modal dialog appears on failed verification
    - Error code displayed in modal
    - Error message displayed in modal
    - Widget resets after failed attempt
    - Redirect occurs on successful verification
  artifacts:
    - path: "pages/verify-danny.html"
      provides: "Danny gate page with Turnstile integration"
      contains: "turnstile widget, modal dialog, submit button"
      min_lines: 100
    - path: "pages/verify-helen.html"
      provides: "Helen gate page with Turnstile integration"
      contains: "turnstile widget, modal dialog, submit button"
      min_lines: 100
    - path: "tests/03-security-gates/gate-pages.manual.test.md"
      provides: "Manual verification checklist"
      contains: "checklist items for UI verification"
  key_links:
    - from: "pages/verify-danny.html"
      to: "src/api/verify-danny/index.js"
      via: "fetch('/api/verify-danny', { method: 'POST' })"
      pattern: "fetch.*api/verify-danny"
    - from: "pages/verify-helen.html"
      to: "src/api/verify-helen/index.js"
      via: "fetch('/api/verify-helen', { method: 'POST' })"
      pattern: "fetch.*api/verify-helen"

---

<objective>
Update gate pages with Turnstile widget integration, API calls, and error handling modal UI.

Purpose: Provide client-side verification interface that displays Turnstile widget, submits tokens to API endpoints, and shows error modals on validation failures.

Output: Updated verify-danny.html and verify-helen.html with full Turnstile integration, manual verification checklist.
</objective>

<execution_context>
@C:/Users/DannyTam-Tham/OneDrive - Tam-Tham/Projects/Corporation/.opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/DannyTam-Tham/OneDrive - Tam-Tham/Projects/Corporation/.opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/phases/03-security-gates/03-SECURITY-GATES-CONTEXT.md
@.planning/phases/03-security-gates/03-SECURITY-GATES-RESEARCH.md
@.planning/phases/03-security-gates/03-security-gates-01-SUMMARY.md

# Interface Context for Executors
# Extracted from RESEARCH.md — use these directly

## Turnstile Widget Integration Pattern
```javascript
// Cloudflare Turnstile widget with error handling
document.addEventListener('DOMContentLoaded', function() {
  // Sitekey injected at build time
  const sitekey = window.TAMTHAM_SITEKEY;
  
  if (!sitekey) {
    console.error('Sitekey not configured');
    showError('Configuration error. Please contact support.');
    return;
  }

  turnstile.render('#turnstile-widget', {
    sitekey: sitekey,
    callback: function(token) {
      // Token received, submit to API
      document.getElementById('submit-btn').disabled = true;
      submitVerification(token);
    },
    'error-callback': function(errorCode) {
      console.error('Turnstile error:', errorCode);
      handleTurnstileError(errorCode);
    },
    'expired-callback': function() {
      console.log('Token expired');
      turnstile.reset('turnstile-widget');
    },
    'timeout-callback': function() {
      console.log('Challenge timed out');
      document.getElementById('challenge-notice').style.display = 'block';
    }
  });
});

async function submitVerification(token) {
  try {
    const response = await fetch('/api/verify-danny', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token })
    });

    const data = await response.json();

    if (data.success) {
      // Redirect to subdomain
      window.location.href = data.redirectUrl;
    } else {
      // Show error modal
      showErrorModal(data.error, data.message);
      // Reset widget for retry
      turnstile.reset('turnstile-widget');
    }
  } catch (error) {
    console.error('Network error:', error);
    showErrorModal('SERVICE_UNAVAILABLE', 'The security service is temporarily unavailable.');
    turnstile.reset('turnstile-widget');
  }
}

function showErrorModal(errorCode, message) {
  const modal = document.getElementById('error-modal');
  const errorTitle = document.getElementById('error-title');
  const errorMessage = document.getElementById('error-message');
  
  errorTitle.textContent = getErrorTitle(errorCode);
  errorMessage.textContent = message;
  modal.style.display = 'flex';
}

function getErrorTitle(errorCode) {
  const titles = {
    'INVALID_CODE': 'Verification Failed',
    'EXPIRED_TOKEN': 'Token Expired',
    'RATE_LIMITED': 'Too Many Attempts',
    'SERVICE_UNAVAILABLE': 'Service Unavailable'
  };
  return titles[errorCode] || 'Error';
}
```

## Modal UI Structure (from CONTEXT.md)
```html
<!-- Error Modal -->
<div id="error-modal" class="modal" style="display: none;">
  <div class="modal-content">
    <h2 id="error-title">Verification Failed</h2>
    <p id="error-message">The verification code was incorrect. Please try again.</p>
    <button onclick="closeModal()">Close</button>
  </div>
</div>

<style>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  text-align: center;
}

.modal-content h2 {
  color: #D64E34; /* Red per brand colors */
  margin-bottom: 1rem;
}

.modal-content p {
  color: #535A60; /* Grey per brand colors */
  margin-bottom: 1.5rem;
}

.modal-content button {
  background: #103248; /* Navy per brand colors */
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

## Build-Time Sitekey Injection
```html
<!-- Injected at build time by build script -->
<script>
  window.TAMTHAM_SITEKEY = "0x4AAAA...";
</script>

<!-- Turnstile Widget Script -->
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>

<!-- Widget Container -->
<div id="turnstile-widget"></div>
```

## Error Messages (from CONTEXT.md locked decisions)
- `INVALID_CODE` — "The verification code was incorrect. Please try again."
- `EXPIRED_TOKEN` — "The verification code has expired. Please start over."
- `RATE_LIMITED` — "Too many failed attempts. Please wait before trying again."
- `SERVICE_UNAVAILABLE` — "The security service is temporarily unavailable. Please try again later."
</context>

<tasks>

<task type="auto">
  <name>Task 1: Update verify-danny.html with Turnstile integration</name>
  <files>pages/verify-danny.html</files>
  <action>
Update verify-danny.html with full Turnstile widget integration:

**Structure**
- Keep existing placeholder structure from Phase 2
- Add Turnstile widget script: `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>`
- Add sitekey injection: `<script>window.TAMTHAM_SITEKEY = "BUILD_TIME_SITEKEY";</script>`
- Add widget container: `<div id="turnstile-widget"></div>`
- Add submit button: `<button id="submit-btn" onclick="submitVerification()">Verify and Continue</button>`
- Add error modal (see UI structure above)

**JavaScript**
- Implement DOMContentLoaded listener to render widget
- Implement submitVerification(token) function
- Implement showErrorModal(errorCode, message) function
- Implement closeModal() function
- Implement error callbacks (error-callback, expired-callback, timeout-callback)

**Styling**
- Use existing Tailwind classes from index.html
- Apply brand colors (Navy #103248, Yellow #F0D04C, Red #D64E34, Blue #385C8F, Grey #535A60)
- Modal styling per UI structure above
- Submit button disabled state during validation

**Behavior**
- Submit button disabled immediately after callback fires
- Widget resets on failed verification
- Redirect to https://danny.tamtham.com on success
- Show modal on any API error
- Log all events to console for debugging
  </action>
  <verify>
    <automated>node tests/03-security-gates/validate-gate-pages.js</automated>
  </verify>
  <done>
    - verify-danny.html loads Turnstile widget from challenges.cloudflare.com
    - Widget renders with sitekey from window.TAMTHAM_SITEKEY
    - Submit button disabled during validation
    - Modal dialog appears on failed verification
    - Modal shows correct error code and message
    - Widget resets after failed attempt
    - Redirect occurs on successful verification
  </done>
</task>

<task type="auto">
  <name>Task 2: Update verify-helen.html with Turnstile integration</name>
  <files>pages/verify-helen.html</files>
  <action>
Update verify-helen.html with full Turnstile widget integration (same pattern as Danny but Helen-specific):

**Structure**
- Keep existing placeholder structure from Phase 2
- Add Turnstile widget script: `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>`
- Add sitekey injection: `<script>window.TAMTHAM_SITEKEY = "BUILD_TIME_SITEKEY";</script>`
- Add widget container: `<div id="turnstile-widget"></div>`
- Add submit button: `<button id="submit-btn" onclick="submitVerification()">Verify and Continue</button>`
- Add error modal (same as Danny)

**JavaScript**
- Same implementation as verify-danny.html
- Only difference: API endpoint is /api/verify-helen instead of /api/verify-danny
- Redirect to https://helen.tamtham.com on success

**Styling**
- Same styling as verify-danny.html
- Use brand colors from Tailwind config

**Behavior**
- Same behavior as verify-danny.html
- Different API endpoint
- Different redirect URL
  </action>
  <verify>
    <automated>node tests/03-security-gates/validate-gate-pages.js</automated>
  </verify>
  <done>
    - verify-helen.html loads Turnstile widget from challenges.cloudflare.com
    - Widget renders with sitekey from window.TAMTHAM_SITEKEY
    - Submit button disabled during validation
    - Modal dialog appears on failed verification
    - Modal shows correct error code and message
    - Widget resets after failed attempt
    - Redirect occurs on successful verification to helen.tamtham.com
  </done>
</task>

<task type="auto">
  <name>Task 3: Create manual verification checklist</name>
  <files>tests/03-security-gates/gate-pages.manual.test.md</files>
  <action>
Create manual verification checklist for gate pages:

**Structure**
- Test environment setup instructions
- Step-by-step verification for verify-danny.html
- Step-by-step verification for verify-helen.html
- Expected results for each step
- Pass/fail criteria

**Checklist Items**
1. Turnstile widget renders on verify-danny.html
2. Turnstile widget renders on verify-helen.html
3. Widget loads from challenges.cloudflare.com (check Network tab)
4. Submit button disabled immediately after widget completion
5. API call made to /api/verify-danny (check Network tab)
6. Modal appears on invalid token
7. Modal shows correct error code (INVALID_CODE, EXPIRED_TOKEN, RATE_LIMITED, SERVICE_UNAVAILABLE)
8. Modal shows correct error message per CONTEXT.md
9. Widget resets after modal closed
10. Redirect to danny.tamtham.com on valid token
11. Same checklist for verify-helen.html (redirect to helen.tamtham.com)

**Test Scenarios**
- Valid token flow
- Invalid token flow
- Expired token flow
- Rate limited flow (3 failed attempts)
- Network error flow (simulate offline)

**Resume Signal**
- Type "approved" if all checks pass
- Describe issues if any checks fail
  </action>
  <verify>
    <automated>MISSING — Manual verification requires human interaction</automated>
  </verify>
  <done>
    - gate-pages.manual.test.md exists with complete checklist
    - All 11 checklist items documented
    - Test scenarios described
    - Pass/fail criteria clear
    - Human verification checkpoint created
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 4: Manual verification of gate pages</name>
  <files>pages/verify-danny.html, pages/verify-helen.html</files>
  <what-built>
    Complete gate page integration with Turnstile widget, API calls, and error modals
  </what-built>
  <how-to-verify>
    Follow checklist in tests/03-security-gates/gate-pages.manual.test.md:
    
    1. Open pages/verify-danny.html in browser
    2. Verify Turnstile widget renders
    3. Complete widget verification
    4. Verify redirect to https://danny.tamtham.com (or API response if testing locally)
    5. Open pages/verify-helen.html in browser
    6. Verify Turnstile widget renders
    7. Complete widget verification
    8. Verify redirect to https://helen.tamtham.com (or API response if testing locally)
    9. Test error modal by providing invalid token (requires API mock or local testing)
    10. Verify modal displays error code and message
    11. Verify widget resets after modal closed
  </how-to-verify>
  <resume-signal>Type "approved" if all checks pass, or describe issues if any fail</resume-signal>
</task>

</tasks>

<verification>
Wave 3 complete when:
1. verify-danny.html has Turnstile widget integration
2. verify-helen.html has Turnstile widget integration
3. Both pages load widget from challenges.cloudflare.com
4. Error modal displays on failed verification
5. Manual verification checklist exists and all checks pass
6. Redirect occurs on successful verification
</verification>

<success_criteria>
- Turnstile widget renders on both gate pages
- Widget loads from challenges.cloudflare.com/turnstile/v0/api.js per GATE-03
- Submit button disabled during validation
- Modal dialog displays on failed verification per CONTEXT.md
- Error codes displayed correctly (INVALID_CODE, EXPIRED_TOKEN, RATE_LIMITED, SERVICE_UNAVAILABLE)
- Error messages match CONTEXT.md locked decisions
- Widget resets after failed attempt
- Redirect to danny.tamtham.com/helen.tamtham.com on success
- Manual verification checklist completed and approved
</success_criteria>

<output>
After completion, create `.planning/phases/03-security-gates/03-security-gates-04-SUMMARY.md`
</output>
