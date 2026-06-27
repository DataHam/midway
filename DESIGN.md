---
name: Tam-Tham
description: Digital business card and professional front door for tamtham.com — the warm handshake after an NFC tap.
colors:
  harbour-navy: "#103248"
  handshake-yellow: "#F0D04C"
  coastal-teal: "#7DC2B6"
  slate-blue: "#385C8F"
  signal-coral: "#D64E34"
  slate-grey: "#535A60"
  card-white: "#FFFFFF"
  mist-grey: "#F1F3F4"
typography:
  display:
    fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 6vw, 3.75rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  xl: "80px"
components:
  button-primary:
    backgroundColor: "{colors.handshake-yellow}"
    textColor: "{colors.harbour-navy}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.slate-blue}"
    textColor: "{colors.card-white}"
  button-secondary:
    backgroundColor: "{colors.slate-blue}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.sm}"
    padding: "16px 24px"
  button-verify:
    backgroundColor: "{colors.harbour-navy}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.sm}"
    padding: "16px 32px"
  button-verify-hover:
    backgroundColor: "{colors.slate-blue}"
    textColor: "{colors.card-white}"
  card:
    backgroundColor: "{colors.card-white}"
    rounded: "{rounded.md}"
    padding: "24px"
  nav:
    backgroundColor: "{colors.harbour-navy}"
    textColor: "{colors.card-white}"
    rounded: "{rounded.sm}"
    padding: "16px 24px"
---

# Design System: Tam-Tham

## 1. Overview

**Creative North Star: "The Warm Handshake"**

This is the moment after a real introduction. Someone has just met Danny or
Helen, tapped the NFC card, and is standing there — phone in hand,
mid-conversation. The interface is the digital continuation of that handshake:
**Deep Harbour Navy** carries the gravitas of established expertise, and
**Handshake Yellow** is the warm gesture of greeting laid over it. The system is
confident but welcoming. It conveys "you're in good hands" without ever raising
its voice.

The personality is warm, credible, and human. Navy and white do the steady,
trustworthy work; the yellow and a calm coastal teal carry the warmth and the
human gesture. Density is generous and unhurried — single ideas per fold, lots
of breathing room, thumb-reachable actions. Depth is soft and lifted: surfaces
rest on a gentle shadow and rise to meet a hover, the way a card lifts off a
table when you pick it up. Nothing is sharp, brittle, or cold.

This system explicitly rejects the **generic SaaS landing** (gradient hero +
feature grid + big-number metric — this is two people, not a product), the
**Linktree link-dump** (the routing between Danny and Helen is a designed moment,
not a bare stack of buttons), **flashy over-animation** (motion is quiet and
purposeful; effects never undercut professional seriousness), and **dated 2010s
brochureware** (no stock-photo-and-stacked-sections corporate feel).

**Key Characteristics:**
- Navy-grounded with a single warm gold gesture — credibility plus warmth
- Mobile-moment first: one-handed, post-introduction, variable lighting
- Soft, lifted depth — friendly and tactile, never flat-and-cold or harsh
- Montserrat throughout, carried by weight contrast (700 / 600 / 400)
- Routing between two people is the central design problem, not an afterthought

## 2. Colors

A navy-anchored palette where a single warm gold carries the greeting and a
coastal teal carries the calm. Color does the emotional work; white does the
breathing.

### Primary
- **Deep Harbour Navy** (#103248): The foundation. Hero overlays, the floating
  nav, the footer, the verify-gate gradient, and nearly all heading and primary
  body text on light surfaces. This is the color of trust and gravitas — it is
  on screen more than any other color.
- **Handshake Yellow** (#F0D04C): The warm gesture and the single loudest voice.
  Reserved for the primary call-to-action (Contact / Save), the nav wordmark and
  active-link underline, and small accent marks. **Only ever placed on navy or
  used as a button fill behind navy text** — never as text or an icon on white.

### Secondary
- **Coastal Teal** (#7DC2B6): The calm human accent. Hero subheadline, job
  titles ("BSc, MBA — Principal Consultant"), and supporting iconography.
  Carries warmth without competing with the yellow. **Legible only on navy or as
  a large display element — it fails as small text on white** (≈2:1).
- **Slate Blue** (#385C8F): The interactive partner. Inline links on white, the
  universal button-hover fill, and supporting service-card iconography. The
  color things turn when you touch them.

### Tertiary
- **Signal Coral** (#D64E34): Error and failure only. Verify-failure modal
  titles, error-icon badge, validation messaging. Never decorative; its
  appearance always means something went wrong.

### Neutral
- **Slate Grey** (#535A60): Default body and secondary text — but **only on
  white or Mist Grey**, where it clears AA (≈6.9:1). It must not sit on navy.
- **Card White** (#FFFFFF): Page background and the surface of every card,
  profile panel, and the verify gate. The breathing room of the system.
- **Mist Grey** (#F1F3F4): The faint sectioning tone that separates a white card
  band from the next section (e.g. the consulting-services band). Replaces the
  currently-undefined `bg-light-grey` utility.

### Named Rules
**The One Warm Voice Rule.** Handshake Yellow appears on no more than one
decisive element per fold — the primary action. Its rarity is what makes the
handshake feel personal rather than promotional. If two yellows compete on a
screen, one of them is wrong.

**The Yellow-On-Navy Rule.** Handshake Yellow and Coastal Teal are *forbidden*
as small text or icons on white or Mist Grey. They live on navy, or they are
large, or they are a fill behind dark text. No exceptions.

## 3. Typography

**Display Font:** Montserrat (with `ui-sans-serif, system-ui, sans-serif`)
**Body Font:** Montserrat (with `ui-sans-serif, system-ui, sans-serif`)
**Label/Accent Font:** Montserrat (no separate family)

**Character:** One geometric humanist sans, carried entirely by weight and size
contrast. Montserrat's even, open letterforms read as professional and
approachable at once — corporate enough to trust, rounded enough to feel human.
The discipline is in the contrast: Bold (700) for authority, SemiBold (600) for
labels and actions, Regular (400) for calm reading. Three weights, self-hosted
WOFF2, no second family invited.

### Hierarchy
- **Display** (700, `clamp(2.25rem, 6vw, 3.75rem)`, line-height 1.1): The hero
  headline only — "Tam-Tham Consulting & Research". Tight tracking (-0.01em),
  `text-wrap: balance`. One per page.
- **Headline** (700, 1.875rem / `text-3xl`, line-height 1.2): Section titles
  ("Consulting Services"). Navy, often centered.
- **Title** (600–700, 1.25–1.5rem / `text-xl`–`text-2xl`, line-height 1.3):
  Profile names and service-card titles. Navy.
- **Body** (400, 1rem, line-height 1.6): Paragraph and list copy. Slate Grey on
  white. Hold to 65–75ch max line length.
- **Label** (600, 0.875rem / `text-sm`, line-height 1.4): Job titles, contact
  lines, footnotes, button text. Job titles are Coastal Teal *only on navy*;
  on white they are Slate Grey or navy.

### Named Rules
**The Weight-Is-Hierarchy Rule.** Differentiation comes from weight and size,
never from a second font and never from all-caps body. Caps are reserved for
nothing here — even labels are sentence case. If a heading needs more presence,
it gets heavier or larger, not a new typeface.

## 4. Elevation

Soft and lifted. Surfaces are not flat — they rest on a gentle shadow and rise
on interaction, giving the system a friendly, tactile, picked-up-off-the-table
feel that suits the warm register. Depth is real but never heavy; shadows stay
diffuse and low-contrast so nothing reads as a hard 2010s drop-shadow.

### Shadow Vocabulary
- **Resting card** (`box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)` — Tailwind `shadow-md`): Service cards and content panels at rest.
- **Lifted panel** (`box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)` — Tailwind `shadow-lg`): Profile cards and the floating nav at rest.
- **Hover lift** (`box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)` — Tailwind `shadow-xl`): The state every card rises to on hover.
- **Overlay gate** (`box-shadow: 0 8px 32px rgba(0,0,0,0.2)`): The verify gate floating on the navy gradient.
- **Modal** (`box-shadow: 0 10px 40px rgba(0,0,0,0.3)`): Error/verification modals above the dimmed backdrop.

### Named Rules
**The Rise-To-Meet Rule.** Cards rest on `shadow-md`/`shadow-lg` and rise to
`shadow-xl` on hover with a 200ms transition. The lift always animates `shadow`
(and optionally a 2–5px `translateY`), never layout. The card meets the cursor;
it never jumps.

## 5. Components

### Buttons
- **Shape:** Gently rounded (8px / `rounded.sm`). Never pill, never square.
- **Primary (Action):** Handshake Yellow fill, navy text, SemiBold (600), padding
  `12px 24px`. The save/contact CTA. On the hero, the bio routes use the Slate
  Blue secondary fill so the yellow contact actions stay dominant.
- **Hover / Focus:** Fill shifts to Slate Blue with white text over 200ms; a
  `focus:ring-2` in Handshake Yellow on focus-visible. Optional `scale(1.03)`
  lift on the hero routes — confident and tactile.
- **Secondary (Route):** Slate Blue fill, white text — the "go to this person"
  buttons. Same shape and hover logic, lower visual priority than the yellow CTA.
- **Verify (Gate):** Full-width Deep Harbour Navy fill, white text, padding
  `16px 32px`, hover to Slate Blue. Disabled state drops to 0.6 opacity with
  `not-allowed` cursor.

### Cards / Containers
- **Corner Style:** 12px (`rounded.md`); the verify gate uses 16px (`rounded.lg`).
- **Background:** Card White on a white or Mist Grey section band.
- **Shadow Strategy:** See Elevation — `shadow-md`/`shadow-lg` at rest, `shadow-xl`
  on hover, 200ms.
- **Border:** None. Depth comes from shadow and tonal separation, not strokes.
- **Internal Padding:** 24px (`spacing.md`); the verify gate uses 48px.

### Navigation
- **Style:** A floating, detached bar — `fixed` and inset 16px from the top and
  sides, Deep Harbour Navy at 95% opacity with a subtle backdrop blur, 8px
  corners, `shadow-lg`.
- **Typography:** Yellow wordmark (700); white links (600).
- **States:** Links default white, hover to Handshake Yellow (200ms); the active
  page link is Handshake Yellow with a 2px yellow bottom border.
- **Mobile:** Collapses to a hamburger; the menu expands inside the same floating
  bar. Closes on link click, on Escape (returning focus to the toggle), and
  tracks `aria-expanded`.

### Verify Gate (Signature Component)
The contact flow's centerpiece: a white card (16px corners, soft overlay shadow)
centered on a navy→slate-blue diagonal gradient. Navy title, Slate Grey
explanatory copy, the Cloudflare Turnstile widget, and a full-width navy verify
button. Failures surface in a centered modal with a Signal Coral icon badge and
title. This is the "earn the save" moment — it must feel secure and calm, never
alarming.

## 6. Do's and Don'ts

### Do:
- **Do** anchor every screen in Deep Harbour Navy (#103248) and reserve
  Handshake Yellow (#F0D04C) for the single primary action per fold — *The One
  Warm Voice Rule*.
- **Do** keep Slate Grey (#535A60) body text on white or Mist Grey, where it
  clears WCAG AA (≈6.9:1).
- **Do** rest cards on a soft shadow and rise to `shadow-xl` on hover over 200ms
  — *The Rise-To-Meet Rule*.
- **Do** carry hierarchy with Montserrat weight (700 / 600 / 400) and size, never
  a second typeface.
- **Do** treat the Danny ↔ Helen routing as a designed moment, with real warmth
  in the copy and layout.
- **Do** define the Mist Grey (#F1F3F4) token and use it for section bands;
  replace the undefined `bg-light-grey` utility that currently renders as nothing.

### Don't:
- **Don't** place Handshake Yellow or Coastal Teal as small text or icons on
  white or Mist Grey — they fail contrast (≈2:1). Keep them on navy or large —
  *The Yellow-On-Navy Rule*.
- **Don't** put Slate Grey text on the navy footer or any navy surface (≈2:1,
  fails AA). Use white or Coastal Teal on navy instead.
- **Don't** build a **generic SaaS landing** — no gradient hero + feature grid +
  big-number metric. This is two people, not a product.
- **Don't** let the page become a **Linktree link-dump** — a bare stack of routing
  buttons with no point of view.
- **Don't** add **flashy or heavy animation** — motion is quiet, purposeful, and
  always has a `prefers-reduced-motion` fallback.
- **Don't** ship **dated 2010s brochureware** — stacked stock-photo sections and
  hard drop-shadows.
- **Don't** repeat the identical icon-chip + heading + paragraph service card as
  the answer to every section; vary the affordance when the content differs.
- **Don't** use all-caps body copy or a tracked uppercase eyebrow above every
  section.
