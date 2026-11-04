import { IconChevronLeft } from '@tabler/icons-react';
import type { ReactNode } from 'react';

import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';

export type Screen = 'today' | 'absences' | 'messages' | 'documents' | 'family' | 'announcements' | 'announcement';
export type Sheet = 'report' | 'profile' | null;

export interface Navigation {
  readonly go: (screen: Screen) => void;
  readonly open: (sheet: Exclude<Sheet, null>) => void;
}

export const CHILDREN = [
  { id: 'lilli', name: 'Lilli', born: 'Born 25 May 2012' },
  { id: 'theo', name: 'Theo', born: 'Born 8 May 2014' },
] as const;

export const ANNOUNCEMENTS = [
  {
    id: 1,
    date: 'Thu, 1 Oct',
    dateLong: 'Thursday, 1 October',
    title: 'Parents’ evening',
    preview: 'The autumn parents’ evening is on 12 November from 18:00 in the hall.',
    unread: true,
    attachment: false,
  },
  {
    id: 2,
    date: 'Thu, 1 Oct',
    dateLong: 'Thursday, 1 October',
    title: 'Autumn holidays',
    preview: 'School closes on 23 October and reopens on 3 November.',
    unread: false,
    attachment: true,
  },
] as const;

/** The top of every tab: its actions and the profile on one row, the title below, inset to the cards' text. */
export function ScreenHeader({
  title,
  meta,
  actions,
  back,
  onProfile,
}: {
  title: string;
  meta?: string;
  actions?: ReactNode;
  back?: { label: string; onClick: () => void };
  onProfile?: () => void;
}) {
  return (
    <header className='flex flex-col gap-tight px-tight'>
      <div className='flex min-h-control-lg items-center gap-related'>
        {back ? (
          <Button emphasis='ghost' className='-ml-related' onClick={back.onClick}>
            <IconChevronLeft data-icon='inline-start' />
            {back.label}
          </Button>
        ) : (
          meta && <p className='text-caption font-medium text-muted-foreground'>{meta}</p>
        )}
        <div className='ml-auto flex items-center gap-related'>
          {actions}
          {onProfile && (
            <Button emphasis='ghost' size='icon-lg' className='rounded-full' aria-label='Profile' onClick={onProfile}>
              <Avatar size='3xl'>
                <AvatarFallback>TZ</AvatarFallback>
              </Avatar>
            </Button>
          )}
        </div>
      </div>
      <h1 className='text-title text-balance'>{title}</h1>
    </header>
  );
}

/** A round header action: the solid ink circle the parent app uses for "new". */
export function HeaderAction({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      size='icon-lg'
      intent='neutral'
      emphasis='solid'
      className='rounded-full'
      aria-label={label}
      onClick={onClick}>
      {children}
    </Button>
  );
}

/** A quiet label above a list (a month, "Current"), inset to the rows' text. */
export function ListLabel({ children }: { children: ReactNode }) {
  return <h2 className='px-row-pad-x text-caption font-medium text-muted-foreground'>{children}</h2>;
}

/** Each tab scrolls on its own, clear of the status bar and the floating nav. */
export function ScreenScroll({ children }: { children: ReactNode }) {
  return (
    <div className='h-full overflow-y-auto px-group pt-12 pb-32'>
      <div className='flex flex-col gap-group'>{children}</div>
    </div>
  );
}
