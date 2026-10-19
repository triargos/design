# Theme generator

Generates a full light and dark palette from a base color, an accent and a contrast level. The algorithm follows [Linear](https://linear.app)'s theme generator.

| File                                    | Holds                                                                          |
| --------------------------------------- | ------------------------------------------------------------------------------ |
| `color.ts`                              | LCH color math: conversion, mixing, contrast                                   |
| `theme-generator.ts`                    | `generateTheme`: input → tokens, plus nested themes                            |
| `theme-to-css.ts`                       | `themeToShadcnVars`: projects tokens onto shadcn vars                          |
| `brand-anchors.ts`, `branding-theme.ts` | organization branding → generator input → `<style data-organization-branding>` |

## Inputs

```
ThemeInput = { base: Color, accent: Color, contrast: 0..100, colorFormat: 'LCH' | 'P3' | 'RGB',
               sidebarInput?: { base, accent, contrast },        # custom sidebar
               elevation?, baseTheme?, _themeType? }              # set by nested themes only
Color      = [L 0..100, C 0..132, H 0..360, A? 0..1]             # CIE LCH, D50
```

A custom theme is exactly `{ base, accent, contrast, sidebarInput? }`, shared as JSON.

The presets. `brandingThemeInput` reuses the default presets' base lightness and contrast.

| Preset              | base                  | accent                   | contrast |
| ------------------- | --------------------- | ------------------------ | -------- |
| `darkDefault`       | `[5.52, 0.4, 272]`    | `[47.92, 59.30, 288.42]` | 27       |
| `darkHighContrast`  | `[8, 0.75, 272]`      | same                     | 90       |
| `lightDefault`      | `[97.94, 0.5, 282]`   | `[53, 52.26, 286.91]`    | 30       |
| `lightHighContrast` | `[98.7, 0.5, 282.86]` | same                     | 90       |

## Color pipeline

`LCH → Lab → XYZ(D50) → Bradford D50→D65 → linear sRGB | linear P3 → sRGB transfer`. The reverse goes through Bradford D65→D50.

- `toCss`: LCH rounds to 3 decimals; P3 is clamped to 0..1 and alpha is unrounded; hex truncates channels (no rounding).
- `mix` interpolates in XYZ, not polar LCH.
- `getTextColor([L, C, H]) = [L − 0.075·C > 65 ? 0 : 100, C/2, H]`.
- `apcaContrast` is an APCA variant on LCH lightness (not luminance); `sufficientContrastForText` uses threshold 38.
- `adjust` adds and `adjustTo` replaces; both clamp L 0..100, C 0..132, H 0..360, A 0..1.

## Scaling

```
isLight     = base.L > 50
isPureLight = isLight && base.L > 97 && base.C < 8
softened    = min(contrast, 30) + max(contrast − 30, 0)·0.25

surface(c, Δ) = adjust(c, Δ · (isLight ? −1 : 1)·softened/30)              # backgrounds
control(c, Δ) = adjust(c, Δ · (isLight ? −0.8 : 1)·softened/70)            # buttons
border(c, Δ)  = adjust(c, {…Δ, l, c} · (isLight ? −0.9 : 0.8)·(contrast + max(contrast − 30, 0)·0.4)/10)
text(c, Δ, o) = adjustTo(adjust(getTextColor(c), {…Δ, l: Δ.l · (isLight ? −1 : 1)·(3 + (100 − contrast)/70)/4}), o)
alphaBoost    = max(1, 1 + max(contrast − 30, 0) / (isLight ? 50 : 10))
textLScale    = (1 + |base.L − 50|/50) / 2
```

The sign flip means one delta works in both modes: positive deltas move away from the base. Above contrast 30, surfaces and controls spread at a quarter of the rate, while borders spread faster.

## Tokens

Deltas are written as `light | dark`.

| Token                                                                       | Derivation                                                                                                  |
| --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `bgBase`                                                                    | `base`                                                                                                      |
| `bgBaseHover`                                                               | `surface(base, {l:3.5} \| {l:4.25,c:.5})`                                                                   |
| `bgSub` / `Hover`                                                           | `surface(base, {l:3.5} \| {l:−3.25,c:0})`, then `+{l:5} \| {l:2.5,c:3}`                                     |
| `bgShade` / `Hover`                                                         | `surface(base, {l:5.5} \| {l:2,c:.5})`, then `+{l:1.5} \| {l:1,c:.5}`                                       |
| `bgFocus`                                                                   | `surface(base, {l:5} \| {l:9,c:.5})`                                                                        |
| `bgSelected` / `Hover`                                                      | `mix(base, accent, (1 + base.C/30)·(.18 \| .05))`, then `surface +{l:2} \| {l:2.5,c:2}`                     |
| `bgSelectedBorder` / `Hover`                                                | `border(bgSelected, {l:3.5\|4.5, c:1})`                                                                     |
| `bgModalOverlay`                                                            | black @ `clamp((.25 \| .4)·alphaBoost, 0, .8)`                                                              |
| `bgBorder` / `Hover` / `Thin`                                               | `border(base, l: 3.5/4.5/3 \| 4/5/6)`                                                                       |
| `bgBorderFaint` / `Hover` / `Thin`                                          | `border(base, l: 1/2/3 \| 2/2.75/3.5)`                                                                      |
| `bgBorderSolid` / `Hover` / `Thin`                                          | `border(base, l: 5/9/5 \| 5/7/10)`                                                                          |
| `bgBorderStrong` / `Hover` / `Thin`                                         | `border(base, l: 17/21/17 \| 20/24/26)`                                                                     |
| `bgBorder*Alpha*`                                                           | each border as black (light) or white (dark) at the alpha that reproduces it over `base`                    |
| `labelTitle`                                                                | `text(base, {l: −10·textLScale \| 10}, {c:0})`                                                              |
| `labelBase` / `Muted` / `Faint`                                             | `text(base, {l: (−20 \| −10)/−40/−66 · textLScale, c:1})`                                                   |
| `labelLink`                                                                 | `text(base, {l: −45·textLScale}, {h: accent.H, c: 70})`                                                     |
| `label{Title,Base,Muted}Hover`                                              | step `(30 \| 15)·(1 + max(contrast−30,0)/70)·                                                               | L − base.L | /100` away from base; flips near L=100 |
| `controlPrimary` / `Hover` / `Label`                                        | `accent`; `surface +{l:6\|5, c:2}`; `text(accent, {}, {c: min(5, accent.C)})`                               |
| `controlSecondary` / `Hover` / `Selected`                                   | `control(base, {l:−6} \| {l:12,c:.75})`; `+{l:12,c:1}`; `+{l:15,c:1} \| {l:22,c:1}`                         |
| `controlTertiary` / `Hover` / `Selected`                                    | `control(base, l: −6/9/13 \| 12/22/29)`                                                                     |
| `control*Label`                                                             | `labelBase`                                                                                                 |
| `focusColor`                                                                | parent's focus, else `accent`; non-vivid → `adjustTo {l:70,c:90} \| {l:50,c:120}`, hue → purple when C < 20 |
| `sidebarLinkBg` / `Active`                                                  | `surface(base, {l:2.8\|4.9} \| {l:6.5\|12.5, c:1})`                                                         |
| `chromeTab*`, `scrollbar*`, `scrollBackground`, `shadowColor`, `githubLogo` | see `theme-generator.ts`                                                                                    |

`*Thin` borders only get their own step on 2x displays (`isHighDensityDisplay`); otherwise they equal the regular border. On the server the flag is always false.

## Status colors

The anchors are fixed and ignore the accent: purple `[48,59.31,288.43]`, blue `[80,70,267]`, teal `[67.5,45,210]`, green `[68|60,64.37,141.95]`, yellow `[80,90,85]`, orange `[66,80,48]`, red `[58,73,29]`.

```
<x>Base       = anchor
<x>BaseHover  = surface(anchor, {l:5});   <x>Mid = surface(anchor, {l:8})
<x>Bg         = findAccessibleColor(anchor, labelTitle) || anchor
<x>Text       = text(anchor, {}, {l: 50 | 80, c: 80})
<x>Foreground = getTextColor(<x>Bg)
<x>Tint       = mix(base, anchor, 0.2 | 0.03)
```

`findAccessibleColor` binary-searches L (step > 1) until it passes APCA 38 against `labelTitle`. If no L works, it retries at 75/50/25/0 % chroma, searching L between the anchor's L and 100.

## Nested themes

Each nested surface reruns `generateTheme` with a new base, so all its tokens are relative to that surface. Results are memoized per input hash in an unbounded cache.

| Method          | Base                                                               | Short-circuit                                                      |
| --------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `elevatedTheme` | `surface(base, {l: −8 \| 4.125, c: light && !pureLight ? 0 : .5})` | `elevation == −1` → parent                                         |
| `subTheme`      | `bgSub` (returns a shallow copy)                                   | `!pureLight && elevation == 1` → parent                            |
| `menuTheme`     | `surface(base, {l: −8 \| 8, c: same as elevated})`                 | nested (not base/elevated) → parent's menu                         |
| `selectedTheme` | `bgSelected`                                                       |                                                                    |
| `focusTheme`    | `bgFocus`                                                          |                                                                    |
| `sidebarTheme`  | `sidebarInput` theme, else `subTheme()`                            | then overrides `controlSecondary`, `Hover`, `controlTertiaryHover` |

## Known quirks

- **P3 parsing:** `fromCss('color(display-p3 r g b)')` runs the 0..1 channels through the 0..255 decoder, so P3 input parses near-black. P3 output is correct.
- **Shared mutation:** `sidebarTheme` writes into the generated theme's `color` object. Because `subTheme` copies only shallowly, the memoized sub-theme sees those overrides too.
- **Regex bug:** the `LCH`/`P3` alpha patterns use the character class `[1|0]`, which also matches `|`.

## Cache key

`hash` is key-sorted JSON: unordered objects, ordered arrays, and `baseTheme` replaced by its hash.
