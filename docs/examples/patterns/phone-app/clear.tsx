import { SIZING_STYLES, sizingThemeAttributes, sizingThemeCss } from '~/lib/theme/sizing';

import { AbsencesScreen } from './absences';

/**
 * The `clear` sizing style on one subtree: 40px pill controls, 16px cards and sheets, titles 30 / 650 in the sans. Its
 * attributes (`data-card-style='plain'`) go on the same element. An app sets both on `:root` and `<html>`.
 */
export function PhoneAppClear() {
  return (
    <div data-sizing='phone-clear' {...sizingThemeAttributes(SIZING_STYLES.clear)} className='flex justify-center'>
      <style>{sizingThemeCss(SIZING_STYLES.clear, '[data-sizing=phone-clear]')}</style>
      <AbsencesScreen />
    </div>
  );
}
