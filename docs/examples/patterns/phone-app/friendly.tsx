import { SIZING_STYLES, sizingThemeCss } from '~/lib/theme/sizing';

import { AbsencesScreen } from './absences';

/**
 * The `friendly` sizing style with a display face: 22px cards, a 24px lead card, titles 32 / 720 and headings 19 / 700
 * in Bricolage Grotesque through `--font-display`. The rest stays Inter. An app sets both on `:root`.
 */
export function PhoneAppFriendly() {
  return (
    <div data-sizing='phone-friendly' className='flex justify-center'>
      <style>
        {sizingThemeCss(SIZING_STYLES.friendly, '[data-sizing=phone-friendly]')}
        {`[data-sizing=phone-friendly]{--font-display:'Bricolage Grotesque',sans-serif;}`}
      </style>
      <AbsencesScreen />
    </div>
  );
}
