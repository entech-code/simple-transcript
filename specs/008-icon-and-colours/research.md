# Research: New Icon and Colours

## The design

- **Decision**: a white speech bubble with a periwinkle outline, blue and red speaker dots and
  indigo bars; bold and large, with the 16px and 32px icons drawn on whole pixels.
- **Rationale**: chosen by the maintainer over several rounds of candidates compared at all sizes,
  on light and dark toolbars. The first version adopted (a thin outline, artwork within the store's
  96x96 area, a 2px margin at 16px) looked small and light in the real toolbar next to other
  extensions' icons, so the outline was thickened, the bubble enlarged, and the 16px icon redrawn
  edge to edge.
- **Alternatives considered**: an indigo tile; the outlined bubble with a wide margin;
  an indigo outline; no dots at 16px; a 1.5px outline at 16px, which blurs because it cannot sit
  on whole pixels.

## Rendering the PNGs

- **Decision**: a Node script driving the installed Chrome in headless mode, drawing each SVG on a
  canvas of the target size.
- **Rationale**: no dependency to add; Chrome renders SVG the way the toolbar will; drawing at the
  exact size keeps the 16px grid. Kept as a script so the PNGs can be remade when the design
  changes.
- **Alternatives considered**: an npm rasteriser such as `sharp` or `@resvg/resvg-js` (adds a
  development dependency); exporting by hand from a browser or design tool (not repeatable);
  Chrome's `--screenshot` (no transparent background control at very small window sizes).

## Accent colours

- **Decision**: light `#4338ca` with white text; dark `#818cf8` with `#1c1c1a` text.
- **Rationale**: both are colours of the icon (its bars and outline). Contrast is about 7.9:1 and
  5.7:1, above the 4.5:1 required (FR-007). `#4f46e5`, the icon's brighter indigo, also passes on
  white (6.3:1) but is less calm for a panel that sits over a call.
- **Alternatives considered**: periwinkle in both themes (only 2.9:1 with white text in the light
  theme).

## Neutral colours

- **Decision**: unchanged in this feature.
- **Rationale**: keeps the change to the brand colour; whether the warm greys suit indigo is easier
  to judge once the accent has changed.
