import { IconCalendarOff, IconFolder, IconId, IconMail, IconSpeakerphone } from '@tabler/icons-react';
import { useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { BottomNav, BottomNavLink, BottomNavList, BottomNavMore, BottomNavMoreItem } from '~/components/ui/bottom-nav';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

const TABS = [
  { label: 'Inbox', icon: <IconMail />, count: 2 },
  { label: 'Family', icon: <IconId /> },
  { label: 'Documents', icon: <IconFolder /> },
] as const;

const MORE = [
  { label: 'Announcements', icon: <IconSpeakerphone /> },
  { label: 'Absences', icon: <IconCalendarOff /> },
] as const;

/**
 * `labels`: the label under each icon, a fill that springs to the tab. For an audience that does not
 * know the icons. Four tabs shrink to fit a phone.
 */
export function BottomNavLabels() {
  const [page, setPage] = useState('Inbox');
  const go = (label: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    setPage(label);
  };

  return (
    <div className='relative h-[640px] w-[390px] max-w-full overflow-hidden rounded-panel bg-background ring ring-border/50'>
      <div className='h-full overflow-y-auto px-4 pt-6 pb-36'>
        <div className='flex flex-col gap-6'>
          <h1 className='px-tight text-title text-balance'>{page}</h1>
          {['Messages', 'Earlier'].map((title) => (
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
        <BottomNavList labels>
          {TABS.map((tab) => (
            <BottomNavLink key={tab.label} href='#' current={page === tab.label} onClick={go(tab.label)}>
              {tab.icon}
              <span>{tab.label}</span>
              {'count' in tab && (
                <Badge size='sm' shape='pill' intent='primary' emphasis='solid'>
                  {tab.count}
                </Badge>
              )}
            </BottomNavLink>
          ))}
          <BottomNavMore>
            {MORE.map((item) => (
              <BottomNavMoreItem key={item.label} href='#' current={page === item.label} onClick={go(item.label)}>
                {item.icon}
                <span>{item.label}</span>
              </BottomNavMoreItem>
            ))}
          </BottomNavMore>
        </BottomNavList>
      </BottomNav>
    </div>
  );
}
