---
name: Transit Telemetry Roster
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#1d4ed8'
  on-secondary: '#ffffff'
  secondary-container: '#4069f2'
  on-secondary-container: '#fffbff'
  tertiary: '#855300'
  on-tertiary: '#ffffff'
  tertiary-container: '#e29100'
  on-tertiary-container: '#523200'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#dce1ff'
  secondary-fixed-dim: '#b7c4ff'
  on-secondary-fixed: '#001551'
  on-secondary-fixed-variant: '#0039b5'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Barlow Condensed
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: 0.02em
  headline-xl-mobile:
    fontFamily: Barlow Condensed
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: 0.02em
  headline-lg:
    fontFamily: Barlow Condensed
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: 0.01em
  headline-md:
    fontFamily: Barlow Condensed
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: 0.02em
  headline-sm:
    fontFamily: Barlow Condensed
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: 0.03em
  body-lg:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 17px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0.01em
  body-md:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0.01em
  body-sm:
    fontFamily: Atkinson Hyperlegible Next
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.015em
  label-lg:
    fontFamily: Barlow Condensed
    fontSize: 16px
    fontWeight: '700'
    lineHeight: 20px
    letterSpacing: 0.06em
  label-md:
    fontFamily: Barlow Condensed
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Barlow Condensed
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
spacing:
  gutter: 0.75rem
  margin: 1rem
  gutter-tablet: 1rem
  margin-tablet: 1.5rem
  gutter-desktop: 1.5rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

The design system establishes a high-density, mission-critical transit operational environment designed for field drivers and dispatch operators under rapid glance and direct sunlight conditions. Its visual personality is direct, industrial, and unyielding—prioritizing absolute data legibility, rapid state toggling, and physical certainty over decorative fluff.

Targeted at shuttle operators managing tight pickup (*Toplama*) and dropoff (*Dağıtım*) windows, the design evokes prompt reliability, operational control, and ergonomic precision. Drawing from brutalist transit signage, cockpit avionics, and high-contrast digital displays, it strips away rounded curves and diffused elevations in favor of stark geometric boundaries, razor-sharp rectangular toggles, and instant visual feedback. Every tap is definitive, ensuring drivers can assess manifests and verify passenger onboarding in milliseconds without cognitive friction.

## Colors

The color palette centers on distinct state segregation and daylight-readable luminance:

- **Primary (`#10B981` - Emerald Telemetry):** Anchors boarding confirmations, successful passenger check-ins, and the morning *Toplama (Evden İşe)* directional service. High saturation ensures instant peripheral recognition.
- **Secondary (`#1D4ED8` - Transit Marine):** Structures navigation frames, primary application banners, route headers, and telemetry mode indicators.
- **Tertiary (`#F59E0B` - Industrial Amber):** Designates the evening *Dağıtım (İşten Eve)* route mode, pending actions, route deviations, and urgent dropoff markers.
- **Neutral Palette (`#0F172A` Slate Base):** The dark slate neutrals range from deep pitch text (`#0F172A`) to structured boundary lines (`#CBD5E1`) and high-luminance flat card surfaces (`#F8FAFC`, `#FFFFFF`), eliminating glare while maintaining minimum 7:1 contrast ratios.

### Functional Mapping & Route Semantics
- **Toplama Mode:** Surface borders and primary callout markers adopt `#10B981`. Active toggle states fill with high-opacity emerald tint (`#ECFDF5`) bordered by solid `#10B981`.
- **Dağıtım Mode:** Primary dynamic elements shift to `#F59E0B`. Active dropoff manifests utilize `#FFFBEB` fills with dense `#D97706` text and borders.
- **Driver Alert States:** System errors and non-attendance flags use stark `#DC2626` (Red-600) with solid fill badges.

## Typography

The typographic hierarchy pairs two specialized typefaces to achieve maximum speed-of-read:

1. **Barlow Condensed (Headlines, Telemetry, and Mode Badges):** Provides high-density vertical rhythm reminiscent of industrial wayfinding and airport flight information displays. Set with deliberate uppercase tracking (`0.04em` to `0.08em`), it commands the layout, enabling route metrics (e.g., `TOPLAMA (EVDEN İŞE) - 18/24 BİNDİ`) to remain visible across vehicle cabins.
2. **Atkinson Hyperlegible Next (Body, Passenger Manifest Names, Timestamps):** Developed specifically for unambiguous legibility under sub-optimal visual conditions. Distinct glyph forms prevent confusion between similar characters (e.g., `I`, `l`, `1`, and Turkish dotted/dotless `İ`, `I`), safeguarding correct identification of passenger names, addresses, and telephone details on bumpy roads.

## Layout & Spacing

The layout system is built on a tight, compact 4px mathematical base configured for thumb-reach access within mobile dashboard cradles:

- **Mobile Phone Core (`360px - 480px`):** Single-column vertical stream constrained by a strict `1rem` edge margin. Passenger rosters use direct stacked cards spanning the full width minus margins to maximize horizontal finger-strike targets.
- **Tablet & Vehicle Mounted Displays (`768px - 1024px`):** Dual split-panel architecture. The left fixed panel (`320px`) hosts route progress, stops list, and master telemetry toggles; the right flexible pane expands the full passenger roster grid with dual-column cards separated by a `1rem` gutter.
- **Target Sizes:** Every interactive roster toggle maintains a minimum height of `60px` with edge-to-edge touch targets. Internal padding utilizes `space-md` (`0.75rem`) for compact vertical economy without risking false touches.

## Elevation & Depth

This design system deliberately eschews soft drop shadows, blurs, and skeuomorphic gradients to eliminate visual artifacts on high-glare vehicle screens.

- **Crisp Surface Outlines:** Depth and containment are achieved exclusively through structural borders (1px to 2px thick) using `#0F172A` and `#CBD5E1`.
- **Tonal Contrast Stacking:** Elevated or high-priority modals sit on a stark white `#FFFFFF` surface layered directly over an industrial slate ground `#F1F5F9`, bounded by an uncompromising 2px solid `#0F172A` perimeter border.
- **Hard Technical Drop Shadows (Interactive Only):** When a component elevates upon active tap or focus, it emits an unblurred, offset technical projection: `box-shadow: 3px 3px 0px #0F172A`. This imparts a mechanical switchboard tactile feel without muddying interface lines.
- **Active State Depressions:** When toggled or pressed, the element translates down and right (`transform: translate(2px, 2px)`), collapsing the hard shadow to `1px 1px 0px #0F172A`, giving physical confirmation to the driver.

## Shapes

The shape system enforces pure geometric sharpness with an absolute `0px` radius across all elements.

- **Zero-Tolerance Radii:** All corners—buttons, roster cards, status tags, toggle boxes, input inputs, and modal sheets—are cut at strict 90-degree right angles.
- **Industrial Rationale:** Sharp rectangular geometries echo technical dispatch sheets, maximizing every square pixel of usable display real estate and allowing seamless edge-snapping and grid alignment across mobile device viewports.
- **Visual Cadence:** Corner cuts, divider notches, and segmented progress bars use straight diagonal 45-degree chamfers where visual variation is needed, reinforcing the telemetry aesthetic.

## Components

### Passenger Roster Toggle Tiles (Primary Interaction)
- **Geometry & Structure:** Full-width rectangular card with a height of `64px`. Zero corner radius, enclosed within a 1.5px solid `#CBD5E1` border.
- **Unchecked State:** Surface is neutral `#FFFFFF`. Passenger name is set in `body-lg` (`#0F172A`), stop time/station name in `body-sm` (`#64748B`). Right edge features a crisp 32x32px square check indicator bordered in 2px `#94A3B8`.
- **Checked/Boarded State (Toplama):** Instantaneous transition. Surface flips to high-tint `#ECFDF5`. Border thickens to 2px `#10B981`. The check square fills with solid `#10B981` featuring a white geometric check glyph.
- **Checked/Dropped State (Dağıtım):** Surface shifts to `#FFFBEB` with border `#F59E0B`. Right status indicator shows filled amber confirmation.
- **Interaction Target:** The entire surface area is interactive; tapping any portion triggers state change with an optional haptic impulse.

### Mode Switcher (Toplama vs. Dağıtım)
- **Layout:** Segmented twin-bar anchored at the top of the roster view.
- **Visuals:** Split 50/50 horizontally. Left: `TOPLAMA (EVDEN İŞE)`. Right: `DAĞITIM (İŞTEN EVE)`.
- **States:** Active mode commands a 3px bottom accent bar (Emerald `#10B981` or Amber `#F59E0B`), bold Barlow Condensed uppercase labeling, and `#0F172A` dark background text. Inactive tab recedes with `#F1F5F9` background and muted `#64748B` label.

### Primary Operational Buttons
- **Style:** Flat, high-saturation, 0px border radius with a mandatory minimum height of `48px`.
- **Variants:**
  - *Dispatch Complete:* Background `#1D4ED8`, text white `label-lg`, 2px solid `#0F172A` outline with a 2px offset hard shadow.
  - *Fast Action / Quick Boarding:* Background `#10B981`, text white `label-lg`.
  - *Emergency / No-Show:* Transparent background, 2px red `#DC2626` outline, red text.

### Station & Stop Dividers
- **Appearance:** Sticky sectional header bars spanning the screen width. Background `#0F172A`, text `#FFFFFF` in `label-sm` uppercase. Displays stop sequence, planned ETA, and total onboard/remaining ratio (e.g., `DURAK 04 // 07:42 // LEVENT PLAZALAR // 4 YOLCU`).

### Quick Search & Filter Field
- **Appearance:** High-contrast 44px box with `#FFFFFF` background and a 2px `#0F172A` border. Placeholder text in `body-md` `#94A3B8`. Quick clear button is a solid black square with an inverted white 'X'.