import { SIZING_STYLES, sizingThemeCss } from '~/lib/theme/sizing';

import { AbsencesScreen } from './absences';

/**
 * The `clear` sizing style on one subtree: 40px pill controls, 16px cards and sheets, titles 30 / 650 in the sans. An
 * app sets it on `:root` instead: `sizingThemeCss(SIZING_STYLES.clear)`.
 */
export function PhoneAppClear() {
  return (
    <div data-sizing='phone-clear' className='flex justify-center'>
      <style>{sizingThemeCss(SIZING_STYLES.clear, '[data-sizing=phone-clear]')}</style>
      <AbsencesScreen />
    </div>
  );
}
