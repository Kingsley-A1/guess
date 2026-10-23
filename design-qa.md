# King Guesser interface QA

final result: passed

## Visual targets and browser evidence

The user selected Cobalt Play as the default, Friendly Focus second, with the other four concepts available from a quiet dropdown. All references were opened before implementation and compared with browser-rendered production screenshots.

| Interface        | Source visual truth                             | Production screenshot                                             |
| ---------------- | ----------------------------------------------- | ----------------------------------------------------------------- |
| Cobalt Play      | `public/designs/earlier-2-cobalt-play.png`      | `/workspace/.setup-guess/themes-production/cobalt-desktop.png`    |
| Friendly Focus   | `public/designs/option-1-friendly-focus.png`    | `/workspace/.setup-guess/themes-production/friendly-desktop.png`  |
| Studio Blue      | `public/designs/option-2-studio-blue.png`       | `/workspace/.setup-guess/themes-production/studio-desktop.png`    |
| Golden Companion | `public/designs/option-3-golden-companion.png`  | `/workspace/.setup-guess/themes-production/golden-desktop.png`    |
| Midnight Focus   | `public/designs/earlier-1-midnight-focus.png`   | `/workspace/.setup-guess/themes-production/midnight-desktop.png`  |
| Evergreen Studio | `public/designs/earlier-3-evergreen-studio.png` | `/workspace/.setup-guess/themes-production/evergreen-desktop.png` |

Desktop viewport: 1487 × 1058 CSS pixels, deviceScaleFactor 1. Sources are 1487 × 1058 pixels. Production screenshots are the same size; no density rescaling was used. The combined `*-compare.png` evidence places reference and implementation together, with a 28px label strip. Focused `cobalt-interaction-compare.png` and `friendly-interaction-compare.png` compare number entry, action, feedback, character rendering and history at equal density.

State: solo adventure level 2, previous guesses 5 and 8, range 9–20, typed value 12, three remaining guesses. Live proximity copy reflects the actual secret. The Midnight mock shows a 6–20 range and four chances alongside guesses 5 and 8; that is inconsistent with these rules. Its live range and count deliberately follow the engine rather than reproducing inconsistent mock data.

All six production interfaces also have `*-mobile.png` captures at 390 × 844 CSS pixels, density 1. The browser suite additionally checks 360, 768 and 1366 widths. No horizontal overflow was observed and every interface's primary action remains inside the viewport.

## Comparison history

### Initial iteration — blocked

Evidence: `/workspace/.setup-guess/themes/*-compare.png`.

- [P2] Cobalt's number entry, clue type and keypad proportions were too compact. The primary number was left aligned rather than centered.
- [P2] Character illustrations in Friendly, Studio and Golden were too small relative to the selected concepts.
- [P2] Friendly and Golden placed chapter progress above the play area and remaining chances in the wrong region.
- [P2] Studio used a range capsule rather than open large digits.

### Revised iteration — fixes applied

Evidence: `/workspace/.setup-guess/themes/*-compare-revised.png`.

Increased desktop input, keypad and heading scale; centered Cobalt entry; enlarged character assets; moved progress and remaining chances into interface-specific positions; restored Studio's open range. Compact phone/laptop rules retained the full primary interaction. Contrast review also found Studio's white action text insufficient against orange; changed it to deep navy, and darkened supporting text in the light interfaces.

### Final production iteration — passed

Evidence: `/workspace/.setup-guess/themes-production/*-compare.png` and focused interaction comparisons, all opened and inspected. Studio's final content width and input proportions were adjusted and recaptured. No actionable P0/P1/P2 findings remain.

## Required fidelity surfaces

- **Fonts and typography:** self-hosted Nunito Sans variable font matches the rounded, heavy game typography. Heading/input scale now preserves the selected hierarchy; smaller viewports use readable compact sizes. Evergreen keeps the reference's serif clue. No clipped headings were observed.
- **Spacing and layout:** Cobalt/Studio retain two-column keypad play; Friendly and Evergreen prioritize the clue; Golden leads with input; Midnight stacks the central entry. No persistent sidebar, marketing section or full level list occupies the play screen. Levels and modes remain usable through compact controls.
- **Colors and tokens:** six scoped palettes reproduce cobalt/gold, violet/coral, navy/orange, forest/gold, midnight/mint and evergreen/gold. Modals, errors, native selects, disabled controls and focus treatment follow the active palette. Contrast repairs intentionally take precedence over mock button text colors. This is not a claim of complete accessibility certification.
- **Images and asset quality:** generated transparent companion assets and raster backgrounds match the references' style and are used in the interface. Characters are 35–38 KB WebP; backgrounds are 10–32 KB. No CSS-drawn substitute artwork, 3D runtime or remote font service is used. Phosphor provides the closest solid rounded game icons; existing level-dialog icons are retained.
- **Copy and behavior:** encouragement remains in every design and in success/loss states. Range, chances, hint cost, history and feedback are driven by real game state. The extra interface selector and levels control are intentional additions required by the user. Full history is retained in game state; the last six guesses are shown compactly.

## Functional verification

- Production build and TypeScript checks passed.
- Eight rules/API/storage tests passed.
- Five browser scenarios passed: solo win/unlock/persistence/dialogs; two-browser duel/rematch/reconnect; default and interface ordering/keypad/state retention/saved preference; all six interfaces complete keyboard play and fit tested sizes; invalid saved preference/hint/validation feedback.
- Default art loading was inspected: only the active Cobalt background is requested. Character images load when their interface is selected.
- Production screenshot run reported no browser JavaScript errors. The production server remains running locally for review.

## Follow-up polish

[P3] Subtle illustration poses, edge-circle/leaf placement, glossy treatment and some secondary grouping differ from the generated concepts. These are optimized original assets and production controls rather than rasterized mockups. Flat surfaces and real game counts are intentional. No further loop is required for these details.

Online room behavior is verified locally with the development store. The existing production Redis requirement remains; this interface change does not establish production multiplayer readiness without its database connection.
