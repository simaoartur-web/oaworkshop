# O+A Workshop — Mobile Optimization Plan

> Full audit performed at **375×812px** (iPhone viewport) across all pages.  
> Every issue is linked to the file, the root cause, and the exact fix.

---

## 🔴 Critical — Broken or Unusable on Mobile

### 1. Custom Cursor on Touch Devices
**File:** `ProjectsSection.tsx` (lines 118–140, 226)  
**Problem:** The custom `DRAG`/`PULL` cursor renders as a fixed overlay on mobile, where there is no mouse. The scroll container uses `cursor-none`, which hides the default cursor on hybrid devices. The entire drag interaction is mouse-event-only (`onMouseDown`, `onMouseMove`, `onMouseUp`).  
**Fix:**
- [ ] Detect touch devices (`window.matchMedia('(pointer: coarse)')` or check `'ontouchstart' in window`)
- [ ] Hide the custom cursor element entirely on touch devices
- [ ] Remove `cursor-none` class on mobile
- [ ] Add `onTouchStart`, `onTouchMove`, `onTouchEnd` handlers mirroring the drag logic for native swipe scrolling
- [ ] Alternatively, rely on native `overflow-x: auto` scroll (which already works) and just remove the cursor overlay on mobile

### 2. Timeline Items Not Tappable
**File:** `ProjectsSection.tsx` (line 239)  
**Problem:** Each timeline project card has `pointer-events-none`, making them impossible to tap/interact with on mobile.  
**Fix:**
- [ ] Remove `pointer-events-none` on mobile, or wrap interactive text (title, year) in an element with `pointer-events-auto`
- [ ] Consider linking timeline items to their respective project pages on tap

### 3. CategoryMap Modal Unusable on Small Screens
**File:** `CategoryMapSection.tsx` (lines 261–338)  
**Problem:** The "Full Details" overlay only appears on `:hover`, which doesn't exist on mobile. Users have no visual cue to tap the image. The modal itself, while stacking vertically, has minimal padding (`p-4`) and the close button is small.  
**Fix:**
- [ ] Add a persistent "View Details" tap indicator (small icon or label) visible on mobile instead of the hover overlay
- [ ] Increase modal padding on mobile: `p-4` → `p-6` at minimum
- [ ] Increase close button hit area: add `min-w-[44px] min-h-[44px]` for WCAG touch target compliance
- [ ] Add swipe-to-dismiss gesture for the modal on mobile

---

## 🟠 High Priority — Visually Out of Place

### 4. CategoryMap — Spinning Border Animation
**File:** `CategoryMapSection.tsx` (lines 102–103)  
**Problem:** The rotating conic-gradient border (`inset-[-150%]`, `animate-[spin_10s_linear_infinite]`) is a massive GPU drain on mobile. It creates a 3× oversized element that constantly repaints.  
**Fix:**
- [ ] Disable or simplify the spinning border on mobile: replace with a static `border-terracota/30` or a subtle `box-shadow` glow
- [ ] Use a media query or Tailwind `md:` prefix: show the spinning animation only on `md:` and above
- [ ] This alone should noticeably improve scroll performance on lower-end phones

### 5. Expertise Section — Excessive Height
**File:** `ExpertiseSection.tsx` (line 55)  
**Problem:** Each expertise area is `h-[60vh] md:h-[75vh]`. With 4 items, that's **240vh** of scrolling on mobile — an enormous amount of empty space with just a title and one line of text each.  
**Fix:**
- [ ] Reduce mobile height: change to `h-[45vh] md:h-[75vh]` or better yet use `min-h-[300px] md:h-[75vh]`
- [ ] The description text is always visible on mobile (no hover needed), so items don't need as much vertical space
- [ ] Consider a more compact card-based layout on mobile instead of fullscreen panels

### 6. Expertise Section — Hover-Only Interactions on Touch
**File:** `ExpertiseSection.tsx` (lines 58–66, 77)  
**Problem:** Image reveal (grayscale → color) and description text reveal are both `group-hover:` only. On mobile, these never trigger. The description uses `md:translate-y-full md:opacity-0 group-hover:translate-y-0` — visible on mobile by default but invisible on tablet (768px+) without hover.  
**Fix:**
- [ ] Replace `group-hover:` image effects with an IntersectionObserver-based trigger or always show the image in partial color on mobile
- [ ] Ensure the description text is always visible below the `md:` breakpoint (already correct for `<768px` but verify tablet behavior at exactly 768px)

### 7. Contact Section — Excessive Gap on Mobile
**File:** `ContactSection.tsx` (line 39)  
**Problem:** `gap-24` (6rem / 96px) between the info column and form column persists even when stacked vertically on mobile. This creates a huge blank gap.  
**Fix:**
- [ ] Change to `gap-12 lg:gap-24` to reduce the gap on mobile while keeping the spacious desktop layout

### 8. News Section — Layout Issues on Mobile
**File:** `NewsSection.tsx` (lines 77, 119, 127, 164–169)  
**Problem:** The two-column layout stacks vertically, but the preview image still has `max-w-[350px]` making it not full-width on slightly wider phones. The "next" navigation button (`hidden lg:flex`) is completely invisible on mobile — users can only wait for auto-play.  
**Fix:**
- [ ] Make the preview image full-width on mobile: `max-w-full md:max-w-[350px]`
- [ ] Add a mobile-visible navigation: show the "next" button on all screen sizes, or add swipe gesture support for the news carousel
- [ ] Add dot indicators at the bottom showing which news item is active

### 9. Workshop Section — Slider Nav Stacking
**File:** `WorkshopSection.tsx` (line 149)  
**Problem:** The slider navigation labels use `flex-col lg:flex-row` and each takes `flex-1 w-full`, causing them to stack vertically on mobile. This wastes significant vertical space.  
**Fix:**
- [ ] Change to `flex-row` on all sizes, with labels truncated or using shorter text on small screens
- [ ] The progress bars should be horizontal side-by-side even on mobile — they're already thin enough

### 10. Stats Section — Stacked on Mobile
**File:** `StatsSection.tsx` (line 102)  
**Problem:** `grid-cols-1 md:grid-cols-3` causes the 3 stats to stack vertically, taking up ~3× the space needed. Stats are just a number + label and can easily fit 3 across.  
**Fix:**
- [ ] Change to `grid-cols-3` on all sizes to keep stats in a compact row on mobile
- [ ] Reduce text sizes on mobile: `text-xl` for the numbers and `text-[9px]` for labels to fit comfortably

---

## 🟡 Medium Priority — Polish & Touch UX

### 11. Header — Missing Language Switcher on Mobile
**File:** `Header.tsx` (line 63)  
**Problem:** The language switcher has `hidden md:flex`, making it invisible on mobile. Users can only access it through the fullscreen menu overlay, which isn't obvious.  
**Fix:**
- [ ] Show a compact language toggle in the mobile header (e.g., just "EN" / "PT" small buttons) or add it next to the search icon

### 12. Header — Search Input Width Hardcoded
**File:** `Header.tsx` (line 85)  
**Problem:** `window.innerWidth < 768 ? 140 : 220` is a one-time check on render. If the viewport changes (rotation), it doesn't update. Also, 140px may be too wide on very small screens (320px), pushing elements off-screen.  
**Fix:**
- [ ] Replace with responsive CSS: use `w-[35vw] md:w-[220px]` or a max-width approach instead of JS-based width
- [ ] This also improves SSR/hydration consistency

### 13. Footer — Description Text Too Large
**File:** `Footer.tsx` (line 11)  
**Problem:** The tagline paragraph is `text-xl` on all screens, which is 20px on mobile — slightly large for footer content on a small viewport.  
**Fix:**
- [ ] Change to `text-base md:text-xl` for a more proportional mobile footer

### 14. Project Detail Page — Long Titles Can Overflow
**File:** `ProjectDetail.tsx` (line 77)  
**Problem:** The project title is `text-5xl` (3rem) on mobile. Long project names (e.g., "Adaptive Reuse Cultural Center") may not wrap cleanly and could overflow or create awkward line breaks.  
**Fix:**
- [ ] Change to `text-3xl sm:text-5xl md:text-7xl lg:text-8xl` for better mobile scaling
- [ ] Add `break-words` as a safety net

### 15. Project Detail Page — Bottom Action Buttons
**File:** `ProjectDetail.tsx` (lines 129–136)  
**Problem:** "Voltar ao Portfólio" and "Solicitar Proposta" are in a `flex justify-between`, which on mobile causes them to squeeze together or wrap awkwardly.  
**Fix:**
- [ ] Change to `flex flex-col sm:flex-row gap-4` so buttons stack vertically on mobile with proper spacing
- [ ] Make the CTA button full-width on mobile: `w-full sm:w-auto`

### 16. Projects Listing — Filter Pills Scroll
**File:** `Projects.tsx` (line 61)  
**Problem:** Category filters use `overflow-x-auto` which is functional, but there's no scroll indicator. Users may not realize they can scroll to see more filters.  
**Fix:**
- [ ] Add a subtle fade gradient on the right edge to hint at scrollable content
- [ ] Or wrap in a container with `mask-image: linear-gradient(to right, black 85%, transparent 100%)`

---

## 🟢 Low Priority — Nice-to-Have Enhancements

### 17. TouchAction and Scroll Passivity
**File:** Various  
**Fix:**
- [ ] Add `touch-action: pan-x` on the timeline scroll container to prevent vertical scroll interference
- [ ] Add `touch-action: manipulation` on all interactive elements to eliminate 300ms tap delay
- [ ] Ensure all `addEventListener('touchmove')` calls use `{ passive: true }` for scroll performance

### 18. Reduced Motion Support
**File:** `HeroSection.tsx`, `WorkshopSection.tsx`, `CategoryMapSection.tsx`  
**Fix:**
- [ ] Wrap heavy animations (heartbeat, conic-gradient spin, parallax transforms) in a `@media (prefers-reduced-motion: reduce)` check
- [ ] Use `useReducedMotion()` from Framer Motion to skip entrance animations for users who prefer reduced motion
- [ ] This is a significant accessibility win and also improves mobile battery life

### 19. Backdrop-Blur Performance
**File:** `Header.tsx` (line 46), `CategoryMapSection.tsx` (line 268)  
**Fix:**
- [ ] `backdrop-blur-md` on the header and `backdrop-blur-xl` on the modal overlay are known to cause jank on Safari iOS
- [ ] Consider reducing to `backdrop-blur-sm` on mobile or replacing with a semi-opaque solid background as fallback
- [ ] Test specifically on Safari iOS — this is the primary browser where blur causes issues

### 20. Mobile-Specific Meta Tags
**File:** `index.html`  
**Fix:**
- [ ] Add `<meta name="theme-color" content="#111111">` to match the dark UI
- [ ] Ensure `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">` for notched devices
- [ ] Add `apple-mobile-web-app-capable` and `apple-mobile-web-app-status-bar-style` for PWA-like experience

---

## 📋 Execution Order

> Recommended sequence: fix broken things first, then polish.

| Phase | Tasks | Impact |
|-------|-------|--------|
| **Phase 1 — Fix Broken** | #1 Custom Cursor, #2 Timeline Tap, #3 Modal Tap | Unblock mobile usability |
| **Phase 2 — Performance** | #4 Spinning Border, #18 Reduced Motion, #19 Backdrop Blur | Smooth scrolling on mobile |
| **Phase 3 — Layout Fixes** | #5 Expertise Height, #7 Contact Gap, #9 Slider Nav, #10 Stats Row, #14 Title Overflow, #15 Action Buttons | Everything looks intentional |
| **Phase 4 — Touch UX** | #6 Hover Interactions, #8 News Nav, #11 Lang Switcher, #17 Touch Actions | Full touch-first experience |
| **Phase 5 — Polish** | #12 Search Width, #13 Footer Text, #16 Filter Scroll Hint, #20 Meta Tags | Final refinements |

---

## 📎 Files to Modify (Summary)

| File | Issues |
|------|--------|
| `src/components/home/ProjectsSection.tsx` | #1, #2, #17 |
| `src/components/home/CategoryMapSection.tsx` | #3, #4 |
| `src/components/home/ExpertiseSection.tsx` | #5, #6 |
| `src/components/home/ContactSection.tsx` | #7 |
| `src/components/home/NewsSection.tsx` | #8 |
| `src/components/home/WorkshopSection.tsx` | #9 |
| `src/components/home/StatsSection.tsx` | #10 |
| `src/components/layout/Header.tsx` | #11, #12 |
| `src/components/layout/Footer.tsx` | #13 |
| `src/pages/ProjectDetail.tsx` | #14, #15 |
| `src/pages/Projects.tsx` | #16 |
| `src/components/home/HeroSection.tsx` | #18 |
| `index.html` | #20 |
| `src/index.css` | #19 (global) |
