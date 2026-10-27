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
  Sheet,
  SheetContent,
  SheetMenuGroup,
  SheetMenuItem,
  SheetMenuRow,
  SheetMenuValue,
  SheetOption,
  SheetOptionContent,
  SheetOptionDescription,
  SheetOptionGroup,
  SheetOptionMedia,
  SheetOptionTitle,
  SheetPage,
  SheetStack,
  SheetTrigger,
} from '~/components/ui/sheet';
import { TabsRadio, TabsRadioGroup } from '~/components/ui/tabs';

const WORKSPACES = [
  { id: 'family', title: 'Parent portal', description: 'Müller family', icon: <IconHome /> },
  { id: 'office', title: 'Administration', description: 'Staff access', icon: <IconBuilding /> },
] as const;

/**
 * An account menu on a phone: menu groups on the first page, a picker pushed on top. Drag the top down, tap outside or
 * press Esc to close; picking closes it after the check moves.
 */
export function SheetBottom() {
  const [open, setOpen] = useState(false);
  const [workspace, setWorkspace] = useState<string>('family');
  const [theme, setTheme] = useState('system');
  const current = WORKSPACES.find((option) => option.id === workspace)!;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button />}>Account menu</SheetTrigger>
      <SheetContent side='bottom' aria-label='Account menu'>
        <SheetStack initial='root'>
          <SheetPage page='root'>
            <div className='flex touch-none items-center gap-part px-related pb-related'>
              <Avatar size='3xl'>
                <AvatarFallback>AM</AvatarFallback>
              </Avatar>
              <div className='min-w-0'>
                <p className='truncate font-medium'>Anna Müller</p>
                <p className='truncate text-caption text-muted-foreground'>Lindenschule · {current.title}</p>
              </div>
            </div>
            <SheetMenuGroup>
              <SheetMenuItem>
                <IconSettings />
                <span>Settings</span>
              </SheetMenuItem>
              <SheetMenuItem push='workspace'>
                <IconDeviceDesktop />
                <span>Workspace</span>
                <SheetMenuValue>{current.title}</SheetMenuValue>
              </SheetMenuItem>
              <SheetMenuRow>
                {theme === 'dark' ? <IconMoon /> : <IconSun />}
                <span id='sheet-bottom-theme'>Appearance</span>
                <TabsRadioGroup
                  variant='segmented'
                  shape='pill'
                  aria-labelledby='sheet-bottom-theme'
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
              </SheetMenuRow>
            </SheetMenuGroup>
            <SheetMenuGroup>
              <SheetMenuItem>
                <IconMessageReport />
                <span>Report a problem</span>
              </SheetMenuItem>
              <SheetMenuItem intent='destructive' onClick={() => setOpen(false)}>
                <IconLogout />
                <span>Sign out</span>
              </SheetMenuItem>
            </SheetMenuGroup>
          </SheetPage>
          <SheetPage page='workspace' title='Workspace'>
            <SheetOptionGroup aria-label='Workspace'>
              {WORKSPACES.map((option) => (
                <SheetOption
                  key={option.id}
                  checked={workspace === option.id}
                  onClick={() => {
                    setWorkspace(option.id);
                    setTimeout(() => setOpen(false), 220);
                  }}>
                  <SheetOptionMedia>{option.icon}</SheetOptionMedia>
                  <SheetOptionContent>
                    <SheetOptionTitle>{option.title}</SheetOptionTitle>
                    <SheetOptionDescription>{option.description}</SheetOptionDescription>
                  </SheetOptionContent>
                </SheetOption>
              ))}
            </SheetOptionGroup>
          </SheetPage>
        </SheetStack>
      </SheetContent>
    </Sheet>
  );
}
