import {
  IconBuilding,
  IconDeviceDesktop,
  IconHome,
  IconLogout,
  IconMessageReport,
  IconMoon,
  IconSettings,
  IconSun,
} from '@tabler/icons-react';
import { useState } from 'react';

import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerMenuGroup,
  DrawerMenuItem,
  DrawerMenuRow,
  DrawerMenuValue,
  DrawerOption,
  DrawerOptionContent,
  DrawerOptionDescription,
  DrawerOptionGroup,
  DrawerOptionMedia,
  DrawerOptionTitle,
  DrawerPage,
  DrawerStack,
  DrawerTrigger,
} from '~/components/ui/drawer';
import { TabsRadio, TabsRadioGroup } from '~/components/ui/tabs';

const WORKSPACES = [
  { id: 'family', title: 'Parent portal', description: 'Müller family', icon: <IconHome /> },
  { id: 'office', title: 'Administration', description: 'Staff access', icon: <IconBuilding /> },
] as const;

/**
 * An account menu on a phone: menu groups on the first page, a picker pushed on top. Swipe it down, tap outside or
 * press Esc to close; picking closes it after the check moves.
 */
export function DrawerAccountMenu() {
  const [open, setOpen] = useState(false);
  const [workspace, setWorkspace] = useState<string>('family');
  const [theme, setTheme] = useState('system');
  const current = WORKSPACES.find((option) => option.id === workspace)!;

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger render={<Button />}>Account menu</DrawerTrigger>
      <DrawerContent aria-label='Account menu'>
        <DrawerStack initial='root'>
          <DrawerPage page='root'>
            <div className='flex items-center gap-part px-related pb-related'>
              <Avatar size='3xl'>
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
              <div className='min-w-0'>
                <p className='truncate font-medium'>Anna Müller</p>
                <p className='truncate text-caption text-muted-foreground'>Lindenschule · {current.title}</p>
              </div>
            </div>
            <DrawerMenuGroup>
              <DrawerMenuItem>
                <IconSettings />
                <span>Settings</span>
              </DrawerMenuItem>
              <DrawerMenuItem push='workspace'>
                <IconDeviceDesktop />
                <span>Workspace</span>
                <DrawerMenuValue>{current.title}</DrawerMenuValue>
              </DrawerMenuItem>
              <DrawerMenuRow>
                {theme === 'dark' ? <IconMoon /> : <IconSun />}
                <span id='drawer-account-theme'>Appearance</span>
                <TabsRadioGroup
                  variant='inline'
                  aria-labelledby='drawer-account-theme'
                  value={theme}
                  onValueChange={setTheme}>
                  <TabsRadio value='light' aria-label='Light'>
                    <IconSun />
                  </TabsRadio>
                  <TabsRadio value='dark' aria-label='Dark'>
                    <IconMoon />
                  </TabsRadio>
                  <TabsRadio value='system' aria-label='System'>
                    <IconDeviceDesktop />
                  </TabsRadio>
                </TabsRadioGroup>
              </DrawerMenuRow>
            </DrawerMenuGroup>
            <DrawerMenuGroup>
              <DrawerMenuItem>
                <IconMessageReport />
                <span>Report a problem</span>
              </DrawerMenuItem>
              <DrawerMenuItem intent='destructive' onClick={() => setOpen(false)}>
                <IconLogout />
                <span>Sign out</span>
              </DrawerMenuItem>
            </DrawerMenuGroup>
          </DrawerPage>
          <DrawerPage page='workspace' title='Workspace'>
            <DrawerOptionGroup aria-label='Workspace'>
              {WORKSPACES.map((option) => (
                <DrawerOption
                  key={option.id}
                  checked={workspace === option.id}
                  onClick={() => {
                    setWorkspace(option.id);
                    setTimeout(() => setOpen(false), 220);
                  }}>
                  <DrawerOptionMedia>{option.icon}</DrawerOptionMedia>
                  <DrawerOptionContent>
                    <DrawerOptionTitle>{option.title}</DrawerOptionTitle>
                    <DrawerOptionDescription>{option.description}</DrawerOptionDescription>
                  </DrawerOptionContent>
                </DrawerOption>
              ))}
            </DrawerOptionGroup>
          </DrawerPage>
        </DrawerStack>
      </DrawerContent>
    </Drawer>
  );
}
