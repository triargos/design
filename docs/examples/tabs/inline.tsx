import { IconDeviceDesktop, IconMoon, IconSun } from '@tabler/icons-react';
import { useState } from 'react';

import { TabsRadio, TabsRadioGroup } from '~/components/ui/tabs';

/** `variant='inline'`: a compact round control inside a row; icon-only tabs carry an `aria-label`. */
export function TabsInline() {
  const [theme, setTheme] = useState('system');
  const [view, setView] = useState('forYou');
  return (
    <div className='flex w-full max-w-sm flex-col gap-group'>
      <div className='flex items-center justify-between gap-group'>
        <span id='tabs-inline-theme' className='text-control'>
          Appearance
        </span>
        <TabsRadioGroup variant='inline' aria-labelledby='tabs-inline-theme' value={theme} onValueChange={setTheme}>
          <TabsRadio value='light' aria-label='Light'>
            <IconSun />
          </TabsRadio>
          <TabsRadio value='dark' aria-label='Dark'>
            <IconMoon />
          </TabsRadio>
          <TabsRadio value='system' aria-label='System'>
            <IconDeviceDesktop />
          </TabsRadio>
        </TabsRadioGroup>
      </div>
      <TabsRadioGroup variant='inline' aria-label='Documents' value={view} onValueChange={setView} className='w-full'>
        <TabsRadio value='forYou' className='flex-1'>
          For you
        </TabsRadio>
        <TabsRadio value='uploads' className='flex-1'>
          My uploads
        </TabsRadio>
      </TabsRadioGroup>
    </div>
  );
}
