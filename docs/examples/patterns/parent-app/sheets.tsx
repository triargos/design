import {
  IconBuilding,
  IconCheck,
  IconDeviceDesktop,
  IconDeviceMobile,
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
  DrawerPage,
  DrawerStack,
} from '~/components/ui/drawer';
import { Field, FieldLabel } from '~/components/ui/field';
import { ChoiceCard, RadioGroup } from '~/components/ui/radio-group';
import { Switch } from '~/components/ui/switch';
import { TabsRadio, TabsRadioGroup } from '~/components/ui/tabs';
import { Textarea } from '~/components/ui/textarea';

import { CHILDREN } from './shared';

const WHEN = [
  { id: 'today', label: 'Today', meta: 'Tue, 3 Nov' },
  { id: 'tomorrow', label: 'Tomorrow', meta: 'Wed, 4 Nov' },
  { id: 'range', label: 'Range', meta: 'Pick days' },
] as const;

/**
 * Reporting a child sick: who, when, all day or hours, a note; then a confirmation. A `Drawer` in the app's frame
 * (`container`), sensitive while the form holds input.
 */
export function ReportSheet({
  open,
  onOpenChange,
  container,
  onSent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  container: HTMLElement | null;
  onSent: () => void;
}) {
  const [child, setChild] = useState<string>('lilli');
  const [when, setWhen] = useState('tomorrow');
  const [allDay, setAllDay] = useState(true);
  const [sent, setSent] = useState(false);
  const name = CHILDREN.find((c) => c.id === child)!.name;

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setTimeout(() => setSent(false), 400);
      }}
      sensitive={!sent}>
      <DrawerContent aria-label='Report a child sick' container={container}>
        <DrawerStack initial='form'>
          <DrawerPage page='form'>
            {sent ? (
              <div className='flex flex-col items-center gap-group px-group py-section text-center'>
                <span
                  aria-hidden
                  className='flex size-20 items-center justify-center rounded-full bg-success-subtle text-success-subtle-foreground [&_svg]:size-10'>
                  <IconCheck />
                </span>
                <div className='flex flex-col gap-tight'>
                  <h2 className='text-title'>Report sent</h2>
                  <p className='text-body text-muted-foreground'>
                    {name}’s class teacher has been told. You can extend the absence any time.
                  </p>
                </div>
                <Button size='lg' intent='primary' className='px-section' onClick={() => onOpenChange(false)}>
                  Done
                </Button>
              </div>
            ) : (
              <form
                className='flex flex-col gap-section px-tight'
                onSubmit={(event) => {
                  event.preventDefault();
                  setSent(true);
                  onSent();
                }}>
                <h2 className='text-heading'>Report a child sick</h2>
                <RadioGroup
                  aria-label='Who is sick?'
                  value={child}
                  onValueChange={(next) => setChild(String(next))}
                  className='grid-cols-2'>
                  {CHILDREN.map((c) => (
                    <ChoiceCard key={c.id} value={c.id}>
                      <span className='flex items-center gap-part'>
                        <Avatar size='2xl'>
                          <AvatarFallback>{c.name[0]}</AvatarFallback>
                        </Avatar>
                        {c.name}
                      </span>
                    </ChoiceCard>
                  ))}
                </RadioGroup>
                <div className='flex flex-col gap-related'>
                  <p id='report-when' className='px-tight text-caption font-medium text-muted-foreground'>
                    When?
                  </p>
                  <TabsRadioGroup
                    variant='segmented'
                    aria-labelledby='report-when'
                    value={when}
                    onValueChange={setWhen}
                    className='w-full'>
                    {WHEN.map((option) => (
                      <TabsRadio key={option.id} value={option.id} className='flex-1'>
                        {option.label}
                      </TabsRadio>
                    ))}
                  </TabsRadioGroup>
                  <p className='px-tight text-caption text-muted-foreground'>
                    {WHEN.find((option) => option.id === when)!.meta}
                  </p>
                </div>
                <Field orientation='horizontal' className='justify-between px-tight'>
                  <FieldLabel htmlFor='report-all-day'>All day</FieldLabel>
                  <Switch id='report-all-day' checked={allDay} onCheckedChange={setAllDay} />
                </Field>
                <Field>
                  <FieldLabel htmlFor='report-note'>Note to the school (optional)</FieldLabel>
                  <Textarea id='report-note' placeholder='For example: appointment at the paediatrician' />
                </Field>
                <Button type='submit' size='lg' intent='primary'>
                  Send report
                </Button>
              </form>
            )}
          </DrawerPage>
        </DrawerStack>
      </DrawerContent>
    </Drawer>
  );
}

/** The profile: who is signed in, settings, appearance, a problem report and sign out. */
export function ProfileSheet({
  open,
  onOpenChange,
  container,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  container: HTMLElement | null;
}) {
  const [theme, setTheme] = useState('system');
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent aria-label='Profile' container={container}>
        <DrawerStack initial='root'>
          <DrawerPage page='root'>
            <div className='flex items-center gap-part px-related pb-related'>
              <Avatar size='4xl'>
                <AvatarFallback>TZ</AvatarFallback>
              </Avatar>
              <div className='min-w-0'>
                <p className='truncate text-heading'>Tim Zolleis</p>
                <p className='truncate text-caption text-muted-foreground'>Musterberg Free School</p>
              </div>
            </div>
            <DrawerMenuGroup>
              <DrawerMenuItem>
                <IconSettings />
                <span>Settings</span>
              </DrawerMenuItem>
              <DrawerMenuItem>
                <IconDeviceMobile />
                <span>Workspace</span>
                <DrawerMenuValue>App</DrawerMenuValue>
              </DrawerMenuItem>
              <DrawerMenuItem>
                <IconBuilding />
                <span>School</span>
                <DrawerMenuValue>Musterberg</DrawerMenuValue>
              </DrawerMenuItem>
              <DrawerMenuRow>
                {theme === 'dark' ? <IconMoon /> : <IconSun />}
                <span id='parent-app-theme'>Appearance</span>
                <TabsRadioGroup
                  variant='inline'
                  aria-labelledby='parent-app-theme'
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
              <DrawerMenuItem intent='destructive' onClick={() => onOpenChange(false)}>
                <IconLogout />
                <span>Sign out</span>
              </DrawerMenuItem>
            </DrawerMenuGroup>
          </DrawerPage>
        </DrawerStack>
      </DrawerContent>
    </Drawer>
  );
}
