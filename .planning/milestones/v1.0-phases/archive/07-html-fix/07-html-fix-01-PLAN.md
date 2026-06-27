---
phase: 07-html-fix
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - pages/verify-danny.html
autonomous: true
requirements:
  - GATE-02
---

<objective>
Fix malformed HTML in error modal of verify-danny.html.

Purpose: Remove duplicate/incorrect HTML structure at lines 295-300 that breaks the error modal rendering. This closes the GATE-02 gap where error modal displays incorrectly.

Output: Clean error modal HTML structure that displays properly on failed verification.
</objective>

<execution_context>
@C:/Users/DannyTam-Tham/.config/opencode/get-shit-done/workflows/execute-plan.md
@C:/Users/DannyTam-Tham/.config/opencode/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/ROADMAP.md
@.planning/phases/03-security-gates/03-security-gates-VERIFICATION.md

# Malformed HTML Issue

Lines 295-300 in verify-danny.html contain duplicate/incorrect HTML structure:

```html
<h2 class="error-title">Verification Failed</h2>
<p class="error-message" id="errorMessage">An error occurred during verification.</p>
<p class="error-code" id="errorCode"></p>
<button class="error-button" id="closeErrorModal">Try Again</button>
</div>
</div>
```

This should be removed. The correct modal structure is at lines 288-294:

```html
<div id="error-modal" class="modal" style="display: none;">
  <div class="modal-content">
    <h2 id="error-title">Verification Failed</h2>
    <p id="error-message">The verification code was incorrect. Please try again.</p>
    <button onclick="closeModal()">Close</button>
  </div>
</div>
```

The duplicate HTML causes malformed DOM structure and prevents the modal from rendering correctly.
</context>

<tasks>

<task type="auto">
  <name>Fix malformed HTML in error modal</name>
  <files>pages/verify-danny.html</files>
  <action>
    Remove the duplicate/incorrect HTML structure at lines 295-300:

    1. Delete lines 295-300 which contain:
       - `<h2 class="error-title">Verification Failed</h2>`
       - `<p class="error-message" id="errorMessage">...</p>`
       - `<p class="error-code" id="errorCode"></p>`
       - `<button class="error-button" id="closeErrorModal">Try Again</button>`
       - `</div>` (closing div)
       - `</div>` (closing div)

    2. Keep the correct modal structure at lines 288-294:
       ```html
       <div id="error-modal" class="modal" style="display: none;">
         <div class="modal-content">
           <h2 id="error-title">Verification Failed</h2>
           <p id="error-message">The verification code was incorrect. Please try again.</p>
           <button onclick="closeModal()">Close</button>
         </div>
       </div>
       ```

    3. Verify the modal structure is now valid HTML with proper nesting.

    Reference: Current malformed structure at lines 295-300 has duplicate closing tags and incorrect element structure.
  </action>
  <verify>
    <automated>grep -c "</div>" pages/verify-danny.html && grep -A 10 "Error Modal" pages/verify-danny.html | head -15</automated>
  </verify>
  <done>Malformed HTML removed, error modal has valid structure with proper nesting</done>
</task>

</tasks>

<verification>
1. Open verify-danny.html in browser
2. Trigger an error (e.g., submit invalid token)
3. Verify error modal displays correctly with:
   - Title: "Verification Failed"
   - Message: "The verification code was incorrect. Please try again."
   - Close button: "Close"
4. Verify no duplicate elements or malformed structure in modal
</verification>

<success_criteria>
- [ ] Malformed HTML at lines 295-300 removed
- [ ] Error modal has valid HTML structure
- [ ] Modal displays correctly on failed verification
- [ ] No duplicate closing tags or elements
- [ ] All 1 file modified successfully
</success_criteria>

<output>
After completion, create `.planning/phases/07-html-fix/07-html-fix-01-SUMMARY.md`
</output>
