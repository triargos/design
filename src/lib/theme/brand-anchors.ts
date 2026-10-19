import type {
  OrganizationBrandingBaseColor,
  OrganizationBrandingDestructiveColor,
  OrganizationBrandingPrimaryColor,
} from '@elternportal/domain/organization-branding';

import type { Color } from './color';

export type BrandColor =
  | OrganizationBrandingBaseColor
  | OrganizationBrandingPrimaryColor
  | OrganizationBrandingDestructiveColor;

/**
 * The LCH (D50) anchor of each stored brand color name, converted from Tailwind 4.3's `oklch()` noted per entry.
 * Chromatic names are step 600 (Tailwind's button fill; the anchor is `controlPrimary`); grays are step 500, of
 * which only chroma and hue reach the theme.
 */
export const BRAND_ANCHORS: Record<BrandColor, Color> = {
  neutral: [48.5, 0, 0], // oklch(55.6% 0 none)
  zinc: [47.89, 6.01, 286], // oklch(55.2% 0.016 285.938)
  gray: [47.78, 10.03, 267.75], // oklch(55.1% 0.027 264.364)
  slate: [48.09, 16.71, 263], // oklch(55.4% 0.046 257.417)
  stone: [48.12, 4.88, 61.09], // oklch(55.3% 0.013 58.071)
  taupe: [47.33, 7.68, 46.8], // oklch(54.7% 0.021 43.1)
  mauve: [46.41, 12.02, 320.27], // oklch(54.2% 0.034 322.5)
  mist: [49.11, 7.29, 217.27], // oklch(56% 0.021 213.5)
  olive: [51.53, 11.89, 103.95], // oklch(58% 0.031 107.3)
  red: [48.45, 98.91, 38.48], // oklch(57.7% 0.245 27.325)
  orange: [57.1, 110.49, 54.44], // oklch(64.6% 0.222 41.116)
  amber: [60.35, 96.1, 65.03], // oklch(66.6% 0.179 58.318)
  yellow: [62.78, 89.02, 75.41], // oklch(68.1% 0.162 75.834)
  lime: [61.11, 83.87, 119.28], // oklch(64.8% 0.2 131.684)
  green: [59.1, 71.72, 144.88], // oklch(62.7% 0.194 149.214)
  emerald: [55.05, 52.4, 162.3], // oklch(59.6% 0.145 163.225)
  teal: [55.02, 41.26, 185.43], // oklch(60% 0.118 184.704)
  cyan: [55.18, 40.58, 228.76], // oklch(60.9% 0.126 221.723)
  sky: [51.78, 51.14, 257.04], // oklch(58.8% 0.158 241.966)
  blue: [44.06, 90.8, 288.64], // oklch(54.6% 0.245 262.881)
  indigo: [38.4, 106.32, 299.66], // oklch(51.1% 0.262 276.966)
  violet: [41.09, 114.99, 306.87], // oklch(54.1% 0.281 293.009)
  purple: [43.03, 114.68, 310.98], // oklch(55.8% 0.288 302.321)
  fuchsia: [47.51, 104.56, 322.93], // oklch(59.1% 0.293 322.896)
  pink: [49.55, 79.87, 1.66], // oklch(59.2% 0.249 0.584)
  rose: [49.19, 89.18, 23.83], // oklch(58.6% 0.253 17.585)
};
