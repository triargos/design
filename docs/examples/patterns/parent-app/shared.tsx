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
  { id: 'lilli', name: 'Lilli' },
  { id: 'theo', name: 'Theo' },
] as const;

export type ChildId = (typeof CHILDREN)[number]['id'];

/**
 * Each child's color, as the mockup's "Klar" has it: on their avatar only, never on a card. A family's own labels, so
 * plain Tailwind hues rather than tokens (the one place this example uses raw colors; light mode only). `avatar` is the
 * initial on a soft fill, `solid` the strong fill for the picked child.
 */
export const CHILD_COLORS = {
  lilli: { avatar: 'bg-pink-100 text-pink-800', solid: 'bg-pink-600 text-white' },
  theo: { avatar: 'bg-teal-100 text-teal-800', solid: 'bg-teal-600 text-white' },
} as const satisfies Record<ChildId, Record<string, string>>;

export const childOf = (name: string): ChildId => (name.toLowerCase() === 'theo' ? 'theo' : 'lilli');

/** A child's initial in their color. */
export function ChildAvatar({ child }: { child: ChildId }) {
  const { name } = CHILDREN.find((c) => c.id === child)!;
  return (
    <Avatar size='2xl' className={CHILD_COLORS[child].avatar}>
      <AvatarFallback>{name[0]}</AvatarFallback>
    </Avatar>
  );
}

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
  description,
  actions,
  back,
  onProfile,
}: {
  title: string;
  meta?: string;
  description?: string;
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
              <Avatar size='2xl'>
                <AvatarFallback>TZ</AvatarFallback>
              </Avatar>
            </Button>
          )}
        </div>
      </div>
      <h1 className='text-title text-balance'>{title}</h1>
      {description && <p className='text-body text-muted-foreground'>{description}</p>}
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

/** Each tab scrolls on its own: the page rhythm's section step on top, clear of the floating nav below. */
export function ScreenScroll({ children }: { children: ReactNode }) {
  return (
    <div className='h-full overflow-y-auto px-group pt-section pb-32'>
      <div className='flex flex-col gap-group'>{children}</div>
    </div>
  );
}
