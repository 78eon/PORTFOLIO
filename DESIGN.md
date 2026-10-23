---
name: NEON research notebook
description: Editorial security research after dark
colors:
  background: "#080c12"
  surface: "#111922"
  surface-secondary: "#17222d"
  foreground: "#f0f4f5"
  secondary: "#a1abb5"
  muted: "#8c9ba7"
  accent: "#a4f4c4"
  accent-hover: "#c3f9d8"
  cyan: "#79d9e8"
  border: "#263640"
  border-strong: "#486354"
  error: "#fda4af"
typography:
  display:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(45px, 6.3vw, 88px)"
    fontWeight: 600
    lineHeight: 1.09
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "clamp(27px, 3vw, 38px)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.035em"
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "16px"
    lineHeight: 1.8
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "12px"
rounded:
  field: "7px"
  button: "8px"
  card: "12px"
spacing:
  grid: "20px"
  featured-grid: "24px"
  section: "88px"
  section-mobile: "56px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.background}"
    rounded: "{rounded.button}"
    padding: "14px 22px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
  button-quiet:
    textColor: "{colors.secondary}"
    rounded: "{rounded.button}"
    padding: "14px 22px"
  button-outline:
    textColor: "{colors.accent}"
    rounded: "{rounded.button}"
    padding: "14px 22px"
  research-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.card}"
    padding: "26px"
  contact-field:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.field}"
    padding: "13px 14px"
---

# Design System: NEON

## Overview

**Creative North Star: "The Research Notebook After Dark"**

An editorial research notebook after dark: ink-blue surfaces, generous typography, soft mint interaction and a geometric network illustration. Premium restraint keeps real research readable. Homepage mode is Experience; articles are Read; admin, editor and login are Operate.

**Key Characteristics:**
- Editorial hierarchy and generous negative space.
- Ink surfaces, mint actions and restrained cyan illustration detail.
- Evidence before claims; accessible interaction before decoration.

## Colors

The primary mint accent marks actions, focus and selected state. Cyan is secondary illustration detail. Ink neutrals provide a dark canvas, layered surfaces, readable foreground, supporting text, metadata and quiet dividers. The frontmatter records the normative values from `styles/globals.css`; error pink marks form failure.

**The Readable Evidence Rule.** Body and metadata target at least 4.5:1 contrast. Selection reverses ink and mint. Carets and consent checkboxes use mint.

## Typography

Self-hosted variable Manrope (200–800), with system sans-serif fallback; the SIL OFL license lives in `public/fonts`. There are no remote font requests. Display and headline roles use the frontmatter scale; mobile hero text uses `clamp(37px, 9.1vw, 58px)`. The desktop About heading reaches 48px and contact heading 43px. Body copy varies by context (13–16px); article text uses the body role and a maximum width of 75ch. Tracking never goes below -.04em.

System monospace is reserved for dates, counts, code, technical article metadata and existing editor controls. A Georgia quotation mark is a small editorial ornament.

## Layout

Main shell maximum is 1240px, with gutters of 48px desktop, 28px at 1000px and below, and 20px at 640px and below. Sections use 88px vertical padding, falling to 56px on mobile. Research archive and credentials use three columns, two below 1000px, and one below 640px. Featured research pairs one large entry with an editorial note; About and Contact become single columns on mobile. Credentials use open rows. Reading surfaces retain their existing page containers; the shared shell does not mandate their width.

## Elevation & Depth

Depth comes from tonal layering and fine borders, without a shadow vocabulary. Featured research uses a subtle green-to-surface gradient; the decorative hero uses faint orbital outlines and a radial tint. Cards lift 4px on hover over 200ms and strengthen their border; buttons lift 2px over 180ms.

## Shapes

Fields and filter controls have gently rounded corners (7px); buttons and reading images use 8px; research cards and code containers use 12px. Fine borders define fields, cards and dividers. Circular geometry is reserved for illustration, status dots and badges. Global keyboard focus is a 2px mint outline offset 5px. Contact fields instead use a mint border with a translucent 2px outline offset 2px.

## Components

**Buttons and filters.** Primary actions are mint with ink text; quiet actions reveal a surface on hover; outline actions retain mint text and a fine border. Buttons have a minimum height of 48px; filters have 44px targets, selected tint and `aria-pressed`. Disabled primary actions reduce opacity and stop lifting. Mobile button padding narrows to 16px.

**Research cards.** Full semantic links contain a category, machine-readable date, title and readable excerpt. Standard padding is 26px; featured padding is 36px, returning to 26px on mobile. Stable-key result cards enter over 400ms without empty grid slots or route-transition wrappers.

**Navigation.** SiteHeader uses native link behavior, a current-section underline and a scroll border. Its mobile disclosure supports Escape and restores focus to its toggle. SiteFooter links to verified GitHub, notes and privacy.

**Forms and operation surfaces.** ContactForm has associated labels, autocomplete, consent, disabled/loading states, a synchronous duplicate guard, retained values after errors, network/non-JSON recovery, live status and focused success. Admin/editor/login share the palette, rounded fields and restrained state transitions while retaining their existing functional layout. CookieBanner stores preference resiliently with `useSyncExternalStore`.

**Evidence viewer.** ImageLightbox uses a native modal dialog with focus containment/restoration, Escape, visible Previous/Next controls and arrow navigation. External evidence and credential images retain native loading for arbitrary database URLs; badge dimensions are reserved and offscreen images lazy-load.

**Motion and illustration.** Entrances use `cubic-bezier(.22,1,.36,1)` and begin at .65 opacity. Hero timing is 450–650ms with at most 160ms stagger; shared legacy entrances use 500ms; mobile menu uses 200ms. Canvas is dynamically imported, decorative and pointer-transparent. It draws 44 nodes, or 16 below a 600px container, with a 32ms minimum draw interval (approximately 30 FPS; refresh-rate dependent), DPR capped at 1.5 and no React frame state. It pauses when hidden or out of view and cleans up observers/listeners. Pointer emphasis requires a fine pointer. Reduced motion draws a static frame, removes CSS animation/transitions and smooth scrolling, and disables hover lifts.

Local production targets are Lighthouse performance ≥90 and accessibility ≥95, LCP ≤2.5s and CLS ≤.1. INP ≤200ms requires field measurement; local audit results belong in `VALIDATION.md`. No animation dependency or WebGL is used.

## Do's and Don'ts

- Do use database records for research, categories and credentials.
- Do preserve keyboard focus, semantic links, readable text contrast and reduced motion.
- Do keep article text at a comfortable 75ch maximum.
- Don't invent research, accomplishments, availability or monitoring telemetry.
- Don't add animation dependencies or make content wait for JavaScript entrance effects.
- Don't treat decorative borders as a substitute for control focus.
