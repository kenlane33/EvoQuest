# Aesthetic System

The whole experience lives in one mode: **vibrant dark**. A deep, slightly
warm-blue background; saturated accents that glow rather than sit; high
chroma where meaning lives; restraint where text needs to be read. The
palette is the work — it carries Wing identity, status, and the rhythm
of progress.

There is no light mode. There is no theme switcher. The aesthetic is
part of the design intent, not a preference.

> "Beauty arises in part from the sense of being purposeful." — Alan Kay
>
> The vibrancy here serves a purpose: a teenager scrolling at midnight
> sees a tool that takes the subject seriously. Dim, "professional"
> gray-on-gray would tell the wrong story.

---

## 1. Color tokens

All colors live in `src/styles/tokens.css` (or a Tailwind plugin) and are
referenced via CSS variables. Direct hex literals in component code are
forbidden.

### 1.1 Base palette (vibrant dark — the only mode)

The background is not flat — it has a subtle warm-cool gradient that
deepens toward the bottom of the viewport. Pure black is avoided; pure
white text is avoided. Both feel surgical; we want *alive*.

```css
:root {
  /* Backgrounds — a hint of blue-violet warmth, never grayscale */
  --bg-deep:    #0a0e1f;          /* page base */
  --bg-mid:     #11162a;          /* one level up */
  --bg-soft:    #1a2040;          /* cards over base */
  --bg-card:    rgba(255, 255, 255, 0.05);
  --bg-card-hi: rgba(255, 255, 255, 0.09);
  --bg-card-active: rgba(255, 255, 255, 0.13);

  /* The body-level gradient: warm violet → deep blue, vertical */
  --bg-page: radial-gradient(120% 80% at 50% 0%,
                #15193a 0%, #0a0e1f 55%, #06091a 100%);

  /* Text — never pure white; never sub-50% on body */
  --text-primary:   rgba(245, 240, 255, 0.94);   /* whisper of violet */
  --text-secondary: rgba(245, 240, 255, 0.72);
  --text-dim:       rgba(245, 240, 255, 0.44);
  --text-faint:     rgba(245, 240, 255, 0.22);

  /* Borders — luminous, never gray-on-gray */
  --border-faint:  rgba(180, 200, 255, 0.10);
  --border-light:  rgba(180, 200, 255, 0.18);
  --border-medium: rgba(180, 200, 255, 0.28);
  --border-strong: rgba(180, 200, 255, 0.40);
}
```

### 1.2 Accent palette (universal — saturated, glow-ready)

These are tuned for glow effects on the dark base. Each is verified at
≥7:1 against `--bg-deep` for AAA contrast when used as text.

```css
:root {
  --accent-cyan:      #22d3ee;
  --accent-aqua:      #5eead4;
  --accent-green:     #34d399;
  --accent-lime:      #a3e635;
  --accent-amber:     #fbbf24;
  --accent-orange:    #fb923c;
  --accent-coral:     #fb7185;
  --accent-rose:      #f472b6;
  --accent-magenta:   #e879f9;
  --accent-violet:    #a78bfa;
  --accent-indigo:    #818cf8;
  --accent-blue:      #60a5fa;
  --accent-emerald:   #10b981;

  /* Glow tints — used in box-shadows and filter: drop-shadow() */
  --glow-cyan:    rgba(34, 211, 238, 0.45);
  --glow-amber:   rgba(251, 191, 36, 0.45);
  --glow-violet:  rgba(167, 139, 250, 0.45);
  --glow-magenta: rgba(232, 121, 249, 0.45);
  --glow-green:   rgba(52, 211, 153, 0.45);
  --glow-coral:   rgba(251, 113, 133, 0.45);
}
```

### 1.3 Semantic tokens

UI code uses semantic tokens, not accents directly.

```css
:root {
  --status-correct: var(--accent-green);
  --status-wrong:   var(--accent-coral);
  --status-hint:    var(--accent-violet);
  --status-streak:  var(--accent-amber);

  --status-correct-glow: var(--glow-green);
  --status-wrong-glow:   var(--glow-coral);
  --status-hint-glow:    var(--glow-violet);
  --status-streak-glow:  var(--glow-amber);

  /* The signature gradients — used for success states, the home CTA,
     and the reveal animation. Three-stop minimum for richness. */
  --reveal-gradient: linear-gradient(135deg,
                       var(--accent-cyan) 0%,
                       var(--accent-green) 50%,
                       var(--accent-amber) 100%);
  --etymology-gradient: linear-gradient(135deg,
                       var(--accent-violet) 0%,
                       var(--accent-magenta) 100%);
  --celebrate-gradient: conic-gradient(from 0deg,
                       var(--accent-amber),
                       var(--accent-magenta),
                       var(--accent-cyan),
                       var(--accent-green),
                       var(--accent-amber));    /* aggregate-unlock burst */
}
```

### 1.4 High contrast mode

`[data-contrast="high"]` is the **one** alternative palette. It keeps
the vibrancy but pushes text toward maximum legibility:

```css
[data-contrast="high"] {
  --text-primary:   rgba(255, 255, 255, 1);
  --text-secondary: rgba(255, 255, 255, 0.88);
  --text-dim:       rgba(255, 255, 255, 0.65);
  --border-faint:  rgba(180, 200, 255, 0.30);
  --border-light:  rgba(180, 200, 255, 0.45);
  --border-medium: rgba(180, 200, 255, 0.60);
}
```

Accents stay the same — they're already saturated enough; only the
neutrals harden. High contrast is the accessibility lifeline, not a
visual alternative.

### 1.5 No light mode — by design

The app does not implement a light theme and does not respect
`prefers-color-scheme: light`. This is intentional:

- The signature speed-reveal mnemonic uses *glow* to land — char-level
  text-shadow in amber against deep blue. Glow doesn't translate to
  light mode without becoming washy haze.
- Achievement tiles, Wing palettes, the etymology card, and the audio
  stings are all tuned together. Splitting into two palettes doubles
  the design surface without doubling the value.
- Most students study on phones in the evening. The product is
  evening-shaped.

If a future student requests a high-luminance environment for
specific accessibility reasons, the path is `[data-contrast="high"]`
(stays dark, pushes legibility) plus motion-reduction options — not a
parallel light theme.

---

## 2. Per-Wing palettes

Each Wing has a signature primary + secondary + glow. Every Wing was
hand-tuned so its identity is recognizable at one-emoji glance, even
when 60+ tiles tile the home grid. Each pair must clear AAA against
`--bg-deep` as text.

Used for:

- Achievement tile glow when unlocked
- Achievement tile gradient at hover/focus
- Power-up icon glow when themed
- Palace-walk room tile tint
- Briefing screen gradient
- Journey card header strip
- Wing-aggregate tile's conic background

| Wing | `--wing-primary` | `--wing-secondary` | `--wing-glow` | Vibe |
|---|---|---|---|---|
| `evo` Evolution | `#fbbf24` | `#fb923c` | `rgba(251,191,36,0.55)` | warmth, sun, deep time |
| `origin` Origin of Life | `#a78bfa` | `#e879f9` | `rgba(167,139,250,0.55)` | violet → magenta lightning |
| `cell` Cell Biology | `#22d3ee` | `#5eead4` | `rgba(34,211,238,0.55)` | aqua, water, life |
| `gen` Genetics | `#e879f9` | `#f472b6` | `rgba(232,121,249,0.55)` | Mendel's pinks, magenta |
| `eco` Ecology (future) | `#10b981` | `#a3e635` | `rgba(16,185,129,0.55)` | emerald → lime, forest |
| `anat` Anatomy (future) | `#fb7185` | `#fbbf24` | `rgba(251,113,133,0.55)` | rose → amber, flesh + bone |
| `biochem` Biochemistry (future) | `#60a5fa` | `#a78bfa` | `rgba(96,165,250,0.55)` | molecular blue → violet |
| `neuro` Neuroscience (future) | `#e879f9` | `#22d3ee` | `rgba(232,121,249,0.55)` | magenta → cyan synapse |

Implementation: each Wing root container sets:

```css
[data-wing="evo"] {
  --wing-primary:   #fbbf24;
  --wing-secondary: #fb923c;
  --wing-glow:      rgba(251, 191, 36, 0.55);
  --wing-gradient:  linear-gradient(135deg,
                       var(--wing-primary) 0%,
                       var(--wing-secondary) 100%);
}
[data-wing="origin"] {
  --wing-primary:   #a78bfa;
  --wing-secondary: #e879f9;
  --wing-glow:      rgba(167, 139, 250, 0.55);
  --wing-gradient:  linear-gradient(135deg,
                       var(--wing-primary) 0%,
                       var(--wing-secondary) 100%);
}
/* ... one block per Wing ... */
```

Component CSS uses `var(--wing-primary)` / `var(--wing-gradient)` /
`var(--wing-glow)` — Wing palette auto-applies based on context. Tile
glow on unlock uses `filter: drop-shadow(0 0 24px var(--wing-glow))`.

### 2.1 Wing palette principles

- **Adjacent in spirit, distinct at a glance.** Cell Biology and
  Ecology share the green family but cell goes cyan-aqua and ecology
  goes emerald-lime. The home grid must never look like a smear of
  colors that bleed into each other.
- **A two-stop hue rotation per Wing.** Each Wing's `--wing-gradient`
  rotates ~30-60° in HSL — enough movement for a vivid feel, not so
  much that the tile loses identity.
- **The glow is doing visual work.** It's not decoration. The glow is
  how you know a tile is *yours*. Don't tone it down for "elegance" —
  elegance lives in the typography and spacing, not in dim accents.

---

## 3. Typography

### 3.1 Fonts

| Family | Use | Weights |
|---|---|---|
| **Syne** | Headlines, briefings, big section titles | 700, 800, 900 |
| **Nunito** | Body, buttons, most UI | 400, 600, 700, 800 |
| **JetBrains Mono** | Mnemonic reveal, code, etymology root summary | 400, 700 |
| **OpenDyslexic** | Dyslexia mode override for body | regular |

Loading:

- Google Fonts via `<link>` for v1 simplicity
- Self-host fonts in v1.1 (better cache, no third-party)
- `font-display: swap` so first paint never blocks

### 3.2 Type scale

| Token | Size / line height | Use |
|---|---|---|
| `text-display-xl` | 56px / 1.05 | End-of-journey summary number, aggregate-unlock celebration |
| `text-display-lg` | 40px / 1.1 | Section heroes (Journeys page, About page) |
| `text-display-md` | 28px / 1.15 | Briefing titles (unit shortLabel) |
| `text-headline-lg` | 22px / 1.25 | Card headers |
| `text-headline-md` | 18px / 1.3 | Subsection titles |
| `text-body-lg` | 16px / 1.5 | Question prompts |
| `text-body` | 14-15px / 1.55 | Default body |
| `text-meta` | 12px / 1.4 | HUD, tags, captions |
| `text-micro` | 11px / 1.3 | Smallest legible (status badges) |

The home page deliberately has no `text-display-xl` headline — the
achievement grid is the visual anchor (see [`app.md`](./app.md) §8.1).

Font-size setting (sm/md/lg in Settings) multiplies the scale by
0.875 / 1.0 / 1.15.

### 3.3 Letter-spacing

- Headlines (Syne): `-0.02em` to `-0.03em` for tight, hero feel
- Body (Nunito): `0` (default)
- Caps tags / labels: `0.06em` to `0.15em` (the example uses `0.1em`
  on the HUD meta)
- Mnemonic mono: `0.02em` (slight breathing room)

### 3.4 Hierarchy rules

- Headlines use the **Syne weight ramp** to imply hierarchy (900 = top,
  800 = mid, 700 = light heroic)
- Body never goes above 700
- Mono is used **only** for the mnemonic reveal and etymology root
  summary — preserves its salience

---

## 4. Iconography

### 4.1 Sources

- **Emoji** for topic icons on achievements and unit tiles (universal,
  no asset weight, instantly recognizable)
- **Lucide React** for UI chrome (arrows, settings cog, hearts, X
  marks) — tree-shaken, ~1KB per icon used
- **Custom inline SVG** for biological structures that emoji can't
  capture cleanly (organelle layouts in `parts-labeler`, cladogram
  branch shapes, Punnett grid lines)

### 4.2 Emoji rules

- Topic-shaped, not generic (see [`achievements.md`](./achievements.md) §1.1)
- Single emoji per achievement; never combinations
- Test on iOS, Android, macOS, Windows — emojis render
  platform-dependently. Avoid emoji whose appearance varies
  drastically (e.g., people-with-skin-tones renders inconsistently)
- Avoid emojis newer than Unicode 13 for compatibility

### 4.3 Lucide rules

Common icons used app-wide:

| Use | Lucide name | Size |
|---|---|---|
| Settings | `Settings` | 18px in HUD, 24px in pages |
| Close / dismiss | `X` | 18px |
| Back | `ChevronLeft` | 18px |
| Forward | `ChevronRight` | 18px |
| Heart (HUD lives) | `Heart` | 14px |
| Streak | `Flame` (rare; usually 🔥 emoji) | 14px |
| Lock (locked achievement) | `Lock` | 18px |
| Sparkle (unlock animations) | `Sparkles` | 18px |

### 4.4 Custom SVG conventions

- Use `currentColor` for stroke + fill where possible — themes
  automatically
- Inline `<svg>` in TSX (no HTTP requests)
- 24×24 viewbox standard
- 1.5px stroke weight
- No drop shadows in SVG; use CSS `filter: drop-shadow()` so it can be
  themed

---

## 5. Layout primitives

### 5.1 Container widths

| Token | Width | Use |
|---|---|---|
| `--w-narrow` | 420px | Mobile-style flows (welcome screens, end-of-journey card) |
| `--w-content` | 520px | Default question viewport |
| `--w-medium` | 720px | Dashboards (settings, content management) |
| `--w-wide` | 960px | Journey timeline list |
| `--w-max` | 1200px | Garden / wide stats views |

### 5.2 Spacing scale

Standard 4px grid. Tokens are multiples:

```
--space-1: 4px
--space-2: 8px
--space-3: 12px
--space-4: 16px
--space-5: 20px
--space-6: 24px
--space-8: 32px
--space-10: 40px
--space-12: 48px
--space-16: 64px
```

Per-component conventions:

- Card interior: `var(--space-5)` to `var(--space-6)` (20-24px)
- Section gaps: `var(--space-10)` to `var(--space-12)` (40-48px)
- Stack between siblings (lists): `var(--space-2)` (8px)
- Button padding: `var(--space-3) var(--space-4)` (12px / 16px)

### 5.3 Border radius

| Token | Radius | Use |
|---|---|---|
| `--r-sm` | 6px | Tag pills, small inline elements |
| `--r-md` | 10px | Buttons (default) |
| `--r-lg` | 12px | Cards inside cards |
| `--r-xl` | 16px | Standard cards |
| `--r-2xl` | 20px | Hero cards |
| `--r-3xl` | 32px | Modal containers |
| `--r-full` | 9999px | Pills, avatars, circular badges |

No sharp corners anywhere (no 0px radius). The Papert-flavored playful
feel requires soft geometry.

### 5.4 Shadows & glows

The vibrant dark palette doesn't use elevation drop-shadows much —
they look muddy against deep blue. Instead, surfaces lift through
**color glow**: a slightly brighter border + a soft outer halo in the
relevant accent or Wing color.

```css
:root {
  /* The signature lifts — used on hover, focus, and unlocked tiles */
  --lift-card:    0 0 0 1px var(--border-light),
                  0 8px 24px rgba(10, 14, 31, 0.55);

  --lift-card-hi: 0 0 0 1px var(--border-medium),
                  0 12px 36px rgba(10, 14, 31, 0.65);

  /* Glow lifts — used when the element earns vibrancy */
  --glow-cyan-sm:  0 0 12px var(--glow-cyan);
  --glow-cyan-md:  0 0 24px var(--glow-cyan);
  --glow-cyan-lg:  0 0 48px var(--glow-cyan);

  --glow-amber-md: 0 0 24px var(--glow-amber);
  --glow-amber-lg: 0 0 48px var(--glow-amber);

  --glow-violet-md: 0 0 24px var(--glow-violet);
  --glow-magenta-md: 0 0 24px var(--glow-magenta);

  --glow-wing-md:  0 0 24px var(--wing-glow);
  --glow-wing-lg:  0 0 48px var(--wing-glow);

  /* The reveal-time accent — used by speed-reveal char glow */
  --glow-reveal-char: 0 0 14px var(--accent-amber);
}
```

Usage conventions:

| Surface | At rest | On hover/focus | On unlock/celebration |
|---|---|---|---|
| Card (default) | `--lift-card` | `--lift-card-hi` | — |
| Achievement tile (unlocked) | `--glow-wing-md` | `--glow-wing-lg` | `--glow-wing-lg` + animation |
| Streak counter (active) | none | `--glow-amber-md` | `--glow-amber-lg` |
| Etymology card | `--lift-card` | `--lift-card-hi` + `--glow-violet-md` | — |
| CTA button (primary) | `--glow-cyan-sm` | `--glow-cyan-md` | — |
| Speed-reveal char (during reveal) | — | — | `text-shadow: var(--glow-reveal-char)` |

Drop-shadows are reserved for **lift over background** (the soft
`--lift-card`); halos are reserved for **identity / state** (Wing
glows, status glows). Don't mix the two in one element.

---

## 6. Motion primitives

Full list with timings.

### 6.1 Library

```css
@keyframes popIn {
  from { opacity: 0; transform: scale(0.85); }
  to   { opacity: 1; transform: scale(1); }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes drain {
  from { width: 100%; }
  to   { width: 0%; }
}

@keyframes shimmer {
  from { transform: translateX(-100%); }
  to   { transform: translateX(100%); }
}

@keyframes pulseGlow {
  0%, 100% { filter: drop-shadow(0 0 20px var(--wing-glow)); }
  50%      { filter: drop-shadow(0 0 40px var(--wing-glow)); }
}

@keyframes revealChar {
  from { opacity: 0; text-shadow: 0 0 12px var(--accent-amber); }
  to   { opacity: 1; text-shadow: 0 0 0   transparent; }
}

@keyframes cascadeFade {
  /* applied per-item with staggered delay 50ms */
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes ringExpand {
  from { transform: scale(1);    opacity: 0.7; }
  to   { transform: scale(1.4);  opacity: 0;   }
}
```

### 6.2 Timing conventions

| Animation | Duration | Easing |
|---|---|---|
| `popIn` | 350ms | `cubic-bezier(0.16, 1, 0.3, 1)` (back-out) |
| `slideUp` | 250ms | `ease-out` |
| `drain` | 6000ms | `linear` |
| `shimmer` | 2000ms (infinite) | `linear` |
| `pulseGlow` | 2000ms (infinite) | `ease-in-out` |
| `revealChar` | 350ms | `ease-out` (each char) |
| `cascadeFade` | 220ms | `ease-out` |
| `ringExpand` | 800ms | `ease-out` |

### 6.3 Reduced motion

`prefers-reduced-motion: reduce` (or Settings → Motion = reduced/off):

- `popIn` → instant opacity 0→1, no scale
- `slideUp` → instant opacity 0→1, no translation
- `drain` → unchanged (essential UI element)
- `shimmer` → off
- `pulseGlow` → static drop-shadow
- `revealChar` → instant
- `cascadeFade` → instant
- `ringExpand` → off (replace with brief opacity flash)

### 6.4 Performance constraints

- Only `transform` and `opacity` animate (GPU-compositable)
- No animations of `width`, `height`, `top`, `left`
- Compositing layer hint: `will-change: transform, opacity` on
  long-lived animating elements; remove `will-change` on completion
- Particle effects (confetti burst on aggregate unlock) capped at 24
  particles, all using `transform: translate3d()` keyframes

---

## 7. Components

A small library of reusable parts. Each maps to a single component file
in `src/components/common/`.

### 7.1 Button

Variants: `primary`, `secondary`, `ghost`, `destructive`.

```tsx
<Button variant="primary">EMBARK</Button>
```

Primary: `--reveal-gradient` background, dark text. Used for the main
CTA on every page (≤1 per viewport).

Secondary: `rgba(255,255,255,0.06)` background, primary text. The
default action button.

Ghost: transparent, secondary text. Used in toolbars where chrome
should be minimal.

Destructive: coral background, white text. Used for delete / reset
confirmations.

### 7.2 Card

Background `var(--bg-card)`, border `1px solid var(--border-light)`,
radius `var(--r-xl)`, padding `var(--space-5)`. Hover lifts the
border slightly.

Variants:
- `card-hint` — adds a violet left border (4px)
- `card-correct` — adds a green left border
- `card-wrong` — adds a coral left border

### 7.3 Tag / Pill

Inline label. `radius: var(--r-full)`, `padding: 2px 10px`,
`text-meta`. Color variants for Wing themes, status, difficulty.

### 7.4 Tile (achievement)

Square 60×60px (home) or 120×120px (journeys detail). Emoji +
shortLabel. See [`achievements.md`](./achievements.md) for full
interaction patterns.

### 7.5 HUD bar

Sticky top during play. The exact layout from the example's `Hud`,
ported to React + Tailwind. See app.md §9.

### 7.6 Etymology card

Violet gradient border, JetBrains Mono root summary, optional mnemonic
reveal area. Always present during quizzes where a key term has an
etymology.

### 7.7 Briefing card

Centered hero with the unit's emoji + shortLabel (the *topic*, never
the game-type's internal name — see app.md §4.4 copy invariant). The
backdrop is the Wing's `--wing-gradient` at 30% opacity over the page
gradient, with a soft `--glow-wing-lg` halo behind the emoji. 1.4s
visible, then transitions to the play screen.

### 7.8 Feedback panel

Slides up after answer. Status color border, explanation text,
etymology card if relevant, "NEXT" button. See app.md §4.4.

---

## 8. Imagery

### 8.1 Photography / illustration

V1 ships **zero photographs**. All visuals are emoji + custom SVG +
gradients. This keeps the bundle tiny and ensures consistent
rendering across platforms.

V1.x may add carefully curated public-domain illustrations
(Haeckel-style line drawings, vintage microscopy plates) for specific
units where the visual is the lesson (e.g., a real Cambrian fossil
plate for the Cambrian unit).

### 8.2 Generated visuals at runtime

Some visuals are programmatically rendered:

- Punnett grid (SVG)
- Pedigree tree (SVG)
- Concept map (SVG, force-directed)
- Cladogram (SVG, computed)
- Food web (SVG, force-directed)
- Etymology garden graph (SVG)
- Microworld plots (Canvas2D for performance)
- Calibration scatter (SVG with d3-scale)

All saved into the Lab Notebook as inlined SVG strings — no images on
disk, full reproducibility.

---

## 9. Asset conventions

### 9.1 Naming

- SVG components: `PascalCase.tsx` (e.g., `MitochondrionDiagram.tsx`)
- CSS variables: `--kebab-case`
- Animation keyframes: `camelCase`

### 9.2 Tailwind config

Tokens are exposed to Tailwind via a custom theme so utilities like
`bg-bg-deep` and `text-wing-primary` work:

```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      'bg-deep':   'var(--bg-deep)',
      'bg-mid':    'var(--bg-mid)',
      'bg-soft':   'var(--bg-soft)',
      // ...
      'wing-primary':   'var(--wing-primary)',
      'wing-secondary': 'var(--wing-secondary)',
      // ...
    },
    fontFamily: {
      headline: ['Syne', 'sans-serif'],
      body:     ['Nunito', 'system-ui', 'sans-serif'],
      mono:     ['JetBrains Mono', 'monospace'],
    },
    keyframes: { /* the library above */ },
    animation: {
      'pop-in':  'popIn 350ms cubic-bezier(0.16, 1, 0.3, 1) both',
      'slide-up': 'slideUp 250ms ease-out both',
      // ...
    },
  },
}
```

---

## 10. Anti-patterns

- **A light-mode escape hatch** — forbidden. There is no light theme.
  See §1.5. Don't add `@media (prefers-color-scheme: light)` overrides
  "just in case".
- **Inline hex colors** — forbidden. Always use tokens.
- **Off-grid spacing** — never use `padding: 13px`. Round to the 4px
  grid.
- **Muted accents to look "serious"** — forbidden. The accents are
  saturated by design. Dropping them to ~60% saturation kills the
  vibrancy.
- **Dropping glows for "professionalism"** — the glow IS the
  professionalism. Resist the urge to tone tiles down.
- **Drop shadows for elevation on cards** — use the `--lift-card`
  border + soft drop combo (§5.4), not heavy elevation shadows that
  look smudged against deep blue.
- **More than 3 active gradients in one viewport** — visual noise.
  Use one signature gradient (the home CTA / reveal) plus per-Wing
  identity gradients on tiles.
- **Animation on every state change** — animation is for *meaningful
  transitions* (unlock, reveal, navigation), not for every hover.
- **Font weight 100-300** — too thin to read against the deep blue.
  Minimum 400; body uses 500+ for legibility on glow-adjacent text.
- **Pure black text** — never `#000`. text-primary lives at
  `rgba(245, 240, 255, 0.94)` with a whisper of violet for the alive
  feel.
- **Pure black backgrounds** — never `#000`. The lightest "black" we
  ship is `#06091a` (the bottom of the page gradient). True black
  flattens the depth.
- **Achievement tiles that look like checkbox ticks** — locked tiles
  are ghost emoji + dim outline; unlocked tiles glow in their Wing
  palette. If your tile design feels like a tick-list item, you've
  drained the vibrancy.

---

## 11. Cross-references

- Per-Wing colors used by achievements: [`achievements.md`](./achievements.md) §1.5
- Power-up icon glow uses Wing palette: [`power-ups.md`](./power-ups.md) §5
- Audio palette (related to visual stings): app.md §17
- Accessibility considerations on motion: [`accessibility.md`](./accessibility.md) §3
