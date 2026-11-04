import { IconCalendarOff, IconFolder, IconId, IconMail } from '@tabler/icons-react';
import { useState } from 'react';

import { BottomNav, BottomNavLink, BottomNavList } from '~/components/ui/bottom-nav';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

const TABS = [
  { label: 'Inbox', icon: <IconMail /> },
  { label: 'Absences', icon: <IconCalendarOff /> },
  { label: 'Family', icon: <IconId /> },
  { label: 'Documents', icon: <IconFolder /> },
] as const;

/**
 * `labels='current'`: only the current tab shows its label, on a solid pill the others' icons slide around.
 * `inverse` puts the bar on the inverted surface, dark on a light page.
 */
export function BottomNavCurrentLabel() {
  const [page, setPage] = useState('Absences');
  const go = (label: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    setPage(label);
  };

  return (
    <div className='relative h-[640px] w-[390px] max-w-full overflow-hidden rounded-panel bg-background ring ring-border/50'>
      <div className='h-full overflow-y-auto px-4 pt-6 pb-28'>
        <div className='flex flex-col gap-6'>
          <h1 className='px-tight text-title text-balance'>{page}</h1>
          {['This week', 'Earlier'].map((title) => (
            <Card key={title}>
              <CardHeader>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent className='h-32' />
            </Card>
          ))}
        </div>
      </div>
      <BottomNav className='absolute md:grid'>
        <BottomNavList labels='current' inverse>
          {TABS.map((tab) => (
            <BottomNavLink key={tab.label} href='#' current={page === tab.label} onClick={go(tab.label)}>
              {tab.icon}
              <span>{tab.label}</span>
            </BottomNavLink>
          ))}
        </BottomNavList>
      </BottomNav>
    </div>
  );
}
