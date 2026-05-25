# Accessibility

evo-quest is built for every high school student — including students
who navigate via keyboard, screen reader, low vision, motion
sensitivity, reading difference, or non-dominant hand. Accessibility is
a first-class invariant, not a retrofit.

This doc goes beyond app.md §19 to specify *per-game-type* a11y, the
exact keyboard maps, screen reader announcement patterns, and the
QA pass that every PR must satisfy.

---

## 1. Standards we hold to

- **WCAG 2.2 Level AA** as the minimum bar; **AAA** for color contrast
  on body text
- **Apple Human Interface Guidelines** for touch targets (≥44×44px)
- **Material You** for the bottom-sheet pattern on mobile
- **Inclusive Design Toolkit** (Microsoft) for permanent-vs-temporary-
  vs-situational disability framing

No "accessibility mode" toggle. The whole app is accessible by default.
Settings add personalization (font size, motion, dyslexia font) but the
baseline doesn't degrade gracefully — it starts strong.

---

## 2. Keyboard navigation

### 2.1 Universal shortcuts

| Key | Action |
|---|---|
| `Tab` / `Shift+Tab` | Move focus between interactive elements |
| `Enter` / `Space` | Activate focused control |
| `Esc` | Close any overlay; pause active session |
| `?` | Show keyboard shortcut help overlay |
| `/` | Focus search input where present (content stats, etymology garden) |
| `Home` / `End` | Jump to start/end of a list or grid |
| `Arrow keys` | Navigate within grids, lists, sliders |
| `1` through `4` | Activate power-up slots 1-3 (4 reserved for inventory open) |
| `n` | Next (after feedback panel, equivalent to clicking NEXT) |
| `p` | Pause (in /play) |
| `r` | Resume (from menu/home, if a session is resumable) |

### 2.2 Page-level shortcuts

- **Home (`/`)**: arrow keys navigate the achievement grid; `Enter`
  on a tile opens its popover; `e` (Embark) on a focused tile starts a
  1-unit micro-journey.
- **Journeys (`/journeys`)**: `j` / `k` to scroll the journey timeline
  (vim-style); `e` to open the Embark panel.
- **Content stats (`/content/stats`)**: arrow keys expand/collapse tree
  rows.

### 2.3 Focus rings

Every focusable element has a visible focus ring. The ring is:

```css
:focus-visible {
  outline: 2px solid var(--accent-cyan);
  outline-offset: 2px;
}
```

Color uses a high-visibility cyan that contrasts against both Wing
palettes (which are warm) and the dark base. Never removed via
`outline: none`.

### 2.4 Skip links

A "Skip to main content" link is the first focusable element on every
page. Hidden visually until focused, then snaps to the top.

---

## 3. Per-game-type keyboard maps

### 3.1 `speed-reveal-mnemonic`

| Element | Key | Action |
|---|---|---|
| Multiple-choice option | `Tab` to focus, `Enter`/`Space` to pick | answer |
| Fill input | `Tab` to focus, type | text |
| Hint reveal | (passive) | auto |
| ATP Boost power-up | `1`/`2`/`3` | activate slot |

### 3.2 `be-the-turtle`

| Element | Key | Action |
|---|---|---|
| Decision options | `Tab` cycles through; `Enter` picks | advance node |
| Fate trail | (display only) | — |
| Replay link (after terminal) | `Tab` to focus, `Enter` | restart |

### 3.3 `microworld-sandbox`

| Element | Key | Action |
|---|---|---|
| Slider | `Tab` focus, `←`/`→` decrement/increment by step | adjust |
| Slider (with `Shift`) | `Shift+←`/`Shift+→` by 10× step | coarse adjust |
| Run / Pause sim | `Space` | toggle |
| Bookmark current params | `b` | save bookmark |

### 3.4 `predict-run-reflect`

| Element | Key | Action |
|---|---|---|
| Numeric prediction input | `Tab`+ type | enter |
| Percentage breakdown | `Tab` between categories, type | enter |
| Curve drawing | `Tab` to canvas, `Arrow` keys move a cursor, `Enter` plot a point | construct curve |
| Bug-candidate chips | `Tab` cycles, `Enter` picks | classify |

### 3.5 `procedure-builder`

This is the trickiest a11y design. Drag-and-drop must work without a
mouse.

| Element | Key | Action |
|---|---|---|
| Block in palette | `Tab` to focus, `Enter` | start "carry" |
| In carry mode: assembly area | Arrow keys to navigate drop targets | move cursor |
| Drop target | `Enter` | place block |
| Block in assembly | `Tab` to focus, `Backspace` | remove |
| Block in assembly | `Shift+↑`/`↓` | reorder |
| Run | `Space` | run procedure |
| Reset | `Shift+R` | clear assembly |

A "carry mode" indicator (e.g., the carried block follows focus) is
visible during keyboard drag.

### 3.6 `recipe-sequencer`

| Element | Key | Action |
|---|---|---|
| Step card in shuffle | `Tab` to focus, `Enter` | pick up |
| In carry: slot | Arrow keys move between slots | navigate |
| Slot | `Enter` | drop step |
| Step in slot | `Tab` to focus, `Backspace` | remove |

### 3.7 `palace-walk`

| Element | Key | Action |
|---|---|---|
| Avatar | Arrow keys / WASD | move one tile |
| Avatar | `Enter` on a totem | trigger that totem's quiz |
| Avatar | `Space` | wait one beat (passes time, no movement) |
| Power-up `palace-portal` | `1`/`2`/`3` (whichever slot) | enter teleport mode |
| In teleport mode | Arrow keys to pick visited tile, `Enter` | confirm |

### 3.8 `punnett-builder`

| Element | Key | Action |
|---|---|---|
| Allele palette | `Tab` cycles, `Enter` | pick allele |
| In carry: header cells | Arrow keys to navigate row/column headers | navigate |
| Header cell | `Enter` | drop allele |
| Grid cell (after build) | `Tab` to focus, `1`/`2`/`3` for phenotype color | label |

### 3.9 `pedigree-detective`

| Element | Key | Action |
|---|---|---|
| Person in pedigree | `Tab` to focus | review |
| Person | `c` | toggle carrier mark |
| Hypothesis chip | `Tab` cycles, `Enter` | select hypothesis |
| Hypothesis | `?` | open explainer panel |

### 3.10 `etymology-puppet`

| Element | Key | Action |
|---|---|---|
| Morpheme token | `Tab` cycles, `Enter` | pick up |
| In carry: slot | Arrow keys | navigate |
| Slot | `Enter` | drop |
| Slot | `Backspace` | remove morpheme |

### 3.11 `mutation-lab`

| Element | Key | Action |
|---|---|---|
| Base position | `Tab` cycles, arrow keys move | navigate sequence |
| Base | `Shift+S` | substitute (open A/T/G/C picker) |
| Base | `Shift+I` | insert before |
| Base | `Shift+D` | delete |
| Prediction chips | `Tab` cycles, `Enter` | classify mutation |
| Translate / RUN | `Space` | run translation |

### 3.12 `concept-map-builder`

| Element | Key | Action |
|---|---|---|
| Node | `Tab` to focus | select |
| Node (selected) | `Enter` | start edge from this node |
| In edge mode | Arrow keys to navigate other nodes | pick destination |
| Destination | `Enter` | start label picker |
| Label picker | `Tab` cycles labels, `Enter` | commit edge |
| Edge | `Tab` to focus, `Backspace` | delete |

### 3.13 `food-web-builder`

Similar to concept-map-builder, but additionally:

| Element | Key | Action |
|---|---|---|
| Perturbation menu | `Tab` cycles, `Enter` | apply |
| Simulation | `Space` | run |

### 3.14 `debug-the-claim`

| Element | Key | Action |
|---|---|---|
| Paragraph (focusable as a whole) | `Tab` to focus | enter selection mode |
| In selection mode | Arrow keys move word-by-word | navigate |
| Word/phrase | `Enter` | claim as bug |
| Bug class chips | `Tab` cycles, `Enter` | classify |
| Fix textarea | `Tab` to focus, type | rewrite |

### 3.15 `counterfactual-lab`

| Element | Key | Action |
|---|---|---|
| Consequence card | `Tab` cycles, `Enter` | pick up |
| Slot in cascade chain | Arrow keys | navigate |
| Slot | `Enter` | drop |
| Slot | `Backspace` | remove |

### 3.16 `cladogram-crafter`

| Element | Key | Action |
|---|---|---|
| Taxon card | `Tab` cycles, `Enter` | pick up |
| Leaf slot in tree | Arrow keys | navigate |
| Leaf slot | `Enter` | place |
| Internal branch | `Tab` to focus, `Shift+arrow` | swap subtree position |

---

## 4. Screen reader patterns

### 4.1 Semantic structure

Every page has:

- Exactly one `<h1>` (the page title)
- Logical heading hierarchy (`<h2>` for major sections, `<h3>` for
  subsections — no skipped levels)
- `<main>`, `<nav>`, `<aside>` landmarks
- `<button>` (not `<div>` with onClick) for all interactive elements
- `<form>` with submit on text-input questions

### 4.2 Aria-live announcements

Critical state changes announce via `aria-live="polite"` regions:

| State | Announcement |
|---|---|
| Briefing card shows | "Question 3 of 15. Speed-reveal mnemonic." |
| Quiz appears | "Prompt: Miller and Urey produced amino acids and blank from early-atmosphere gases." |
| Correct answer | "Correct. The answer was 'sugars'. Powerful idea: Life can begin from non-life when energy meets the right chemicals." |
| Incorrect | "Incorrect. The answer was 'sugars'. Your answer was 'proteins'. Explanation: ..." |
| Achievement unlock | "Achievement unlocked: Miller-Urey. Lightning strikes the flask. Amino acids precipitate." |
| Power-up earned | "Power-up earned: Galápagos Compass. Skip a question without breaking your streak." |
| Streak | (announced only at 5, 10, 15, 20, 25 — not every step) "Streak: 10 correct in a row." |

The mnemonic speed-reveal is announced **as the complete text** when
the reveal completes, not char-by-char (which would be screen-reader
noise).

### 4.3 Aria-labels on interactive elements

Every button has a label that describes the action, not the visual:

```html
<button aria-label="Use Darwin's Notebook power-up (3 remaining)">
  📓 3
</button>
```

For game-type-specific elements:

```html
<!-- Punnett cell -->
<button
  aria-label="Cell 2 of 4. Genotype: Pp. Click to label phenotype."
  aria-describedby="punnett-help"
>
  Pp
</button>

<!-- Pedigree person -->
<button
  aria-label="Person III-4. Female. Unaffected. Daughter of II-1 and II-2."
  aria-pressed="false"
>
  ○
</button>
```

### 4.4 Charts and visualizations

Every visualization has a `<details>` fallback with the underlying
data as a table.

```tsx
<figure>
  <svg role="img" aria-labelledby="cal-title" aria-describedby="cal-desc">
    {/* calibration scatter */}
  </svg>
  <figcaption id="cal-title">Your confidence calibration</figcaption>
  <p id="cal-desc">A scatter plot showing predicted confidence versus actual accuracy.</p>
  <details>
    <summary>View as table</summary>
    <table>...</table>
  </details>
</figure>
```

### 4.5 Modal / dialog patterns

- `role="dialog"`, `aria-modal="true"`, `aria-labelledby="<title-id>"`
- Focus trapped within the dialog
- Esc closes
- Focus returns to the trigger element on close

---

## 5. Color contrast

### 5.1 Verified contrast ratios

| Pair | Ratio | WCAG level |
|---|---|---|
| `--text-primary` on `--bg-deep` | 11.7:1 | AAA |
| `--text-secondary` on `--bg-deep` | 8.0:1 | AAA |
| `--text-dim` on `--bg-deep` | 4.1:1 | AA (large text only) |
| Cyan `#22d3ee` on `--bg-deep` | 7.8:1 | AAA |
| Green `#34d399` on `--bg-deep` | 8.7:1 | AAA |
| Coral `#fb7185` on `--bg-deep` | 4.6:1 | AA |
| Amber `#fbbf24` on `--bg-deep` | 10.1:1 | AAA |

`--text-dim` is used **only** for non-essential meta information (HUD
time, "saved" labels). Never for content the student needs to read.

### 5.2 Color-blind safe palette

Optional in Settings. Switches:

- Coral wrong-indicator → coral PLUS a `✗` icon + dashed border
- Green correct-indicator → green PLUS a `✓` icon + solid border
- Amber streak → amber PLUS a flame icon
- Achievement Wing palettes use shape + icon differentiators (each Wing
  has a distinctive aggregate-shape SVG)

Color is **never** the sole indicator of meaning. Icons and text
labels always accompany.

### 5.3 The forbidden combinations

These are automatically rejected by the lint:

- Pure red on pure green
- Pure blue on pure red
- Coral on green (very low contrast, often misread as orange)

---

## 6. Motion reduction

`prefers-reduced-motion: reduce` OR Settings → Motion = `reduced` OR
`off`.

### 6.1 What degrades

| Animation | Reduced mode | Off mode |
|---|---|---|
| `popIn` | instant scale | instant |
| `slideUp` | instant translate | instant |
| `drain` | unchanged (essential UI) | replaced with static "Reveal in 6s" countdown text |
| `shimmer` | off | off |
| `pulseGlow` | static glow | no glow |
| `revealChar` | instant per-char | full mnemonic shown immediately at countdown end |
| `cascadeFade` | instant | instant |
| `ringExpand` | static circle | omitted |
| Confetti particles | replaced with `✨ × 5` text | omitted |
| Page transitions | crossfade only | instant |

### 6.2 The speed-reveal in reduced mode

The signature speed-reveal mnemonic is the trickiest motion to preserve
the *meaning* of. In `reduced` mode:

- Countdown still drains (essential to the timing)
- At countdown end, the full mnemonic appears in one frame (not
  char-by-char)
- The student gets the same information, same pacing, no char-by-char
  flutter

In `off` mode:

- Countdown is replaced with a "Reveal in N seconds" countdown text
- At N=0, the mnemonic appears

The pedagogy survives. Only the spectacle is dialed back.

---

## 7. Dyslexia mode

Settings → Appearance → Dyslexia Font.

When on:

- Body font swaps to OpenDyslexic (loaded as a self-hosted webfont)
- Letter-spacing increases by `0.04em`
- Line-height increases to `1.7` (from `1.5`)
- Headlines stay as Syne (it's already weighty and readable)
- Mnemonic mono stays as JetBrains Mono (mono fonts work for many
  dyslexic readers; toggleable in v1.1)

### 7.1 Reading aids

- Speed-reveal characters keep their amber glow longer in dyslexia mode
  (`text-shadow` extends 200ms after the reveal) — helps the eye land
- All text is `font-weight: 500` or higher (no thin weights, which are
  hard to scan)

---

## 8. Touch / pointer

### 8.1 Tap targets

≥ 44×44px (Apple HIG). Smaller visual elements have padding to expand
the hit zone:

```css
button.small-icon {
  min-width: 44px;
  min-height: 44px;
  padding: 0;
  background: transparent;
  /* visual icon is 18px centered */
}
```

### 8.2 Hover-less design

No content is hover-revealed. Tooltips show on **focus AND hover**:

```tsx
<Tooltip trigger={['focus', 'hover']} content="...">
  <Button />
</Tooltip>
```

On touch (no hover), tooltips surface via long-press (500ms) and tap-
to-dismiss.

### 8.3 Drag-and-drop on touch

`@dnd-kit/core` with touch sensors:

- Long-press (200ms) to initiate drag (prevents accidental drags on
  scroll)
- Haptic feedback on drag start (where supported)
- Drop targets enlarge on hover (touch) to make placement forgiving
- A "drag cancel" zone is always visible (drag-and-release outside any
  drop target returns the item to source)

### 8.4 Bottom sheets on mobile

Modals on mobile slide up from the bottom (Material You pattern) so the
content is near the thumb. Tablet and desktop use centered dialogs.

---

## 9. Audio accessibility

### 9.1 Captions / no-audio reliance

Audio is purely confirmatory. No information is conveyed by audio alone
— every audio sting has a visual equivalent. Audio can be turned off in
Settings with zero impact on functionality.

### 9.2 Volume control

Settings → Audio → Volume slider (0-100%, 5% steps). Default 60%.

### 9.3 Individual sting toggles

Some stings (the `reveal-tick` per-char tick) can be distracting for
ADHD or anxiety. Per-sting toggles in Settings let students mute
specific sounds.

---

## 10. Cognitive load considerations

### 10.1 Pace control

- Default countdown is 6s; reveal is 5s. Students can lengthen both
  in Settings → Reveals (up to 15s countdown / 12s reveal).
- The HUD time is informational, not punitive — no per-question timer
  pressure.

### 10.2 Vocabulary

- Every technical term has an etymology card on first appearance
- Every figure (chart, diagram) has a caption + a `<details>` data
  table
- Question prompts use everyday language where possible; technical
  vocabulary is reserved for the term-being-learned

### 10.3 Difficulty cap

Settings → Practice → Default difficulty caps unit difficulty in
random/quick-mix selections. Defaults to `core` for new students; the
student can opt into `deep` at any time.

---

## 11. Per-PR a11y checklist

Every PR that touches UI must include this checklist in its
description:

- [ ] All new interactive elements have visible focus rings
- [ ] All new buttons have `aria-label` when icon-only
- [ ] All new tap targets are ≥44×44px
- [ ] All new animations honor `prefers-reduced-motion`
- [ ] All new color uses semantic tokens, not hex literals
- [ ] All new charts have `<details>` data-table fallbacks
- [ ] All new images have meaningful `alt` text (or `alt=""` for decorative)
- [ ] All new game-type renderers have a documented keyboard map
- [ ] Lighthouse accessibility score ≥ 95
- [ ] axe-core 0 violations

CI runs axe-core against the deployed preview. Failures block merge.

---

## 12. Testing

### 12.1 Automated

- **axe-core** in CI via Playwright; ≥0 critical violations required
- **Lighthouse CI** on every preview; accessibility score ≥95
- **Snapshot tests** of every game type with focus-visible state

### 12.2 Manual

For each release candidate:

- [ ] Full keyboard-only walkthrough of one journey of each game type
- [ ] VoiceOver (macOS) screen reader walkthrough of one full journey
- [ ] TalkBack (Android) test on a recent phone
- [ ] NVDA (Windows) walkthrough
- [ ] Reduced-motion mode walkthrough
- [ ] Dyslexia font walkthrough
- [ ] High-contrast mode walkthrough
- [ ] Color-blind safe palette walkthrough
- [ ] Touch-only walkthrough (no keyboard)
- [ ] Zoomed-to-200% walkthrough

These manual passes are tracked in
`docs/release-checklist.md` (to be created at scaffold time).

---

## 13. What we're explicitly not doing in v1

- **Speech input** (answer questions verbally) — planned for v1.x
- **Eye tracking** — out of scope (hardware-dependent)
- **Switch access** — partial (keyboard nav covers most switch users;
  proper switch-control optimization is v1.x)
- **Sign language video for prompts** — out of scope; a great future
  collaboration

These are honest gaps, not denials of importance.
