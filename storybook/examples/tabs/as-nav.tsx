import { InboxIcon, SettingsIcon, UsersIcon } from 'lucide-react';

import { TabsList, TabsTrigger } from '~/components/ui/tabs';

/** Page links: each trigger is a router link with `aria-current`. */
export function TabsAsNav() {
  return (
    <TabsList as='nav'>
      <TabsTrigger to='/' end>
        <InboxIcon />
        Übersicht
      </TabsTrigger>
      <TabsTrigger to='/members'>
        <UsersIcon />
        Mitglieder
      </TabsTrigger>
      <TabsTrigger to='/settings'>
        <SettingsIcon />
        Einstellungen
      </TabsTrigger>
    </TabsList>
  );
}
