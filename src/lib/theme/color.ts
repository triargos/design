/**
 * The color math `generateTheme` and the branding use, based on Linear's color converter.
 *
 * Colors are CIE LCH tuples `[L, C, H, A?]` against the D50 white point (CSS `lch()`).
 * Conversions run LCH → Lab → XYZ(D50) → Bradford D50→D65 → linear sRGB / Display-P3 → gamma.
 */

export type Color = [L: number, C: number, H: number, A?: number];
export type ColorFormat = 'LCH' | 'P3' | 'RGB';
export type ColorAdjustment = Partial<{ l: number; c: number; h: number; a: number }>;

type Vec3 = [number, number, number];
type Matrix3 = [Vec3, Vec3, Vec3];

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const round3 = (value: number) => parseFloat(value.toFixed(3));

const HEX_REGEX_LOOSE = /#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?/i;
const HEX_REGEX = RegExp(`^${HEX_REGEX_LOOSE.source}$`, 'i');
const HEX_REGEX_SMALL_LOOSE = /#?([a-f\d])([a-f\d])([a-f\d])/i;
const HEX_REGEX_SMALL = RegExp(`^${HEX_REGEX_SMALL_LOOSE.source}$`, 'i');
const LCH_REGEX_LOOSE =
  /lch\((\d{1,3}(?:\.\d+)?)\% (\d{1,3}(?:\.\d+)?) (\d{1,3}(?:\.\d+)?)(?: \/ ([1|0](?:\.\d+)?)?)?\)/i;
const LCH_REGEX = RegExp(`^${LCH_REGEX_LOOSE.source}$`, 'i');
const P3_REGEX_LOOSE =
  /color\(display-p3 (\d{1,3}(?:\.\d+)?)\ (\d{1,3}(?:\.\d+)?) (\d{1,3}(?:\.\d+)?)(?: \/ ([1|0](?:\.\d+)?)?)?\)/i;
const P3_REGEX = RegExp(`^${P3_REGEX_LOOSE.source}$`, 'i');
const ANY_COLOR_REGEX_LOOSE = RegExp(
  `(?:${HEX_REGEX_LOOSE.source})|(?:${LCH_REGEX_LOOSE.source})|(?:${P3_REGEX_LOOSE.source})`,
  'i',
);
export const ANY_COLOR_REGEX = RegExp(`^${ANY_COLOR_REGEX_LOOSE.source}$`, 'i');

const D50: Vec3 = [0.3457 / 0.3585, 1, 0.2958 / 0.3585];

export function toCss(format: ColorFormat, [l, c, h, a]: Color): string {
  return format === 'LCH'
    ? `lch(${round3(l)}% ${round3(c)} ${round3(h)}${a === undefined ? '' : ' / ' + round3(a)})`
    : format === 'P3'
      ? lchToP3String([l, c, h, a])
      : lchToRgbString([l, c, h, a]);
}

export function fromCss(css: string): Color {
  let hex = HEX_REGEX.exec(css);
  if (hex === null) {
    hex = HEX_REGEX_SMALL.exec(css);
    if (hex) {
      hex[1] += hex[1];
      hex[2] += hex[2];
      hex[3] += hex[3];
    }
  }
  if (hex) {
    const color = rgbToLch([parseInt(hex[1], 16), parseInt(hex[2], 16), parseInt(hex[3], 16)]);
    if (hex[4] && !/ff/i.test(hex[4])) color[3] = parseInt(hex[4], 16) / 255;
    return color;
  }
  const lch = LCH_REGEX.exec(css);
  if (lch) {
    const color: Color = [parseFloat(lch[1]), parseFloat(lch[2]), parseFloat(lch[3])];
    if (lch[4] && lch[4] !== '1') color[3] = parseFloat(lch[4]);
    return color;
  }
  const p3 = P3_REGEX.exec(css);
  if (p3) {
    const color = p3ToLch([parseFloat(p3[1]), parseFloat(p3[2]), parseFloat(p3[3])]);
    if (p3[4] && p3[4] !== '1') color[3] = parseFloat(p3[4]);
    return color;
  }
  return [0, 0, 0];
}

/** Saturated colors read lighter, so `C * 0.075` is subtracted before the cutoff. */
export function getTextColor([l, c, h]: Color): Color {
  return [l - c * 0.075 > 65 ? 0 : 100, Math.min(c / 2, c), h];
}

const APCA_BLACK_THRESHOLD = 0.022;
const APCA_BLACK_CLAMP = 1.414;

function apcaSoftClamp(y: number): number {
  return y >= APCA_BLACK_THRESHOLD ? y : y + (APCA_BLACK_THRESHOLD - y) ** APCA_BLACK_CLAMP;
}

/** APCA-like contrast in 0..100+ on LCH lightness, not a WCAG ratio. */
function apcaContrast(text: Color, background: Color): number {
  const offset = 0.027;
  const textY = apcaSoftClamp(text[0] / 100);
  const backgroundY = apcaSoftClamp(background[0] / 100);
  const backgroundIsBrighter = backgroundY > textY;
  let raw: number;
  if (Math.abs(backgroundY - textY) < 5e-4) raw = 0;
  else if (backgroundIsBrighter) raw = (backgroundY ** 0.56 - textY ** 0.57) * 1.14;
  else raw = (backgroundY ** 0.65 - textY ** 0.62) * 1.14;
  const output = Math.abs(raw) < 0.1 ? 0 : raw > 0 ? raw - offset : raw + offset;
  return Math.abs(output * 100);
}

export function sufficientContrastForText(text: Color, background: Color, threshold = 38): boolean {
  return apcaContrast(text, background) > threshold;
}

export function adjust(color: Color, delta: ColorAdjustment): Color {
  const [l, c, h, a = 1] = color;
  return [
    clamp(l + (delta.l ?? 0), 0, 100),
    clamp(c + (delta.c ?? 0), 0, 132),
    clamp(h + (delta.h ?? 0), 0, 360),
    clamp(a + (delta.a ?? 0), 0, 1),
  ];
}

export function adjustTo(color: Color, override: ColorAdjustment): Color {
  const [l, c, h, a = 1] = color;
  return [
    clamp(override.l ?? l, 0, 100),
    clamp(override.c ?? c, 0, 132),
    clamp(override.h ?? h, 0, 360),
    clamp(override.a ?? a, 0, 1),
  ];
}

/** Interpolates in XYZ (D50), not in polar LCH. */
export function mix(from: Color, to: Color, amount: number): Color {
  const fromAlpha = from[3] ?? 1;
  const toAlpha = to[3] ?? 1;
  const [x1, y1, z1] = labToXyz(lchToLab(from));
  const [x2, y2, z2] = labToXyz(lchToLab(to));
  const [l, c, h] = labToLch(
    xyzToLab([x1 * (1 - amount) + amount * x2, y1 * (1 - amount) + amount * y2, z1 * (1 - amount) + amount * z2]),
  );
  return [clamp(l, 0, 100), clamp(c, 0, 132), clamp(h, 0, 360), fromAlpha * (1 - amount) + toAlpha * amount];
}

function lchToRgbString(color: Color): string {
  const [r, g, b] = lchToRgb(color)
    .map((channel) => channel.toString(16).split('.')[0])
    .map((channel) => (channel.length === 1 ? '0' + channel : channel));
  const alpha = color[3] !== undefined && color[3] !== 1 ? padHex((color[3] * 255).toString(16).split('.')[0]) : '';
  return `#${r}${g}${b}${alpha}`;
}

function padHex(value: string): string {
  return value.length === 1 ? '0' + value : value;
}

function lchToP3String(color: Color): string {
  const [r, g, b] = lchToP3(color);
  return `color(display-p3 ${r} ${g} ${b}${color[3] === undefined ? '' : ` / ${color[3].toString(10)}`})`;
}

function lchToP3(color: Color): Vec3 {
  return xyzD65ToLinearP3(bradfordD50ToD65(labToXyz(lchToLab(color))))
    .map((channel) => srgbTransfer(channel))
    .map((channel) => clamp(channel, 0, 1)) as Vec3;
}

function rgbToLch(rgb: Vec3): Color {
  return labToLch(xyzToLab(bradfordD65ToD50(linearSrgbToXyzD65(srgbLinear(rgb)))));
}

/** 0..255 channels, not rounded. */
function lchToRgb(color: Color): Vec3 {
  return labToRgb(lchToLab(color));
}

function p3ToLch(p3: Vec3): Color {
  return labToLch(xyzToLab(bradfordD65ToD50(linearP3ToXyzD65(srgbLinear(p3)))));
}

function multiplyMatrix([[a, b, c], [d, e, f], [g, h, i]]: Matrix3, [x, y, z]: Vec3): Vec3 {
  return [a * x + b * y + c * z, d * x + e * y + f * z, g * x + h * y + i * z];
}

function labToRgb(lab: Vec3): Vec3 {
  // Lab white maps to exact 255s, avoiding rounding drift.
  return lab[0] === 100 && lab[1] === 0 && lab[2] === 0
    ? [255, 255, 255]
    : (srgbGamma(xyzD65ToLinearSrgb(bradfordD50ToD65(labToXyz(lab)))).map((channel) => clamp(channel, 0, 255)) as Vec3);
}

function srgbTransfer(value: number): number {
  const sign = value < 0 ? -1 : 1;
  const magnitude = Math.abs(value);
  return magnitude > 0.0031308 ? sign * (1.055 * magnitude ** (1 / 2.4) - 0.055) : 12.92 * value;
}

/** Linear 0..1 → gamma-encoded 0..255. */
function srgbGamma(rgb: Vec3): Vec3 {
  return rgb.map((channel) => 255 * srgbTransfer(channel)) as Vec3;
}

function linearSrgbToXyzD65(rgb: Vec3): Vec3 {
  return multiplyMatrix(
    [
      [0.41239079926595934, 0.357584339383878, 0.1804807884018343],
      [0.21263900587151027, 0.715168678767756, 0.07219231536073371],
      [0.01933081871559182, 0.11919477979462598, 0.9505321522496607],
    ],
    rgb,
  );
}

function linearP3ToXyzD65(rgb: Vec3): Vec3 {
  return multiplyMatrix(
    [
      [0.4865709486482162, 0.26566769316909306, 0.1982172852343625],
      [0.2289745640697488, 0.6917385218365064, 0.079286914093745],
      [0, 0.04511338185890264, 1.043944368900976],
    ],
    rgb,
  );
}

function xyzD65ToLinearSrgb(xyz: Vec3): Vec3 {
  return multiplyMatrix(
    [
      [3.2409699419045226, -1.537383177570094, -0.4986107602930034],
      [-0.9692436362808796, 1.8759675015077202, 0.04155505740717559],
      [0.05563007969699366, -0.20397695888897652, 1.0569715142428786],
    ],
    xyz,
  );
}

function xyzD65ToLinearP3(xyz: Vec3): Vec3 {
  return multiplyMatrix(
    [
      [2.493496911941425, -0.9313836179191239, -0.40271078445071684],
      [-0.8294889695615747, 1.7626640603183463, 0.023624685841943577],
      [0.03584583024378447, -0.07617238926804182, 0.9568845240076872],
    ],
    xyz,
  );
}

function bradfordD50ToD65(xyz: Vec3): Vec3 {
  return multiplyMatrix(
    [
      [0.9554734527042182, -0.023098536874261423, 0.0632593086610217],
      [-0.028369706963208136, 1.0099954580058226, 0.021041398966943008],
      [0.012314001688319899, -0.020507696433477912, 1.3303659366080753],
    ],
    xyz,
  );
}

function bradfordD65ToD50(xyz: Vec3): Vec3 {
  return multiplyMatrix(
    [
      [1.0479298208405488, 0.022946793341019088, -0.05019222954313557],
      [0.029627815688159344, 0.990434484573249, -0.01707382502938514],
      [-0.009243058152591178, 0.015055144896577895, 0.7518742899580008],
    ],
    xyz,
  );
}

function xyzToLab(xyz: Vec3): Vec3 {
  const f = xyz
    .map((value, index) => value / D50[index])
    .map((value) => (value > 0.008856451679035631 ? Math.cbrt(value) : (903.2962962962963 * value + 16) / 116));
  return [116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])];
}

function labToXyz(lab: Vec3): Vec3 {
  const kappa = 24389 / 27;
  const epsilon = 216 / 24389;
  const fy = (lab[0] + 16) / 116;
  const fx = lab[1] / 500 + fy;
  const fz = fy - lab[2] / 200;
  return [
    fx ** 3 > epsilon ? fx ** 3 : (116 * fx - 16) / kappa,
    lab[0] > kappa * epsilon ? ((lab[0] + 16) / 116) ** 3 : lab[0] / kappa,
    fz ** 3 > epsilon ? fz ** 3 : (116 * fz - 16) / kappa,
  ].map((value, index) => value * D50[index]) as Vec3;
}

function labToLch(lab: Vec3): Color {
  const hue = (Math.atan2(lab[2], lab[1]) * 180) / Math.PI;
  return [lab[0], Math.sqrt(lab[1] ** 2 + lab[2] ** 2), hue >= 0 ? hue : hue + 360, 1];
}

function lchToLab(color: Color): Vec3 {
  return [color[0], color[1] * Math.cos((color[2] * Math.PI) / 180), color[1] * Math.sin((color[2] * Math.PI) / 180)];
}

function srgbDecode(value: number): number {
  const sign = value < 0 ? -1 : 1;
  const magnitude = Math.abs(value);
  return magnitude < 0.04045 ? value / 12.92 : sign * ((magnitude + 0.055) / 1.055) ** 2.4;
}

/** Gamma-encoded 0..255 → linear 0..1. */
function srgbLinear(rgb: Vec3): Vec3 {
  return rgb.map((channel) => srgbDecode(channel / 255)) as Vec3;
}
