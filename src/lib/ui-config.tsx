import { createContext, use, useMemo, type ReactNode } from 'react';

/**
 * The strings components render on their own (labels, empty states, screen-reader text). German by default; an app
 * passes its translations through `UiConfigProvider`.
 */
export interface UiStrings {
  readonly copy: string;
  readonly copied: string;
  readonly clear: string;
  readonly search: string;
  readonly emptyValue: string;
  readonly chooseDate: string;
  readonly unsavedChanges: string;
  readonly pageTabs: string;
  readonly decrease: string;
  readonly increase: string;
  readonly selectPlaceholder: string;
  readonly selectPending: string;
  readonly selectEmpty: string;
  readonly selectOpen: string;
  readonly selectClear: string;
  /** The value an `OptionSelect` shows once "other" is chosen. */
  readonly selectOther: string;
  /** The "other" row in an `OptionSelect` list. */
  readonly selectOtherOption: string;
  readonly selectOtherLabel: string;
  readonly selectOtherPlaceholder: string;
  /** Marks a `SearchSelect` value typed by the user, not picked from the list. */
  readonly selectCustom: string;
  readonly selectCustomNote: string;
  /** The verb after the quoted typed text in a `SearchSelect` row: „Tante“ übernehmen. */
  readonly selectUseCustom: string;
  /** An `OTPField` slot's accessible name. */
  readonly otpSlot: (values: { readonly position: number; readonly length: number }) => string;
  /** Between the keys of a chord shortcut: `G dann S`. */
  readonly chordSeparator: string;
  readonly colorPicker: {
    readonly label: string;
    readonly custom: string;
    readonly customValue: (value: string) => string;
    readonly hex: string;
    readonly colors: Readonly<Record<string, string>>;
  };
}

/** What components read from the app instead of importing it: locale, time zone, strings and form messages. */
export interface UiConfig {
  /** BCP 47 locale for dates and numbers. */
  readonly locale: string;
  /** IANA zone `IntlDate` renders instants in. */
  readonly timeZone: string;
  readonly strings: UiStrings;
  /** Turns a `FieldError` message into text; an app with i18n passes its `t`. Default: the message as is. */
  readonly message: (message: string) => string;
}

export const UI_STRINGS_DE: UiStrings = {
  copy: 'Kopieren',
  copied: 'Kopiert',
  clear: 'Leeren',
  search: 'Suchen...',
  emptyValue: 'Kein Wert',
  chooseDate: 'Datum wählen',
  unsavedChanges: 'Ungespeicherte Änderungen',
  pageTabs: 'Seitenbereiche',
  decrease: 'Verringern',
  increase: 'Erhöhen',
  selectPlaceholder: 'Auswählen...',
  selectPending: 'Elemente werden geladen...',
  selectEmpty: 'Keine Elemente gefunden',
  selectOpen: 'Liste öffnen',
  selectClear: 'Auswahl löschen',
  selectOther: 'Andere',
  selectOtherOption: 'Andere angeben …',
  selectOtherLabel: 'Andere Angabe',
  selectOtherPlaceholder: 'Bitte angeben',
  selectCustom: 'Eigene Angabe',
  selectCustomNote: 'Eigene Angabe, nicht aus der Liste',
  selectUseCustom: 'übernehmen',
  otpSlot: ({ position, length }) => `Stelle ${position} von ${length}`,
  chordSeparator: 'dann',
  colorPicker: {
    label: 'Farbe',
    custom: 'Eigene Farbe',
    customValue: (value) => `Eigene Farbe: ${value}`,
    hex: 'Hex-Code',
    colors: {
      gray: 'Grau',
      red: 'Rot',
      orange: 'Orange',
      amber: 'Bernstein',
      yellow: 'Gelb',
      green: 'Grün',
      teal: 'Petrol',
      cyan: 'Cyan',
      blue: 'Blau',
      indigo: 'Indigo',
      violet: 'Violett',
      pink: 'Pink',
    },
  },
};

export const DEFAULT_UI_CONFIG: UiConfig = {
  locale: 'de',
  timeZone: 'Europe/Berlin',
  strings: UI_STRINGS_DE,
  message: (message) => message,
};

const UiConfigContext = createContext<UiConfig>(DEFAULT_UI_CONFIG);

/** Overrides any part of the config; the rest stays at `DEFAULT_UI_CONFIG`. */
export function UiConfigProvider({
  locale,
  timeZone,
  strings,
  message,
  children,
}: Partial<Omit<UiConfig, 'strings'>> & { strings?: Partial<UiStrings>; children: ReactNode }) {
  const value = useMemo<UiConfig>(
    () => ({
      locale: locale ?? DEFAULT_UI_CONFIG.locale,
      timeZone: timeZone ?? DEFAULT_UI_CONFIG.timeZone,
      strings: { ...UI_STRINGS_DE, ...strings },
      message: message ?? DEFAULT_UI_CONFIG.message,
    }),
    [locale, timeZone, strings, message],
  );
  return <UiConfigContext value={value}>{children}</UiConfigContext>;
}

export const useUiConfig = (): UiConfig => use(UiConfigContext);

export const useUiStrings = (): UiStrings => useUiConfig().strings;
