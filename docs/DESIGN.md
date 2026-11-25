# Design

The printed invitation, brought to life: cream silk, champagne gold, deep wine, engraved type. Calm and roomy.

## Colours

| Token | Hex | Use |
|---|---|---|
| `ivory` | `#FBF6EC` | Background |
| `champagne` | `#F3E7CF` | Cards, envelope |
| `sand` | `#E9DCC0` | Venue and date boxes |
| `gold` | `#C9A24D` | Ornaments, rules, large type |
| `gold-deep` | `#8A6A2F` | Gold text at small sizes |
| `wine` | `#7B2A2E` | Buttons, labels, footer |
| `ink` | `#2B2220` | Body text |
| `emerald` | `#1F5E45` | Valid state at the door |
| `amber` | `#B7791F` | Already admitted |

Gold foil text: `linear-gradient(100deg, #8A6A2F, #E8CD8F 45%, #B8893B 60%, #8A6A2F)` with `background-clip: text`. Use it for "Nº 50" and "Funsho" only.

Background: ivory with a soft champagne wash in two corners, like silk.

## Type

- Cormorant Garamond: headings and numbers. "Nº 50" very large.
- Pinyon Script: "Funsho" and "Celebrating" only.
- Jost: body, buttons, and labels. Labels are uppercase with wide letter spacing (about 0.3em), small, in wine.

## Shape

- Thin gold borders. Cards use a double rule, like engraved stationery.
- Small radii: 2px inputs, 4px buttons, 14px info boxes.
- One column, max 560px. Lots of space between sections.

## Ornaments

Hand-drawn SVGs, fine lines: fleur-de-lis (beside programme items, as on the card), a flourish divider, a small crown, the wax seal. Nothing else.

## The envelope intro

1. A champagne envelope on the silk background, wine wax seal with an "F", "Tap the seal" beneath. The seal pulses gently. A "Skip" link sits top-right.
2. On tap: the seal splits and fades, the flap opens (3D rotate), the card slides up out of the envelope, the envelope fades away. About 1.8 seconds in total, transform and opacity only.
3. The card holds the invitation text and the two buttons (see SPEC.md).

With reduced motion, the card simply fades in.

## Forms

- Mobile: bottom sheet. Desktop: centred panel, 480px.
- Inputs with only a gold bottom border, labels above in small caps.
- Errors in wine, one line under the field.

## The pass

Champagne card with a double gold rule. "ENTRY PASS" label, the guest's name, the QR on white with a thin gold frame, then date, times and venue.

## Door and admin

Plain and functional, same colours and fonts, big buttons. No animation.
