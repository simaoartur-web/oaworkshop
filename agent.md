# News Section — Premium Redesign Plan

## Current Problems

| # | Issue | Viewport | Severity |
|---|-------|----------|----------|
| 1 | **"+ NEWs" heading feels casual** — mixed casing, generic bold Plus icon, no section label or editorial framing | Both | High |
| 2 | **Right-column preview image loads broken / grey** — the `nextItem` image only shows a dark `#111` box on desktop because the AnimatePresence transition doesn't trigger properly on first render | Desktop | Critical |
| 3 | **No visual hierarchy between featured and preview** — both sides use near-identical text styling (underlined bold), nothing distinguishes the main story from the next-up | Desktop | High |
| 4 | **Layout collapses poorly on mobile** — stacks featured image → text → heading → preview image → preview text vertically with no separation or visual rhythm | Mobile | High |
| 5 | **No reading CTA or article link** — the news items are purely decorative with no "Read More" or interactive affordance | Both | Medium |
| 6 | **Category/date metadata is underlined bold** — inappropriate typographic weight, feels cluttered rather than editorial | Both | Medium |
| 7 | **Section transition is abrupt** — flat `border-t border-white/5` gives no visual breathing room between the Research category map section and News | Both | Low |
| 8 | **Dot indicators feel detached** — positioned below with large margin, not clearly associated with the carousel | Both | Low |

---

## Design Direction

**Inspiration:** Modern editorial / magazine layouts from firms like Foster + Partners, BIG, and Zaha Hadid Architects — clean typographic hierarchy, generous whitespace, cinematic image treatment, subtle motion.

### Key Principles
1. **Typographic Hierarchy** — Clear section label (`JOURNAL`), large serif-feeling featured headline, refined sans-serif metadata
2. **Image-First Storytelling** — Full-bleed featured image with text overlay instead of side-by-side layout
3. **Card-Based Preview Row** — Compact horizontal card strip below the hero for upcoming stories
4. **Micro-Interactions** — Smooth parallax-lite on image, animated progress bar (replaces dot indicators), hover lift on cards
5. **Mobile-Native Layout** — Stacked hero with overlay text → horizontal scrollable card strip below

---

## Proposed Layout

### Desktop (≥1024px)
```
┌──────────────────────────────────────────────────────────────┐
│  JOURNAL                                          01 / 03    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│          ┌────────────────────────────────────────┐          │
│          │                                        │          │
│          │        FEATURED IMAGE (16:9)            │          │
│          │        with gradient overlay            │          │
│          │                                        │          │
│          │   ┌──────────────────────────────┐     │          │
│          │   │ Category • Date              │     │          │
│          │   │ HEADLINE TITLE               │     │          │
│          │   │ Brief excerpt...             │     │          │
│          │   │ [Read Article →]             │     │          │
│          │   └──────────────────────────────┘     │          │
│          └────────────────────────────────────────┘          │
│                                                              │
│  ┌───── progress bar (animated, terracota) ─────────────┐   │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │
│  │  thumb 1  │  │  thumb 2  │  │  thumb 3  │   ← card strip │
│  │  title    │  │  title    │  │  title    │                 │
│  └──────────┘  └──────────┘  └──────────┘                   │
└──────────────────────────────────────────────────────────────┘
```

### Mobile (<768px)
```
┌─────────────────────────┐
│    JOURNAL      01/03   │
├─────────────────────────┤
│                         │
│  ┌───────────────────┐  │
│  │  FEATURED IMAGE   │  │
│  │  (full-width)     │  │
│  │                   │  │
│  │  Category • Date  │  │
│  │  HEADLINE         │  │
│  │  [Read →]         │  │
│  └───────────────────┘  │
│                         │
│  ──── progress bar ──── │
│                         │
│  ┌─────┐ ┌─────┐ ┌───  │
│  │ th1 │ │ th2 │ │ th  │ ← horizontal scroll
│  │ ttl │ │ ttl │ │ tt  │
│  └─────┘ └─────┘ └───  │
└─────────────────────────┘
```

---

## Implementation Checklist

### Phase 1 — Data Structure Enhancement
- [ ] Add `excerpt` field to each NEWS item (1-2 sentence summary)
- [ ] Add `tag` field for cleaner category label (e.g. "Journal", "Press Release")
- [ ] Split `category` into `tag` + `date` for independent styling

### Phase 2 — Section Header Redesign
- [ ] Replace `+ NEWs` with editorial section header: `JOURNAL` label (uppercase, tracked, terracota) + counter `01 / 03` on the right
- [ ] Add a thin top divider with subtle fade-in animation
- [ ] Remove the Plus icon from the heading

### Phase 3 — Featured Image Hero
- [ ] Replace the side-by-side 60/40 layout with a single full-width featured image container
- [ ] Use `aspect-[16/9]` with rounded corners (`rounded-sm`)
- [ ] Add bottom-heavy gradient overlay (`from-black/80 via-black/30 to-transparent`)
- [ ] Position headline text inside the image container at the bottom-left:
  - Tag pill: small terracota-accented label
  - Date: `text-[11px] uppercase tracking-widest text-white/50`
  - Title: `text-3xl md:text-5xl font-light` with tight leading
  - Excerpt: `text-sm text-white/60 font-light max-w-lg`
  - CTA link: "Read Article →" with underline hover animation
- [ ] Add a subtle `scale` + `opacity` transition on image swap via AnimatePresence

### Phase 4 — Animated Progress Bar
- [ ] Replace dot indicators with a continuous linear progress bar below the featured image
- [ ] Use terracota fill that advances smoothly during the 6s autoplay interval
- [ ] On manual click (card selection), instantly jump the bar to the new position
- [ ] Add segmented markers (thin vertical lines at 33%, 66%) to indicate total count

### Phase 5 — Card Strip (Below)
- [ ] Create a horizontal row of small cards for ALL news items
- [ ] Each card: thumbnail image (aspect-[4/3], ~200px wide), tag, title
- [ ] Active card gets a terracota bottom border accent and full opacity
- [ ] Inactive cards: `opacity-60 grayscale` hover: `opacity-100 grayscale-0`
- [ ] On mobile: horizontal scroll with `overflow-x-auto` and `snap-x snap-mandatory`
- [ ] Clicking a card updates the featured item + resets the autoplay timer

### Phase 6 — Animation Polish
- [ ] Featured image transition: crossfade with subtle upward ken-burns (`scale-1 → scale-1.03` over 6s)
- [ ] Text overlay: stagger-in from bottom (title 100ms after tag, excerpt 200ms after title)
- [ ] Progress bar: smooth `ease-linear` CSS transition on width
- [ ] Card hover: subtle `translateY(-4px)` lift with shadow increase
- [ ] Section entrance: viewport-triggered fade-in for the header row

### Phase 7 — Responsive Polish
- [ ] Featured image: `aspect-[16/9]` on desktop, `aspect-[4/3]` on mobile for taller crop
- [ ] Text overlay: smaller type sizes below `md:` breakpoint
- [ ] Card strip: `flex-nowrap overflow-x-auto snap-x` on mobile, `grid grid-cols-3 gap-6` on desktop
- [ ] Ensure touch-friendly card widths (`min-w-[260px]`) on mobile
- [ ] Verify spacing works at 375px, 390px, 768px, and 1440px breakpoints

---

## Files Modified

| File | Changes |
|------|---------|
| `src/components/home/NewsSection.tsx` | Complete rewrite — new layout, data structure, animations |

## Risk Assessment

- **Low risk** — Self-contained component, no cross-component dependencies
- **Image loading** — Using the same Unsplash sources, no new assets needed
- **Autoplay** — Must clear/reset timer on manual interaction to avoid jarring jumps
