import { InboxIcon, SettingsIcon, UsersIcon } from 'lucide-react';

import { TabsList, TabsTrigger } from '~/components/ui/tabs';

/** Page links: each trigger is a router link with `aria-current`. */
export function TabsAsNav() {
  return (
    <TabsList as='nav'>
      <TabsTrigger href='/' current>
        <InboxIcon />
        Übersicht
      </TabsTrigger>
      <TabsTrigger href='/members'>
        <UsersIcon />
        Mitglieder
      </TabsTrigger>
      <TabsTrigger href='/settings'>
        <SettingsIcon />
        Einstellungen
      </TabsTrigger>
    </TabsList>
  );
}
