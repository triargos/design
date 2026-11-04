import { Radio } from '@base-ui/react/radio';
import {
  IconBell,
  IconBuilding,
  IconCheck,
  IconClock,
  IconDeviceDesktop,
  IconLanguage,
  IconLogout,
  IconMessageReport,
  IconMoon,
  IconSun,
  IconNotes,
  IconSettings,
  IconSunHigh,
} from '@tabler/icons-react';
import { useState } from 'react';

import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { DateInput, TimeInput } from '~/components/ui/date-input';
import {
  Drawer,
  DrawerContent,
  DrawerMenuGroup,
  DrawerMenuItem,
  DrawerMenuRow,
  DrawerMenuValue,
  DrawerOption,
  DrawerOptionContent,
  DrawerOptionGroup,
  DrawerOptionTitle,
  DrawerPage,
  DrawerStack,
  useDrawerStack,
} from '~/components/ui/drawer';
import { Field, FieldLabel } from '~/components/ui/field';
import { RadioGroup } from '~/components/ui/radio-group';
import { Switch } from '~/components/ui/switch';
import { TabsRadio, TabsRadioGroup } from '~/components/ui/tabs';
import { Textarea } from '~/components/ui/textarea';
import { cn } from '~/lib/utils';

import { CHILD_COLORS, CHILDREN, type ChildId } from './shared';

const WHEN = [
  { id: 'today', label: 'Today', meta: 'Tue, 3 Nov' },
  { id: 'tomorrow', label: 'Tomorrow', meta: 'Wed, 4 Nov' },
  { id: 'range', label: 'Range', meta: 'Pick days' },
] as const;

const REASONS = ['Sick', 'Doctor’s appointment', 'Family reasons', 'Other'] as const;

/** A label above a group in a drawer, inset to the text of the rows below it. */
function SheetLabel({ id, children }: { id?: string; children: React.ReactNode }) {
  return (
    <p id={id} className='px-tight text-caption font-medium text-muted-foreground'>
      {children}
    </p>
  );
}

/**
 * The child picker: a radio group (Base UI's `Radio`, so arrow keys move the choice), each child a tile with their
 * initial; the chosen one fills with the child's tint, rings in their color and turns the initial solid.
 */
function ChildPicker({ value, onValueChange }: { value: ChildId; onValueChange: (child: ChildId) => void }) {
  return (
    <RadioGroup
      aria-labelledby='report-who'
      value={value}
      onValueChange={(next) => onValueChange(next as ChildId)}
      className='grid-cols-2'>
      {CHILDREN.map((child) => {
        const checked = value === child.id;
        const colors = CHILD_COLORS[child.id];
        return (
          <Radio.Root
            key={child.id}
            value={child.id}
            className={cn(
              'flex h-16 items-center gap-part rounded-card px-part text-start text-body font-(weight:--control-font-weight) outline-none',
              'transition-[background-color,box-shadow] duration-feedback focus-visible:ring-3 focus-visible:ring-ring/24',
              checked ? cn('ring-2', colors.tint, colors.ring) : 'bg-card shadow-raised',
            )}>
            <span
              aria-hidden
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-full font-medium',
                checked ? colors.solid : colors.avatar,
              )}>
              {child.name[0]}
            </span>
            {child.name}
          </Radio.Root>
        );
      })}
    </RadioGroup>
  );
}

/** The day picker: three tiles, a label over its date; the chosen one solid ink. */
function WhenPicker({ value, onValueChange }: { value: string; onValueChange: (when: string) => void }) {
  return (
    <RadioGroup
      aria-labelledby='report-when'
      value={value}
      onValueChange={(next) => onValueChange(String(next))}
      className='grid-cols-3'>
      {WHEN.map((option) => (
        <Radio.Root
          key={option.id}
          value={option.id}
          className={cn(
            'flex h-13 flex-col items-center justify-center rounded-block outline-none',
            'transition-[background-color,box-shadow] duration-feedback focus-visible:ring-3 focus-visible:ring-ring/24',
            value === option.id ? 'bg-neutral-solid text-neutral-solid-foreground' : 'bg-card shadow-raised',
          )}>
          <span className='text-control font-(weight:--control-font-weight)'>{option.label}</span>
          <span className='text-caption opacity-80'>{option.meta}</span>
        </Radio.Root>
      ))}
    </RadioGroup>
  );
}

/** The reason page, pushed over the form: pick one and it slides back. */
function ReasonPage({ reason, setReason }: { reason: string; setReason: (reason: string) => void }) {
  const { pop } = useDrawerStack();
  return (
    <DrawerPage page='reason' title='Reason'>
      <DrawerOptionGroup aria-label='Reason'>
        {REASONS.map((option) => (
          <DrawerOption
            key={option}
            checked={reason === option}
            onClick={() => {
              setReason(option);
              setTimeout(pop, 220);
            }}>
            <DrawerOptionContent>
              <DrawerOptionTitle>{option}</DrawerOptionTitle>
            </DrawerOptionContent>
          </DrawerOption>
        ))}
      </DrawerOptionGroup>
    </DrawerPage>
  );
}

/**
 * Reporting a child sick, as the mockup has it: who (the child tiles), when (today, tomorrow or a range, which opens
 * from and to dates), the details (a reason page pushed on top, all day or hours), a note; then a confirmation. A
 * `Drawer` in the app's frame (`container`), sensitive while the form holds input.
 */
export function ReportSheet({
  open,
  onOpenChange,
  container,
  child,
  setChild,
  onSent,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  container: HTMLElement | null;
  child: ChildId;
  setChild: (child: ChildId) => void;
  onSent: () => void;
}) {
  const [when, setWhen] = useState('today');
  const [from, setFrom] = useState('2026-11-04');
  const [to, setTo] = useState('2026-11-06');
  const [allDay, setAllDay] = useState(true);
  const [start, setStart] = useState('08:00');
  const [end, setEnd] = useState('10:00');
  const [reason, setReason] = useState<string>('Sick');
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
                className='flex flex-col gap-section'
                onSubmit={(event) => {
                  event.preventDefault();
                  setSent(true);
                  onSent();
                }}>
                <h2 className='px-tight text-heading'>Report a child sick</h2>

                <div className='flex flex-col gap-related'>
                  <SheetLabel id='report-who'>Who is sick?</SheetLabel>
                  <ChildPicker value={child} onValueChange={setChild} />
                </div>

                <div className='flex flex-col gap-related'>
                  <SheetLabel id='report-when'>When?</SheetLabel>
                  <WhenPicker value={when} onValueChange={setWhen} />
                  {when === 'range' && (
                    <div className='grid grid-cols-2 gap-related'>
                      <Field>
                        <FieldLabel htmlFor='report-from'>From</FieldLabel>
                        <DateInput id='report-from' value={from} onValueChange={setFrom} />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor='report-to'>To</FieldLabel>
                        <DateInput id='report-to' value={to} min={from} onValueChange={setTo} />
                      </Field>
                    </div>
                  )}
                </div>

                <DrawerMenuGroup>
                  <DrawerMenuItem push='reason'>
                    <IconNotes />
                    <span>Reason</span>
                    <DrawerMenuValue>{reason}</DrawerMenuValue>
                  </DrawerMenuItem>
                  <DrawerMenuRow>
                    <IconSunHigh />
                    <span id='report-all-day'>All day</span>
                    <Switch aria-labelledby='report-all-day' checked={allDay} onCheckedChange={setAllDay} />
                  </DrawerMenuRow>
                  {!allDay && (
                    <DrawerMenuRow>
                      <IconClock />
                      <span>Hours</span>
                      <TimeInput value={start} onValueChange={setStart} aria-label='From' className='w-32' />
                      <TimeInput value={end} onValueChange={setEnd} aria-label='To' className='w-32' />
                    </DrawerMenuRow>
                  )}
                </DrawerMenuGroup>

                <Field>
                  <FieldLabel htmlFor='report-note' className='px-tight'>
                    Note to the school (optional)
                  </FieldLabel>
                  <Textarea id='report-note' placeholder='For example: appointment at the paediatrician' />
                </Field>

                <Button type='submit' size='lg' intent='primary'>
                  Send report
                </Button>
              </form>
            )}
          </DrawerPage>
          <ReasonPage reason={reason} setReason={setReason} />
        </DrawerStack>
      </DrawerContent>
    </Drawer>
  );
}

/**
 * The profile, as Pavo's account menu draws it: who is signed in, the places to go (settings pushes a page of its
 * own), the appearance inline, then a problem report and sign out.
 */
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
  const [language, setLanguage] = useState('English');
  const [notify, setNotify] = useState({ absences: true, messages: true, announcements: false });

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent aria-label='Profile' container={container}>
        <DrawerStack initial='root'>
          <DrawerPage page='root'>
            <div className='flex items-center gap-part px-related pb-related'>
              <Avatar size='3xl'>
                <AvatarFallback>TZ</AvatarFallback>
              </Avatar>
              <div className='min-w-0'>
                <p className='truncate font-medium'>Tim Zolleis</p>
                <p className='truncate text-caption text-muted-foreground'>Musterberg Free School</p>
              </div>
            </div>
            <DrawerMenuGroup>
              <DrawerMenuItem push='settings'>
                <IconSettings />
                <span>Settings</span>
              </DrawerMenuItem>
              <DrawerMenuItem>
                <IconDeviceDesktop />
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
                <span id='profile-appearance'>Appearance</span>
                <TabsRadioGroup
                  variant='inline'
                  aria-labelledby='profile-appearance'
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

          <DrawerPage page='settings' title='Settings'>
            <div className='flex flex-col gap-related'>
              <SheetLabel>Notify me about</SheetLabel>
              <DrawerMenuGroup>
                {(
                  [
                    ['absences', 'Absence updates'],
                    ['messages', 'New messages'],
                    ['announcements', 'Announcements'],
                  ] as const
                ).map(([key, label]) => (
                  <DrawerMenuRow key={key}>
                    <IconBell />
                    <span id={`settings-${key}`}>{label}</span>
                    <Switch
                      aria-labelledby={`settings-${key}`}
                      checked={notify[key]}
                      onCheckedChange={(checked) => setNotify({ ...notify, [key]: checked })}
                    />
                  </DrawerMenuRow>
                ))}
              </DrawerMenuGroup>
            </div>
            <DrawerMenuGroup>
              <DrawerMenuItem push='language'>
                <IconLanguage />
                <span>Language</span>
                <DrawerMenuValue>{language}</DrawerMenuValue>
              </DrawerMenuItem>
            </DrawerMenuGroup>
          </DrawerPage>

          <LanguagePage language={language} setLanguage={setLanguage} />
        </DrawerStack>
      </DrawerContent>
    </Drawer>
  );
}

function LanguagePage({ language, setLanguage }: { language: string; setLanguage: (language: string) => void }) {
  const { pop } = useDrawerStack();
  return (
    <DrawerPage page='language' title='Language'>
      <DrawerOptionGroup aria-label='Language'>
        {['Deutsch', 'English', 'Türkçe', 'Українська'].map((option) => (
          <DrawerOption
            key={option}
            checked={language === option}
            onClick={() => {
              setLanguage(option);
              setTimeout(pop, 220);
            }}>
            <DrawerOptionContent>
              <DrawerOptionTitle>{option}</DrawerOptionTitle>
            </DrawerOptionContent>
          </DrawerOption>
        ))}
      </DrawerOptionGroup>
    </DrawerPage>
  );
}
