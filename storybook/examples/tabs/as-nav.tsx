import { InboxIcon, SettingsIcon, UsersIcon } from 'lucide-react';

import { TabsLink, TabsNav } from '~/components/ui/tabs';

/** Page links: `current` marks the page; a router link that sets `aria-current` itself needs none. */
export function TabsAsNav() {
  return (
    <TabsNav>
      <TabsLink href='#overview' current>
        <InboxIcon />
        Overview
      </TabsLink>
      <TabsLink href='#members'>
        <UsersIcon />
        Members
      </TabsLink>
      <TabsLink href='#settings'>
        <SettingsIcon />
        Settings
      </TabsLink>
    </TabsNav>
  );
}
