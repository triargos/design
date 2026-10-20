import { IconInbox, IconSettings, IconUsers } from '@tabler/icons-react';

import { TabsLink, TabsNav } from '~/components/ui/tabs';

/** Page links: `current` marks the page; a router link that sets `aria-current` itself needs none. */
export function TabsAsNav() {
  return (
    <TabsNav>
      <TabsLink href='#overview' current>
        <IconInbox />
        Overview
      </TabsLink>
      <TabsLink href='#members'>
        <IconUsers />
        Members
      </TabsLink>
      <TabsLink href='#settings'>
        <IconSettings />
        Settings
      </TabsLink>
    </TabsNav>
  );
}
