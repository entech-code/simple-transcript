# Feature Specification: New Icon and Colours

**Feature Branch**: `feat/icon-and-colours`

**Created**: 2026-10-06

**Status**: Draft

**Input**: User description: "New icon and colours. The current icon is the same as the published 'Notula for Google Meet' one, so the two would be confused. Draw a few simple SVG candidates, compare them at toolbar size (16px) and store size (128px), and avoid anything resembling Google Meet's logo or colours. Needed before the first Chrome Web Store release." Chosen design: a white speech bubble with a periwinkle outline, coloured speaker dots and indigo lines, made bolder and larger after trying it in the toolbar.

## User Scenarios & Testing *(mandatory)*

The extension's icon is a terracotta tile with a white camera and lines, the same as the
published "Notula for Google Meet" extension it was forked from, and its panel and popup use the
same terracotta accent. Someone who has both, or who sees both in the store, cannot tell them
apart.

### User Story 1 - The extension has its own icon (Priority: P1)

A person sees Simple Transcript in the Chrome toolbar, on the extensions page and in the Chrome
Web Store. Its icon is a white speech bubble with a periwinkle outline, holding transcript lines
with coloured speaker dots, and does not look like Notula's or Google Meet's.

**Why this priority**: The icon is how people find the extension in the toolbar and recognise it
in the store; sharing it with another extension causes confusion and could block the store
listing.

**Independent Test**: Load the extension and look at the toolbar, `chrome://extensions` and the
icon files at each size.

**Acceptance Scenarios**:

1. **Given** the extension is installed, **When** the person looks at the Chrome toolbar,
   **Then** they see the new speech-bubble icon, sharp, on both light and dark toolbars.
2. **Given** the extensions page, **When** the person finds Simple Transcript, **Then** it shows
   the new icon.
3. **Given** the 128px icon, **When** it is shown as a Chrome Web Store tile, **Then** the
   artwork has transparent space around it and does not touch the edges.
3a. **Given** the toolbar, **When** the icon sits next to other extensions' icons, **Then** it
   looks as large as they do.
4. **Given** the icons at every size, **When** compared with Notula's and Google Meet's, **Then**
   they share neither the shape nor the colours.

---

### User Story 2 - The panel and popup match the icon (Priority: P2)

A person opens the floating panel or the toolbar popup. Buttons, highlights and the selected
meeting use the icon's indigo instead of terracotta, in both light and dark themes.

**Why this priority**: An indigo icon next to a terracotta panel looks like two products; but the
panel works either way.

**Independent Test**: Open the panel and the popup in light and dark mode and check every place
the accent appears.

**Acceptance Scenarios**:

1. **Given** the light theme, **When** the panel or popup is open, **Then** the accent colour
   (live marker, selected meeting, highlighted buttons, focus) is indigo.
2. **Given** the dark theme, **When** the panel or popup is open, **Then** the accent is the
   icon's periwinkle, readable on the dark background.
3. **Given** text on an accent background, **When** it is shown, **Then** it remains readable.

---

### Edge Cases

- A screen at 150% or 200% scaling: Chrome uses the 32px icon in the toolbar; it shows the dots.
- The panel shown over a Meet call in Meet's dark theme: the panel's own dark colours apply, as
  today.
- Warning and danger colours (yellow notice, red delete): unchanged; they carry meaning, not
  brand.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The extension MUST use the periwinkle speech-bubble design at every icon size: the
  main design (three lines) at 128 and 48px, and simplified two-line designs at 32px and 16px,
  each with its speakers' dots.
- **FR-002**: The 128px icon MUST leave a transparent margin of about 9 pixels around its artwork.
  (The store suggests 16; the larger bubble was preferred.) The 16px icon MUST fill the square
  edge to edge, so it is as large as other toolbar icons.
- **FR-003**: Icons MUST have a transparent background, so they suit light and dark toolbars.
- **FR-004**: The 16px and 32px icons' outlines, bars and dots MUST sit on whole pixels: a 2px
  outline at 16px and a 3px outline at 32px.
- **FR-005**: The old icon files MUST be replaced, so no Notula artwork remains in the extension.
- **FR-006**: The panel and the toolbar popup MUST use the icon's indigo as their accent colour in
  the light theme, and the icon's periwinkle in the dark theme, everywhere the terracotta accent is
  used today, including its tints (selected and highlighted backgrounds).
- **FR-007**: Text on an accent-coloured background MUST meet a contrast ratio of at least 4.5:1.
- **FR-008**: Neutral colours (backgrounds, borders, text) and the warning and danger colours MUST
  stay as they are.
- **FR-009**: The exploration folders (`icons/try-*`) MUST NOT ship; only the
  chosen design's source files are kept.

### Key Entities

- **Icon set**: the icon at 16, 32, 48 and 128px, with the source drawings it is made from.
- **Accent colour**: the brand colour of the panel and popup, with a light-theme and a dark-theme
  value and the lighter tints derived from it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: No icon file or accent colour in the extension matches Notula's.
- **SC-002**: The 16px toolbar icon shows no blurred edges when viewed at 100% scaling.
- **SC-003**: Every accent-coloured text and button passes a 4.5:1 contrast check in both themes.
- **SC-004**: The icon and the panel read as one product: the panel's accent is the icon's colour.

## Assumptions

- The accent colours are indigo `#4338ca` in the light theme (the icon's bars, with white text)
  and periwinkle `#818cf8` in the dark theme (the icon's outline, with dark text).
- The blue and red speaker dots stay in the icon only; the panel does not start colouring speakers
  in this feature.
- The warm neutral greys stay. If they look off next to indigo, cooler greys are a follow-up.
- Store screenshots and promotional tiles are made in the later "Rewrite the website pages,
  privacy policy and store listing" item, not here.
- The Copy, Export and Delete buttons are restyled in the later "Clean up the Copy, Export and
  Delete icons" item, not here.
