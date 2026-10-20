import * as React from 'react';
import { I18nProvider } from 'react-aria-components/I18nProvider';

/** The labels of the components' own controls: what a screen reader hears for a ✕, a stepper button, a slot. */
interface Labels {
  /** Dialog and Sheet ✕. */
  readonly close: string;
  /** Combobox clear button. */
  readonly clear: string;
  /** Combobox trigger. */
  readonly openList: string;
  /** Combobox chip ✕. */
  readonly remove: string;
  /** Select and Combobox: the row for text outside the list. */
  readonly custom: string;
  /** Combobox: the row that takes the typed text. */
  readonly useCustom: (text: React.ReactNode) => React.ReactNode;
  /** DateInput calendar button. */
  readonly chooseDate: string;
  /** IntegerInput buttons. */
  readonly decrease: string;
  readonly increase: string;
  /** CopyButton, before and after a copy. */
  readonly copy: string;
  readonly copied: string;
  /** ShortcutTooltip: between the keys of a chord, “G then P”. */
  readonly shortcutThen: string;
  /** ItemList (virtualized) while the next page loads. */
  readonly loadingMore: string;
  /** InputOTP slot. */
  readonly slot: (slot: { readonly position: number; readonly length: number }) => string;
  /** ColorPicker group, custom swatch, hex field. */
  readonly color: string;
  readonly customColor: string;
  readonly hexColor: string;
  /** Landmarks and triggers. */
  readonly breadcrumb: string;
  readonly pageTabs: string;
  readonly sidebar: string;
  readonly toggleSidebar: string;
  readonly mainNavigation: string;
  readonly more: string;
  /** SortableItemHandle. */
  readonly dragToReorder: string;
}

const englishLabels: Labels = {
  close: 'Close',
  clear: 'Clear',
  openList: 'Open list',
  remove: 'Remove',
  custom: 'Other',
  useCustom: (text) => <>Use “{text}”</>,
  chooseDate: 'Choose date',
  decrease: 'Decrease',
  increase: 'Increase',
  copy: 'Copy',
  copied: 'Copied',
  shortcutThen: 'then',
  loadingMore: 'Loading more',
  slot: ({ position, length }) => `Character ${position} of ${length}`,
  color: 'Color',
  customColor: 'Custom color',
  hexColor: 'Hex color',
  breadcrumb: 'Breadcrumb',
  pageTabs: 'Page tabs',
  sidebar: 'Sidebar',
  toggleSidebar: 'Toggle sidebar',
  mainNavigation: 'Main',
  more: 'More',
  dragToReorder: 'Drag to reorder',
};

interface LocaleContextValue {
  /** BCP 47; formats dates, numbers and the date segments. */
  readonly locale: string;
  /** IANA; the zone a moment is shown in. Unset: the runtime's. */
  readonly timeZone: string | undefined;
  readonly labels: Labels;
}

// `en-US` without a provider, so a prerender and its hydration agree.
const LocaleContext = React.createContext<LocaleContextValue>({
  locale: 'en-US',
  timeZone: undefined,
  labels: englishLabels,
});

/**
 * The locale, time zone and control labels for every component below it; one at the app's root. A component's own prop
 * (`locale`, `closeLabel`, …) still wins. `labels` merges over the English defaults, so an app passes all of them for
 * a full translation. React Aria parts (date segments, calendar) follow `locale` too.
 */
function LocaleProvider({
  locale = 'en-US',
  timeZone,
  labels,
  children,
}: {
  readonly locale?: string;
  readonly timeZone?: string;
  readonly labels?: Partial<Labels>;
  readonly children: React.ReactNode;
}) {
  const value = React.useMemo(
    () => ({ locale, timeZone, labels: { ...englishLabels, ...labels } }),
    [locale, timeZone, labels],
  );
  return (
    <LocaleContext value={value}>
      <I18nProvider locale={locale}>{children}</I18nProvider>
    </LocaleContext>
  );
}

/** The nearest `LocaleProvider`'s values, or `en-US`, the runtime's zone and English labels. */
function useLocale(): LocaleContextValue {
  return React.use(LocaleContext);
}

export { LocaleProvider, useLocale, type Labels };
