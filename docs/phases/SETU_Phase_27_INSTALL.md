# SETU Phase 27 — Accessibility + Mobile Excellence

## Goal

Phase 27 strengthens the citizen-facing UI for keyboard users, users who need
larger text, users sensitive to motion, users who need stronger contrast, and
citizens accessing SETU on smaller screens.

## Files

Frontend:
- `frontend/src/components/AccessibilityToolbar.tsx`
- `frontend/src/components/SkipLink.tsx`
- `frontend/src/components/ResponsiveNavMenu.tsx`
- `frontend/src/app/accessibility/page.tsx`
- `frontend/src/styles/phase27-accessibility.css`
- `frontend/src/lib/a11y.ts`
- `frontend/src/app/layout.phase27-snippet.tsx`

Optional backend metadata:
- `backend/app/api/v1/accessibility.py`
- `backend/app/api/v1/router_phase27_snippet.py`

## Installation

### 1. Add CSS

Merge `phase27-accessibility.css` into the project's global stylesheet, or
import it through the existing stylesheet strategy.

### 2. Root layout

Add `<SkipLink />` and `<AccessibilityToolbar />` once in the root layout.
Do not create a second root layout.

### 3. Main landmark

Ensure the primary content container uses:

`<main id="main-content">`

### 4. Accessibility page

Open:

`/accessibility`

This page provides the citizen-facing explanation and controls.

### 5. Mobile navigation

Use `ResponsiveNavMenu` for a mobile navigation surface where appropriate.
Keep the existing SETU navigation labels and language provider integration.

## Implemented accessibility features

- visible keyboard focus
- skip-to-main-content link
- accessible button names
- `aria-expanded` for mobile menu
- `aria-pressed` for preference toggles
- live-region helper
- text-size scaling
- high-contrast preference
- reduced-motion preference
- touch-friendly minimum control sizing
- responsive cards and layouts

## Important production QA

This phase is a foundation, not a certification.

Before production, test with:
- keyboard-only navigation
- NVDA/JAWS/VoiceOver
- Chrome/Edge/Safari/Firefox
- 200% browser zoom
- 320px wide viewport
- landscape mobile
- reduced-motion OS setting
- high-contrast/forced-colors environments
- forms with validation errors
- long Hindi/Marathi labels
- slow network conditions

Use an automated accessibility scanner such as axe or Lighthouse as a
supplement, not as the only accessibility test.

## Mobile / low-bandwidth direction

Citizen flows should:
- avoid unnecessary large media
- keep primary actions visible
- preserve state during navigation
- provide clear loading/error states
- avoid horizontal scrolling
- use compressed assets
- progressively enhance non-essential UI

## Compatibility

Phase 27 is additive and does not remove existing SETU functionality.
