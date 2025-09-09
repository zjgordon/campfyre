# UX Guide

This guide defines the design language, theming, accessibility, and layout rules for Campfyre.

## Design Language

- **Material Design 3 (MD3)** as the foundation
- Use **tokens** (colors, typography, elevation, shape) as the source of truth
- Components: buttons, cards, dialogs, text fields, navigation per MD3 spec
- Animations: subtle, 150–250ms, easing curves from MD3 motion guidelines

## Theming

- **Token-first theming:** implement CSS variables for MD3 color roles, radius, elevation
- **Player themes:** each player selects their own theme (dark, neon, forest, etc.)
- **Campaign-driven palettes:** optional auto-accent derived from campaign banner
- **Accessibility:** enforce WCAG AA contrast minimums on all palettes

## Layouts

- **Session Surface:** resizable panes (Video, Map, Character, Dice Log)
- **Presets:**
  - _Video First_ – big video, small side panels
  - _Map First_ – big map, video minimized
  - _Split_ – equal map and video
  - _Character Focus_ – sheet large, others stacked
- **Persistence:** per-user, saved to local storage and campaign context

## Core Flows

1. **Join Flow:** one link → name/avatar → device check → session
2. **In-Session:** players swap layouts, roll dice, update sheets
3. **GM Panel:** scene reveal tools, initiative tracker, handouts
4. **Overlay Mode:** clean, high-contrast stream-safe output (dice, initiative, scene title)
5. **Recap Page:** dice log + notes auto-collected, editable summary

## Accessibility

- Keyboard-first navigation, ARIA roles, semantic markup
- Screen reader-friendly dice results and initiative order
- Motion: respect `prefers-reduced-motion`
- Color-blind palettes validated with simulators

## Device Considerations

- **Mobile Safari:** H.264 baseline video, notch-safe padding
- **Touch targets:** 44px minimum
- **Responsive:** fluid grid layouts; avoid fixed-pixel panels
- **Performance:** lobby/landing JS bundle <150 KB; lazy-load Map/Video

## Tone & Style

- **Modern & inviting:** avoid "90s spreadsheet VTT" feel
- **Human-centered:** empathy in error messages, friendly copy ("Looks like your mic is muted")
- **Polish:** subtle transitions, elevation cues, not skeuomorphic clutter

## Streaming

- Overlay mode defaults to high-contrast, large text
- Safe margins for common streaming resolutions (1080p/720p)
- No personally identifying info in overlays (use avatar + display name only)
