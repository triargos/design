import {
  CalendarIcon,
  CheckSquareIcon,
  FolderIcon,
  HomeIcon,
  InboxIcon,
  MoreHorizontalIcon,
  PlusIcon,
  SettingsIcon,
  UsersIcon,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { BottomNav, BottomNavAction, BottomNavButton, BottomNavLink, BottomNavList } from '~/components/ui/bottom-nav';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

const TABS = [
  { label: 'Home', icon: <HomeIcon /> },
  { label: 'Inbox', icon: <InboxIcon />, count: 3 },
  { label: 'Tasks', icon: <CheckSquareIcon /> },
] as const;

const MORE = [
  { label: 'Calendar', icon: <CalendarIcon /> },
  { label: 'Projects', icon: <FolderIcon /> },
  { label: 'Members', icon: <UsersIcon /> },
  { label: 'Settings', icon: <SettingsIcon /> },
] as const;

/**
 * A phone frame: the nav floats over the scrolling panel, which keeps `pb-24` to clear it. Three tabs and "More", a
 * menu with the rest ("More" is current while its menu holds the page), and the main action at the end. `absolute
 * md:grid` keeps the nav in this frame at desktop width; an app leaves it `fixed` and hidden from `md` up.
 */
export function BottomNavDefault() {
  const [page, setPage] = useState('Tasks');
  const go = (label: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    setPage(label);
  };

  return (
    <div className='relative h-[640px] w-[375px] max-w-full overflow-hidden rounded-panel bg-background ring ring-border/50'>
      <div className='h-full overflow-y-auto px-5 pt-10 pb-24'>
        <div className='flex flex-col gap-page'>
          <h1 className='text-title text-balance'>{page}</h1>
          {['Due today', 'This week', 'Later'].map((title) => (
            <Card key={title}>
              <CardHeader>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent className='h-24' />
            </Card>
          ))}
        </div>
      </div>
      <BottomNav className='absolute md:grid'>
        <BottomNavList>
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
          <DropdownMenu>
            <DropdownMenuTrigger render={<BottomNavButton current={MORE.some((item) => item.label === page)} />}>
              <MoreHorizontalIcon />
              <span>More</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent side='top' align='center' sideOffset={8} className='w-48'>
              {MORE.map((item) => (
                <DropdownMenuItem key={item.label} render={<a href='#' />} onClick={go(item.label)}>
                  {item.icon}
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </BottomNavList>
        <BottomNavAction aria-label='New task'>
          <PlusIcon />
        </BottomNavAction>
      </BottomNav>
    </div>
  );
}
