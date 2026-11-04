import { IconCalendarOff, IconFolder, IconHome, IconMail, IconUsers } from '@tabler/icons-react';
import { useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { BottomNav, BottomNavLink, BottomNavList } from '~/components/ui/bottom-nav';
import { SIZING_STYLES, sizingThemeAttributes, sizingThemeCss } from '~/lib/theme/sizing';

import {
  AbsencesScreen,
  AnnouncementScreen,
  AnnouncementsScreen,
  DocumentsScreen,
  FamilyScreen,
  MessagesScreen,
  TodayScreen,
} from './screens';
import type { Navigation, Screen, Sheet } from './shared';
import { ProfileSheet, ReportSheet } from './sheets';

const TABS = [
  { screen: 'today', label: 'Today', icon: <IconHome /> },
  { screen: 'absences', label: 'Absences', icon: <IconCalendarOff /> },
  { screen: 'messages', label: 'Messages', icon: <IconMail />, count: 2 },
  { screen: 'documents', label: 'Documents', icon: <IconFolder /> },
  { screen: 'family', label: 'Family', icon: <IconUsers /> },
] as const;

/**
 * A parent app on a phone, every tab and both sheets, in the `contrast` style with Bricolage Grotesque titles: plain
 * cards, flat controls, an inverse lead card and an inverse pill nav that labels the current tab. Built from
 * components and roles only; the style and `--font-display` decide the look. The frame's `translate-z-0` keeps the
 * fixed drawers and nav inside it.
 */
export function ParentApp() {
  const [screen, setScreen] = useState<Screen>('today');
  const [sheet, setSheet] = useState<Sheet>(null);
  const [sick, setSick] = useState(true);
  const [frame, setFrame] = useState<HTMLDivElement | null>(null);
  const nav: Navigation = { go: setScreen, open: setSheet };
  const current = screen === 'announcements' || screen === 'announcement' ? 'today' : screen;

  return (
    <div data-sizing='parent-app' {...sizingThemeAttributes(SIZING_STYLES.contrast)} className='flex justify-center'>
      <style>
        {sizingThemeCss(SIZING_STYLES.contrast, '[data-sizing=parent-app]')}
        {`[data-sizing=parent-app]{--font-display:'Bricolage Grotesque',sans-serif;}`}
      </style>
      <div
        ref={setFrame}
        className='relative h-[844px] w-[390px] max-w-full translate-z-0 overflow-hidden rounded-panel bg-background ring ring-border/50'>
        {screen === 'today' && <TodayScreen nav={nav} sick={sick} setSick={setSick} />}
        {screen === 'absences' && <AbsencesScreen nav={nav} sick={sick} />}
        {screen === 'messages' && <MessagesScreen nav={nav} />}
        {screen === 'documents' && <DocumentsScreen nav={nav} />}
        {screen === 'family' && <FamilyScreen nav={nav} />}
        {screen === 'announcements' && <AnnouncementsScreen nav={nav} />}
        {screen === 'announcement' && <AnnouncementScreen nav={nav} />}

        <BottomNav className='absolute md:grid'>
          <BottomNavList labels='current' inverse>
            {TABS.map((tab) => (
              <BottomNavLink
                key={tab.screen}
                href='#'
                current={current === tab.screen}
                onClick={(event) => {
                  event.preventDefault();
                  setScreen(tab.screen);
                }}>
                {tab.icon}
                <span>{tab.label}</span>
                {'count' in tab && (
                  <Badge size='sm' shape='pill' intent='primary' emphasis='solid'>
                    {tab.count}
                  </Badge>
                )}
              </BottomNavLink>
            ))}
          </BottomNavList>
        </BottomNav>

        <ReportSheet
          open={sheet === 'report'}
          onOpenChange={(open) => setSheet(open ? 'report' : null)}
          container={frame}
          onSent={() => setSick(true)}
        />
        <ProfileSheet
          open={sheet === 'profile'}
          onOpenChange={(open) => setSheet(open ? 'profile' : null)}
          container={frame}
        />
      </div>
    </div>
  );
}
