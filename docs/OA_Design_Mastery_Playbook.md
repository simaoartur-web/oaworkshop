# O+A Design Mastery Playbook
## UI/UX, Product Design, Visual Direction & Front-End Experience

> Working reference for future design reviews, redesign plans, Codex prompts, dashboards, forms, websites, organizational charts, ERP-like systems, and information-dense interfaces.

## 1. Core Design Doctrine
Every visual decision must support comprehension, prioritization, navigation, task completion, error prevention, confidence, accessibility, or brand recognition. If an element adds visual weight but does not improve one of these, question whether it should exist.

A polished interface can increase perceived usability and trust, but aesthetics cannot compensate for major usability failures. Use visual quality to reinforce order, confidence, craftsmanship, brand personality, and emotional tone.

## 2. User-Centered Product Lens
Before redesigning a screen, answer:
1. Who uses this screen?
2. What are they trying to accomplish?
3. What is the most frequent task?
4. What is the highest-risk task?
5. What information must be visible immediately?
6. What can be progressively disclosed?
7. What decisions does the user need to make?
8. What mistakes are likely?
9. What happens immediately after the task?
10. How does the screen behave for a first-time vs. expert user?

Design from the real user, not from the database structure or from what looks impressive in a screenshot.

## 3. Visual Hierarchy
Use hierarchy through scale, contrast, typography, position, whitespace, grouping, density, color, repetition, and visual weight.

Not everything can be important. If many elements compete for first attention, the hierarchy has failed.

### Squint Test
Blur or mentally squint at the screen. You should still identify the primary area, secondary areas, main CTA, and major groups.

## 4. Gestalt & Perceptual Organization
- **Proximity:** nearby items are perceived as related. Use spacing before borders.
- **Similarity:** same color, size, shape, typography, or behavior suggests relationship.
- **Common region:** boundaries strongly group content. Avoid putting everything in cards.
- **Continuity:** align elements so the eye follows structure naturally.
- **Figure/ground:** active content must separate clearly from supporting chrome.

## 5. Information Architecture
A user should understand where they are, what the screen is for, what they can do, and what happens next. Prefer language based on user goals instead of internal terminology. Navigation should maximize information scent through descriptive labels, predictable categories, active-state signaling, and familiar interaction patterns.

## 6. Cognitive Load
Prefer recognition over recall. Keep labels, requirements, recent choices, relevant context, and important actions visible or easily retrievable.

Use progressive disclosure: show essential information and actions first; reveal advanced controls, metadata, rare options, and detailed explanations when relevant.

## 7. Nielsen Heuristic Review
Check:
1. Visibility of system status
2. Match with the real world
3. User control and freedom
4. Consistency and standards
5. Error prevention
6. Recognition rather than recall
7. Flexibility and efficiency
8. Aesthetic and minimalist design
9. Error recognition and recovery
10. Contextual help/documentation

## 8. Layout & Grid
Prefer a deliberate 4px/8px spacing foundation.

Typical spacing tokens:
- 4px — micro
- 8px — tight
- 12px — compact grouping
- 16px — component
- 24px — standard section
- 32px — strong separation
- 48px — major section
- 64px+ — editorial/page-level

Use strong shared edges. Density should match the task: dense for ERPs/admin tools; more expressive space for portfolios, storytelling, and marketing.

## 9. Typography
Typography is information architecture.

Recommended roles:
- Display
- Page title
- Section title
- Component title
- Body
- Secondary body
- Label
- Caption/metadata

Use few font families and controlled size tiers. Prefer regular/medium/semibold/bold for UI. Avoid thin weights at small sizes. Use comfortable line-height and controlled line lengths. Scalable units such as rem are preferred in implementation where appropriate.

## 10. Color
Define tokens for background, surfaces, borders, primary/secondary text, accent, semantic states, and focus. Do not communicate hierarchy only with hue. Reserve strong accent colors for important actions or signals.

## 11. Accessibility
Use WCAG 2.2 as the web baseline.

Check:
- normal text contrast around 4.5:1 minimum;
- large text around 3:1 minimum;
- meaningful UI/non-text contrast around 3:1;
- visible keyboard focus;
- no meaning through color alone;
- logical tab order;
- semantic HTML;
- keyboard-operable interactions;
- zoom/reflow;
- text enlargement without clipping;
- sufficient targets and spacing;
- meaningful alt text;
- reduced-motion consideration.

WCAG 2.2 minimum target reference: 24×24 CSS px with specified exceptions. Prefer larger targets for touch-first UI.

## 12. Interaction States
Consider default, hover, focus-visible, active, selected, unavailable/disabled, loading, success, warning, and error.

Also design empty state, first use, partial data, long content, overflow, no permission, network failure, slow operation, and destructive confirmation.

## 13. Buttons & Actions
Create clear primary, secondary, tertiary, and destructive action levels. Place actions close to the objects they affect. Destructive actions should not visually blend with ordinary operations.

## 14. Forms
Prefer simple vertical flows.

Field anatomy:
Label → helper text when needed → input → validation/status.

Validate after meaningful interaction. Keep errors next to the problematic field. Explain the problem and how to fix it. Avoid premature validation and tooltip-only error messages. Use `fieldset` and `legend` for logical groups when appropriate.

## 15. Tables & Dense Data
Tables should prioritize comparison, not decoration.

Use clear headers, consistent column formatting, restrained borders, useful sorting/filtering, sticky context where justified, and right alignment for comparable numeric values.

Do not turn naturally tabular information into cards just to look modern.

## 16. Dashboards
A dashboard is not a wall of cards.

Start from decisions:
- What needs attention?
- What changed?
- What is at risk?
- What should the user do next?
- What requires comparison?

Organize into:
1. priority/action layer;
2. monitoring layer;
3. supporting detail layer.

## 17. Org Charts & Relationship Interfaces
Communicate hierarchy primarily through position, grouping, scale, connection, indentation, and repetition. Lines are supporting signals.

Use a data-driven person component with name, role, group/department, image/avatar, and optional profile detail. On mobile, redesign the interaction instead of shrinking a desktop tree.

## 18. Responsive Design
Responsive does not mean scaled-down desktop.

At each breakpoint ask:
- What remains primary?
- What stacks?
- What collapses?
- What must stay visible?
- What interaction changes?
- Is comparison still possible?
- Is reading order logical?

## 19. Motion
Motion should explain causality, hierarchy, spatial relationships, state changes, or feedback. Avoid animation that delays frequent tasks, competes with reading, or causes layout instability. Respect reduced-motion preferences.

## 20. Productive vs. Expressive Design
### Productive UI
For dashboards, forms, ERPs, and professional tools: restrained, efficient, dense-but-readable, predictable, accessible.

### Expressive UI
For architecture websites, portfolios, and editorial storytelling: stronger scale, composition, imagery, editorial typography, deliberate asymmetry, controlled motion.

These modes can coexist, but not randomly.

## 21. Visual Polish Pass
Inspect:
- focal point;
- visual balance;
- alignment;
- vertical rhythm;
- whitespace;
- typography hierarchy;
- line wrapping;
- icon consistency;
- component padding;
- radii/borders;
- hover/focus/active states;
- content labels;
- brand coherence;
- contrast;
- keyboard behavior;
- zoom;
- target sizes.

## 22. Anti-Generic Design Rules
Do not automatically add:
- glassmorphism;
- gradients;
- giant rounded cards;
- decorative blobs;
- excessive shadows;
- excessive pill buttons;
- random illustrations;
- meaningless metric cards;
- unnecessary borders;
- animation everywhere.

Before adding a treatment, ask: **What communication or interaction problem does this solve?**

## 23. Engineering Handoff
For important components specify:
- purpose;
- content model;
- variants;
- responsive behavior;
- interactions;
- states;
- accessibility semantics.

Prefer reusable tokens and components over page-specific styling.

## 24. Codex / Lovable Workflow
### Phase 1 — Inspect
Inspect components, styling architecture, reusable pieces, data sources, visual bugs, and affected files.

### Phase 2 — Plan
Require component architecture, UI hierarchy, responsive strategy, state model, accessibility considerations, and incremental implementation steps.

### Phase 3 — Approve
Review the plan before code changes.

### Phase 4 — Implement incrementally
Change one meaningful area at a time.

### Phase 5 — Visual QA
Compare intent, implementation, responsive states, edge cases, accessibility, and visual consistency.

## 25. Primary Study References
- Nielsen Norman Group — usability heuristics, visual hierarchy, Gestalt, progressive disclosure, recognition vs. recall, visual design.
- W3C — WCAG 2.2.
- Apple Human Interface Guidelines — hierarchy, layout, typography, accessibility.
- Microsoft Fluent 2 — accessibility, responsive layout, focus, hierarchy, component patterns.
- IBM Carbon Design System — productive vs. expressive typography, accessibility, complex product UI.
- Atlassian Design System — 8px spacing, tokens, typography, scalable systems.
- GOV.UK Design System — spacing, structure, accessible production patterns.
- U.S. Web Design System — user needs, accessibility, forms, tables.
- Adobe Spectrum — inclusive design, typography, spacing, component specifications.

## 26. Standard Review Output
### 1. Diagnóstico UX / Análise Rápida
Friction, user goal, hierarchy, task problems.

### 2. Estratégia Visual & Hierarquia
Grid, density, color, typography, hierarchy, responsive strategy.

### 3. Anatomia dos Componentes & Interação
Components, states, micro-interactions, validation, error prevention, accessibility.

### 4. Especificação Técnica / Protótipo
Component model, tokens, HTML/CSS/Tailwind/React direction, constraints, QA criteria.

## Final principle
A strong interface should feel intentional even before the user understands why.

The goal is not to make every project look the same.

The goal is to make every decision defensible.
