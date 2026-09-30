# Safe-Net design system — Signal & Proof

Version: concept v1.0  
Status: visual source of truth; implementation is a separate task  
Scope: web learning platform, phishing simulator, Guard scanner, extension, auth, dashboard, and admin surfaces

## 1. Direction

Safe-Net teaches a person to notice a signal, understand the evidence, and make a safe decision. The interface therefore should not look like a hacker terminal, an antivirus alarm, or a game with constant rewards. Its character is **calm, exact, explanatory, and alert only when the situation requires it**.

The visual concept is **Signal & Proof**:

- **Signal** is a compact status: safe, attention, dangerous, or informational.
- **Proof** is always adjacent: the exact URL fragment, behavior, or rule that caused the status.
- Blue belongs to actions and navigation, not to every surface.
- Red is reserved for danger and destructive actions; it is never a brand decoration.
- Color is never the only carrier of meaning: every status also has an icon, label, and explanation.

Surface modes:

| Surface | Mode | Priority |
| --- | --- | --- |
| Landing | Persuade | Explain the product and start one clear action |
| Lessons | Read | Comprehension and steady progress |
| Simulator | Operate | Focus on evidence and make a decision |
| Guard scanner / extension | Operate | Fast verdict, reason, and safe next step |
| Dashboard / admin | Operate | Scanability and consistent data density |

Anti-references: neon cyberpunk, black-and-acid-green terminals, shield imagery everywhere, fear-heavy red interfaces, purple/cyan AI gradients, glassmorphism, card-inside-card dashboards, and gamification that makes real threats feel unserious.

## 2. Signature component — Evidence rail

The memorable element is the **Evidence rail**. It turns the shared detection engine into a visible design language.

```text
URL anatomy
https://  paypa1  .secure-login  .example
          └────┘  └──────────┘
          lookalike  misleading subdomain

Evidence rail
[01 Structure] ─ [02 Identity] ─ [03 Context] ─ [04 Decision]
      clear           risk             clear          ATTENTION
```

Rules:

- The rail is horizontal on desktop and vertical on narrow screens.
- Each step contains a number, a plain-language label, and a short explanation.
- Status uses icon + label + lightness + color, never color alone.
- Only the final decision receives the strongest surface color.
- The same rail pattern appears in lessons, simulations, Guard results, and the extension. It visually proves that the product uses one reasoning model everywhere.

## 3. Primitive color palette

The system uses four hue families: cobalt for brand/action/info, teal for verified/success, amber for attention, and red for danger. Cool graphite neutrals keep the product serious without turning it into a black terminal.

### Graphite neutral

| Token | Hex | Typical use |
| --- | --- | --- |
| `graphite-50` | `#F7F9FC` | Light page background |
| `graphite-100` | `#EEF2F7` | Subtle surface |
| `graphite-200` | `#DDE4ED` | Dividers and borders |
| `graphite-300` | `#C2CCD9` | Strong border / disabled icon |
| `graphite-400` | `#8C9AAA` | Dark-theme secondary text |
| `graphite-500` | `#667487` | Light-theme secondary text |
| `graphite-600` | `#4B586A` | Supporting text / strong icon |
| `graphite-700` | `#364152` | Subheading / elevated dark surface |
| `graphite-800` | `#232D3A` | Dark elevated surface |
| `graphite-900` | `#17212C` | Primary text / dark surface |
| `graphite-950` | `#0C131C` | Dark page background |

### Cobalt primary / info

| Token | Hex |
| --- | --- |
| `cobalt-50` | `#EEF3FF` |
| `cobalt-100` | `#DDE7FF` |
| `cobalt-200` | `#BECFFF` |
| `cobalt-300` | `#91AEFF` |
| `cobalt-400` | `#5D83F3` |
| `cobalt-500` | `#3B66EA` |
| `cobalt-600` | `#244DCC` |
| `cobalt-700` | `#1D3DA5` |
| `cobalt-800` | `#1C347F` |
| `cobalt-900` | `#1C2E63` |
| `cobalt-950` | `#121B3B` |

### Teal verified / success

| Token | Hex |
| --- | --- |
| `teal-50` | `#ECFDF8` |
| `teal-100` | `#D1FAF0` |
| `teal-200` | `#A7F3E1` |
| `teal-300` | `#6EE7CB` |
| `teal-400` | `#35C8AA` |
| `teal-500` | `#18A58C` |
| `teal-600` | `#0F7F6D` |
| `teal-700` | `#106458` |
| `teal-800` | `#115047` |
| `teal-900` | `#123F39` |
| `teal-950` | `#062722` |

### Amber attention / warning

| Token | Hex |
| --- | --- |
| `amber-50` | `#FFF8E6` |
| `amber-100` | `#FEEDC2` |
| `amber-200` | `#FCD889` |
| `amber-300` | `#FAC04D` |
| `amber-400` | `#F2A51D` |
| `amber-500` | `#D98708` |
| `amber-600` | `#B96605` |
| `amber-700` | `#94490A` |
| `amber-800` | `#793B0E` |
| `amber-900` | `#643211` |
| `amber-950` | `#391A05` |

### Red danger / destructive

| Token | Hex |
| --- | --- |
| `red-50` | `#FFF1F2` |
| `red-100` | `#FFE0E3` |
| `red-200` | `#FFC6CC` |
| `red-300` | `#FF9BA6` |
| `red-400` | `#F66474` |
| `red-500` | `#E13E52` |
| `red-600` | `#C6283E` |
| `red-700` | `#A51F35` |
| `red-800` | `#8A1E31` |
| `red-900` | `#761F30` |
| `red-950` | `#420A16` |

## 4. Semantic color tokens

Components consume semantic tokens only. Primitive colors must not be used directly in component code.

### Light theme

| Semantic token | Value | Role |
| --- | --- | --- |
| `--sn-bg` | `graphite-50` | Page background |
| `--sn-surface` | `#FFFFFF` | Primary content surface |
| `--sn-surface-subtle` | `graphite-100` | Grouped / supporting region |
| `--sn-surface-raised` | `#FFFFFF` | Popover and dialog |
| `--sn-text` | `graphite-900` | Primary text |
| `--sn-text-secondary` | `graphite-500` | Secondary text; 4.76:1 on white |
| `--sn-text-strong-secondary` | `graphite-600` | Dense UI / critical supporting text |
| `--sn-border` | `graphite-200` | Passive divider |
| `--sn-border-strong` | `graphite-400` | Input / interactive boundary |
| `--sn-primary` | `cobalt-600` | Main action, link, active nav |
| `--sn-primary-hover` | `cobalt-700` | Hover |
| `--sn-primary-pressed` | `cobalt-800` | Pressed |
| `--sn-primary-soft` | `cobalt-50` | Selected / informational surface |
| `--sn-focus` | `cobalt-400` | 2 px outer focus ring with offset |
| `--sn-success` | `teal-600` | Success icon / filled action |
| `--sn-success-text` | `teal-700` | Text on `teal-50` |
| `--sn-success-soft` | `teal-50` | Success surface |
| `--sn-warning` | `amber-700` | Warning icon / text |
| `--sn-warning-soft` | `amber-50` | Warning surface |
| `--sn-danger` | `red-600` | Danger / destructive action |
| `--sn-danger-hover` | `red-700` | Destructive hover |
| `--sn-danger-soft` | `red-50` | Danger surface |
| `--sn-overlay` | `rgb(12 19 28 / 0.64)` | Modal overlay |

### Dark theme

| Semantic token | Value | Role |
| --- | --- | --- |
| `--sn-bg` | `graphite-950` | Page background |
| `--sn-surface` | `graphite-900` | Primary surface |
| `--sn-surface-subtle` | `graphite-800` | Grouped region |
| `--sn-surface-raised` | `graphite-700` | Popover / dialog; elevation by lightness |
| `--sn-text` | `graphite-50` | Primary text |
| `--sn-text-secondary` | `graphite-400` | Secondary text; 5.67:1 on `graphite-900` |
| `--sn-border` | `graphite-700` | Passive divider |
| `--sn-border-strong` | `graphite-500` | Interactive boundary |
| `--sn-primary` | `cobalt-300` | Link / active state |
| `--sn-primary-filled` | `cobalt-400` | Filled primary control |
| `--sn-primary-foreground` | `graphite-950` | Text on filled primary |
| `--sn-primary-soft` | `cobalt-950` | Selected / info surface |
| `--sn-focus` | `cobalt-300` | Focus ring |
| `--sn-success` | `teal-300` | Success icon / text |
| `--sn-success-soft` | `teal-950` | Success surface |
| `--sn-warning` | `amber-300` | Warning icon / text |
| `--sn-warning-soft` | `amber-950` | Warning surface |
| `--sn-danger` | `red-300` | Danger icon / text |
| `--sn-danger-soft` | `red-950` | Danger surface |
| `--sn-overlay` | `rgb(0 0 0 / 0.72)` | Modal overlay |

Palette proportion per screen: about 60% neutral background, 30% neutral/supporting surfaces, and no more than 10% cobalt or semantic color. Status surfaces are localized; the full page never turns red or green.

## 5. Typography

Primary family: **IBM Plex Sans** — 400, 500, 600, and 700. It supports Russian and English, has clear ambiguous characters, and feels technical without becoming a terminal aesthetic.  
Utility family: **IBM Plex Mono** — URLs, domains, rule IDs, scores, and aligned data only.

| Role | Size / line height | Weight | Use |
| --- | --- | --- | --- |
| `caption` | `0.75rem / 1rem` | 500 | Metadata, compact status |
| `label` | `0.875rem / 1.25rem` | 500 | Buttons, fields, tabs |
| `body` | `1rem / 1.5rem` | 400 | Reading and normal UI |
| `title` | `1.25rem / 1.75rem` | 600 | Card / lesson title |
| `section` | `1.5rem / 2rem` | 600 | Section heading |
| `page` | `2rem / 2.5rem` | 700 | Page heading |
| `display` | `2.5rem / 2.75rem` | 700 | Landing hero only |

Rules: body measure is 45–75 characters (`max-width: 65ch`); headings use `letter-spacing: -0.015em` from 32 px; body tracking is zero; data uses tabular figures; long text is left-aligned.

## 6. Layout, spacing, shape, and elevation

Spacing scale: `2, 4, 8, 12, 16, 24, 32, 48, 64, 96`. Use 4–12 inside a control, 12–24 between related items, 24–48 between groups, and 48–96 between page sections.

Grid:

- Desktop: 12 columns, 24 px gutters, max application width 1280 px.
- Tablet: 8 columns, 20 px gutters.
- Mobile: 4 columns, 16 px gutters; down to 320 px without horizontal page scroll.
- Reading column: max 65ch. Form column: 480–640 px. Sidebar: 256 px.

Radius tokens:

| Token | Value | Use |
| --- | --- | --- |
| `radius-control` | `6px` | Inputs, buttons, compact controls |
| `radius-card` | `10px` | Course, result, and data cards |
| `radius-panel` | `16px` | Dialogs and major composed surfaces |
| `radius-pill` | `999px` | Status chip only |

Elevation:

- `level-0`: no shadow; page and ordinary cards use space, tint, or a border.
- `level-1`: `0 4px 16px rgb(12 19 28 / 0.08)` for sticky navigation and dropdowns.
- `level-2`: `0 16px 40px rgb(12 19 28 / 0.16)` for dialogs only.
- Dark mode uses lighter surface tokens instead of shadows.

## 7. Component recipes

### Application shell and navigation

- Page background is `--sn-bg`; navigation uses `--sn-surface` and one bottom divider.
- Active navigation uses primary text plus a 2 px bottom indicator; weight + position provide a second cue.
- Sidebar selection uses `--sn-primary-soft`, primary text, and a leading icon. No colored side border.
- One primary action per navigation region.

### Buttons

- Height: 44 px comfortable, 36 px compact desktop toolbar only.
- Primary: cobalt fill, white text in light mode; cobalt-400 with graphite-950 text in dark mode.
- Secondary: subtle surface and strong text; no shadow.
- Tertiary: text/link treatment; underline on hover for inline links.
- Destructive: red fill only for the confirmed destructive action; otherwise red text button.
- States: default, hover, pressed, focus-visible, loading, disabled, and error where relevant.

### Fields and search / URL input

- Persistent label above the control; placeholder is an example, never the label.
- 44 px minimum height, `radius-control`, 1 px `--sn-border-strong` boundary.
- Focus: 2 px `--sn-focus` ring with 2 px offset.
- Validation: icon + message + semantic color adjacent to the field; preserve user input.
- URL values use IBM Plex Mono; the label and help text remain IBM Plex Sans.

### Course and lesson blocks

- Course item is a row or single surface, not a stack of nested cards.
- Hierarchy: stage number → title → one-line outcome → progress → next action.
- Progress uses a neutral track and cobalt fill; completion adds a check icon and `Completed` label, not green alone.
- Locked content uses neutral treatment and explains the unlock condition.

### Simulator

- The simulated message/site is the focal surface; guidance stays visually quieter.
- Selected suspicious fragments use underline + patterned/tinted background + marker icon.
- After submission, the Evidence rail explains found, missed, and incorrectly selected clues.
- Correct and incorrect regions differ in label, icon, and pattern as well as color.

### Guard result

- Order: verdict → safe next action → score/details → Evidence rail.
- Verdict labels: `No known signals`, `Check before continuing`, `High-risk signals found`, and `Could not complete the check`.
- A numeric score never appears without its uncertainty and signal explanation.
- Network and ML layers are shown as optional evidence sources, not as guaranteed truth.

### Status and feedback

| Status | Icon | Surface | Text |
| --- | --- | --- | --- |
| Info | `circle-info` | cobalt-50 / cobalt-950 | cobalt-800 / cobalt-200 |
| Success | `circle-check` | teal-50 / teal-950 | teal-700 / teal-300 |
| Warning | `triangle-alert` | amber-50 / amber-950 | amber-900 / amber-300 |
| Danger | `octagon-alert` | red-50 / red-950 | red-700 / red-300 |

Alerts use one tinted surface without an additional shadow. Toasts report the completed action in the same language as the initiating button. Modals use `radius-panel`, level-2 elevation in light mode, and a clear close action; Escape closes and focus returns to the trigger.

### Data tables and admin

- Productive density: 14 px body, 20 px line height, 44 px row target.
- Text columns left-aligned; numbers right-aligned with tabular figures.
- Status cells include icon + visible label.
- Horizontal scrolling is contained to the table only on narrow screens; the page never overflows.

## 8. Icons and imagery

Use one outline family, **Lucide**, with a consistent 2 px stroke. Sizes: 16, 20, 24, and 32 px. Icon-only controls retain a 44×44 px hit area and accessible name.

Avoid generic shield stock art. Product imagery should show:

- highlighted URL anatomy;
- message fragments and sender/context clues;
- a visible reasoning path from signal to decision;
- ordinary people and everyday devices, not hooded hackers.

## 9. Motion

Motion explains state and position; it does not decorate.

| Token | Duration | Use |
| --- | --- | --- |
| `motion-fast` | `120ms` | Press, checkbox, color feedback |
| `motion-base` | `180ms` | Hover, tooltip, small disclosure |
| `motion-slow` | `240ms` | Dialog and panel transition |

Entering uses ease-out; movement uses ease-in-out; color uses ease. Animate only transform and opacity. The Evidence rail may reveal one step at a time only during a rare analysis flow; repeated scans show the result immediately. `prefers-reduced-motion` removes movement and keeps an immediate static state.

## 10. Copy rules

- Use plain verbs and sentence case: `Check link`, `Continue lesson`, `Show evidence`.
- Never say `You are safe`; say `No known risk signals were found`.
- Errors identify the failed stage: `The local check finished, but threat intelligence did not respond. Try again.`
- A warning always includes a next step.
- Russian and English labels must preserve the same action and hierarchy, not literal word length.

## 11. Accessibility gates

Measured core pairs:

| Pair | Ratio | Result |
| --- | ---: | --- |
| `cobalt-600` on white | 6.98:1 | AA body |
| `graphite-500` on white | 4.76:1 | AA body |
| `graphite-900` on `graphite-50` | 15.43:1 | AAA |
| `teal-600` on white | 4.91:1 | AA body |
| `amber-700` on white | 6.53:1 | AA body |
| `red-600` on white | 5.56:1 | AA body |
| `cobalt-300` on `graphite-950` | 8.62:1 | AAA |
| `graphite-400` on `graphite-900` | 5.67:1 | AA body |

Shipping gates:

- Body text ≥4.5:1; large text and UI graphics ≥3:1.
- Visible 2 px focus ring with ≥3:1 contrast.
- 44×44 px recommended targets and ≥8 px between adjacent targets.
- Keyboard access to every control; Escape closes overlays.
- 200% zoom and 320 px reflow without page overflow.
- Grayscale still distinguishes hierarchy and state.
- Status is always icon + label + color.
- Reduced-motion mode preserves all information.

## 12. Implementation boundary

This document intentionally defines the design system without changing the existing interface. Implementation should happen as a separate, reviewable migration:

1. add primitive and semantic tokens;
2. migrate foundational components (type, button, field, status, surface);
3. implement the Evidence rail;
4. migrate Guard, simulator, lessons, dashboard, auth, and admin in that order;
5. verify light/dark themes at 320, 768, and 1440 px plus keyboard, 200% zoom, grayscale, and reduced motion.

