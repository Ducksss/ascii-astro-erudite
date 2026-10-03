# Design system: Signal / Noise

The portfolio's visual language, distilled from the NOISED reference boards.
Read this before changing any page; every rule below has a reason.

## The taste in one sentence

Precise technical-drawing marks (hairlines, registration crosses, mono
micro-labels) frame objects rendered as ASCII and dither, set against huge,
quiet, light-weight type — in three flat colours.

## Principles

1. **Three flat surfaces.** Ink, ultramarine and paper. Each section is one
   flat surface and sections alternate between them. No gradients, shadows,
   rounded corners, glass or tinted blues.
2. **Extreme scale contrast.** Display type is enormous (up to ~10vw) and
   light (300). Labels are tiny (10–11px) mono uppercase. Avoid the middle.
3. **Imagery is always processed.** Objects are ASCII renders; photos are
   blue duotone. Raw imagery only appears inside article bodies.
4. **Precision frames noise.** Registration crosses, dotted rules that end in
   a cross, L-brackets, `[ bracketed ]` kickers, tab labels, double frames and
   `└─` tree lists give the noisy imagery a technical drawing to live in.
5. **Noise fades by density, not opacity.** Cross grids and pixel blocks thin
   out stochastically, like ink running out. Never fade a texture with a
   smooth gradient alone.
6. **Asymmetric editorial composition.** A headline's second line steps to
   the right, statements indent their first line, cards stagger vertically
   and objects bleed off the edge.
7. **Mono is for metadata, not voice.** Monospace is only for labels, data,
   code and ASCII. Headlines and reading text are always grotesk.

## Tokens

| Token            | Value                                   | Use                                           |
| ---------------- | --------------------------------------- | --------------------------------------------- |
| `--ink`          | `#101010`                               | Proof sections, footer, 404, ink cards        |
| `--ink-raised`   | `#1b1b1b`                               | Panels on ink                                 |
| `--blue`         | `#202ce3`                               | Page openers, header, one accent card per row |
| `--paper`        | `#f6f6f6`                               | Reading surfaces                              |
| `--paper-raised` | `#fcfcfc`                               | Cards and panels on paper                     |
| `--grey-1…4`     | `#dcdcdc` `#a3a3a3` `#6e6e6e` `#3a3a3a` | Rules, secondary text, ASCII levels           |

`.surface-blue`, `.surface-ink` and `.surface-paper` set the role variables
(`--foreground`, `--muted-foreground`, `--rule`, `--solid-bg` …) so every
primitive adapts to the surface it sits on. On blue, secondary text is white
at 80% — never a lavender hex. Body copy keeps at least 4.5:1 contrast.

## Type

| Role      | Class          | Face                      | Setting                                 |
| --------- | -------------- | ------------------------- | --------------------------------------- |
| Display   | `.t-display`   | Space Grotesk 300         | `-0.05em`, leading `0.9`, to ~9.7vw     |
| Title     | `.t-title`     | Space Grotesk 300         | `-0.048em`, leading `0.94`              |
| Statement | `.t-statement` | Space Grotesk 350         | first line indented `1.6em`             |
| Lede      | `.t-lede`      | Space Grotesk 300         | 1.35–1.9rem, leading `1.12`             |
| Body      | `.t-body`      | Space Grotesk 400         | 15–17px, leading 1.6–1.75               |
| Poster    | `.t-poster`    | Mona Sans 900, `wdth 75`  | uppercase, leading `0.84`, one per page |
| Wordmark  | footer         | Mona Sans 900, `wdth 125` | dissolves into pixels                   |
| Label     | `.t-label`     | Geist Mono 400            | 11px uppercase, `+0.045em`              |

Space Grotesk was chosen because its u-shaped `y`, open `g` and geometric
build match the reference's headline face. Mona Sans covers both the
condensed poster type and the expanded wordmark from one variable file.

## Marks and devices

| Device             | Class                        | Notes                                           |
| ------------------ | ---------------------------- | ----------------------------------------------- |
| Registration cross | `.mark-cross`                | Four ticks around an open centre                |
| Cross box          | `.cross-box`                 | 15px solid square after nav labels              |
| Dotted rule        | `.rule-dotted`               | 6px pitch, ends in a cross (`--start` flips it) |
| L-brackets         | `.frame-brackets`            | Offset left/right brackets around an object     |
| Bracketed kicker   | `.bracketed`                 | Tall hairline `[ ]` around a short label        |
| Tab                | `.tab`                       | Solid label pinned to a frame's top-left        |
| Double frame       | `.frame-double` + `__panel`  | 1px frame, 8px gap, inner panel                 |
| Tree list          | `.tree`, `.tree--text`       | `└─` connectors; `--text` for sentences         |
| Tag                | `.tag`, `--solid`, `--quiet` | Mono label in a box                             |
| Button             | `.btn`, `--solid`, `--blue`  | Square, mono, ends in an arrow                  |
| Stats / meta       | `.stat-row`, `.meta-list`    | Numbers and label/value rows in asides          |

## Imagery

### ASCII objects (`src/lib/ascii`)

Signed-distance models are ray-marched into a luminance grid, auto-levelled,
Bayer-dithered across the glyph ramp `.:-=+*#%@`, split into four brightness
classes and optionally given scanline interference trails. Every object
stands for something real:

| Object     | Meaning                                                   | Where                                   |
| ---------- | --------------------------------------------------------- | --------------------------------------- |
| `duck`     | Rubber-duck debugging: complex systems explained plainly  | Home hero                               |
| `coin`     | The bracket-C mark as a token                             | Poster "O", 404 "0", footer, hackathons |
| `bars`     | Forecasting and charts                                    | MetaLearner card and station            |
| `padlock`  | Cyber readiness                                           | Singapore Armed Forces card and station |
| `chain`    | Integrations, connectors and delivery pipelines           | Work cards, Taskade station             |
| `cursor`   | The person on the other side of the interface             | About hero, fallback for unmapped roles |
| `database` | Workflow software and the data behind it                  | Associates Consulting station           |
| `terminal` | Command-line and developer tooling                        | GovTech station                         |
| `network`  | People and ventures, with one warm-introduction route lit | Reactor School station                  |
| `door`     | Work beyond the role; `state` swings it open              | About doorway                           |

`<AsciiObject>` renders a frame at build time (cached per option set).
`motion="sway"` drifts and turns toward the mouse; `motion="spin"` rotates.
Motion runs in a Web Worker at ~12fps only while the object is on screen,
backs off on slow devices and is skipped for reduced-motion visitors.
Tones: `ascii--blue`, `ascii--ink`, `ascii--paper` (use `invert` so dense
glyphs mark shadow) and `ascii--bright` for type-scale objects on ink.

Render options also take `morph: { to, t }` (blends one object's distance
field into another's, pose and framing included), `noise` (signal loss:
corrupted glyphs, static and slipped rows) and `state` (an object's own
animation, such as the door's swing). Objects may define `glow` for light
that ignores the lamp; pass a fixed `range` when glow should saturate rather
than re-expose the frame. Pages drive objects from scroll with
`renderInto(element, options)` from `src/lib/ascii/motion.ts`, which shares
the worker and collapses requests while a frame is in flight.

To add an object: write its SDF in `objects.ts` with a `bound` that contains
it around `center`, give it a resting `pose`, then run `npm test` — the
engine tests fail if it clips its frame or renders too small to read.

### Fields (`src/lib/fields.ts`)

Seeded density functions emit SVG masks served from `/fields/*.svg`; the
page colours them with `background: currentColor`:
`cross-corner` (dense in the top-right, scattering out), `cross-band` (under
the wordmark), `cross-skyline` (stepped blocks rising from an edge), `pixels`
(blue bleed) and `dissolve` + `scatter` (the wordmark breaking apart).

`<BinaryField>` is the text counterpart: a `0 1` field that brightens through
a band and thins away from it (the 404). Keep it beside objects, not behind
them, so the object stays legible.

### Photos

Thumbnails and avatars use the `#duotone-blue` SVG filter defined in the
layout: shadows deep blue, midtones ultramarine, highlights white.

## Experiential patterns

The About page turns the record into something you move through. Each
pattern keeps the content in normal reading order, uses native scrolling
(never scroll-jacking), works without JavaScript and settles into a still
version for reduced motion.

- **Tuner** (`components/about/tuner.astro`): the career as a radio dial. A
  sticky instrument screen shows one object per role; the scroll position
  between two chapters sets the morph and the noise, which peaks halfway, so
  the object breaks into static and locks onto the next station. Readouts
  (station, frequency, lock, signal bars) and a dial needle follow along; the
  dial's station links jump to each chapter. Stations come straight from
  `PROFILE.experience`, sorted by start date; map a new role id to an object
  in the tuner or it falls back to `cursor`. A locked station holds still, so
  frames are only rendered while the visitor is tuning. On narrow screens the
  whole rail sticks under the header and chapters slide beneath it.
- **Doorway** (`components/about/doorway.astro`): work beyond the role sits
  behind a door whose `state` follows the section through the viewport; light
  spills across the floor as it opens. It renders only when scrolling changes
  how far it is open.
- **Wins** (`components/about/wins.astro`): hackathon awards as tilted cards
  over a binary field and a dim coin, after the reference's testimonial
  board. The strip scrolls natively, can be dragged with a mouse, is a
  focusable region for the keyboard, and a cross on a dotted rule tracks it.
- **Scramble** (`lib/scramble.ts`): decorative readouts decode through ASCII
  glyphs before settling. Only use it on text that is also available plainly.

## Composition by surface

- **Blue** opens every page. The header lives on it; headlines are white
  Space Grotesk 300; tags are white solid or white outline.
- **Paper** carries reading: statements, staggered cards, archives, articles.
- **Ink** carries proof and closure: the poster line, metrics, practice
  tiles, impact work, the 404 and the footer.

Home: blue hero (duck) → paper work (statement + three staggered cards on
ink, blue and paper panels) → ink proof (poster, metrics, practice tiles) →
paper notes (bracketed note cards, blue pixel bleed, cross skyline) → ink
footer (bracketed coin, dissolving wordmark).

About: blue hero (cursor) → ink tuner (every role, 2021 to now) → blue
doorway (projects beyond the role) → ink wins (hackathon awards) → paper
record (education, awards, leadership, skills) → ink footer.

## Don't

- Don't set headlines in mono.
- Don't use a navy or a lavender; derive tints from white or ink only.
- Don't round corners or add drop shadows.
- Don't put more than one poster-type moment on a page.
- Don't fade textures with opacity gradients alone.
- Don't frame the whole site in a grey canvas — that grey is the reference
  board's presentation backdrop, not part of the design.
- Don't put an `<AsciiObject>` inside a `<p>`; its `<pre>` ends the paragraph.
