import { IconArchive, IconCopy, IconDots, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';

import { Alert, AlertAction, AlertContent } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { Button, type ButtonProps } from '~/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';
import { Checkbox } from '~/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { EMPHASES, type Emphasis, type Intent } from '~/components/ui/intent-variants';
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';
import { Kbd, KbdGroup } from '~/components/ui/kbd';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Switch } from '~/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Textarea } from '~/components/ui/textarea';

import {
  DEFAULT_SIZING,
  SIZING_GROUPS,
  SIZING_TOKEN_NAMES,
  SIZING_TOKENS,
  type SizingGroup,
  type SizingToken,
} from '~/lib/theme/sizing';

import { Code, FoundationPage, FoundationSection, Matrix, StateCell } from '../kit/blocks';
import { defineDocs } from '../kit/docs';
import { PaintCheck, PaintCheckGroup } from '../kit/paint-check';

const STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'paused', label: 'Paused' },
  { value: 'done', label: 'Done' },
];

const TASKS = [
  { name: 'Homepage copy', owner: 'Anna', status: { label: 'Review', intent: 'warning' } },
  { name: 'Pricing table', owner: 'Jonas', status: { label: 'Done', intent: 'success' } },
] as const;

/** The settings card: a field, a select, a textarea, a checkbox and a switch. */
function SettingsCard({ id }: { id: string }) {
  const [status, setStatus] = useState<string | null>('active');
  return (
    <Card>
      <CardHeader>
        <CardTitle>Project</CardTitle>
        <CardDescription>Shown to everyone in the workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor={`${id}-name`}>Name</FieldLabel>
            <Input id={`${id}-name`} defaultValue='Website redesign' />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-status`}>Status</FieldLabel>
            <Select items={STATUSES} value={status} onValueChange={setStatus}>
              <SelectTrigger id={`${id}-status`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUSES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-brief`}>Brief</FieldLabel>
            <Textarea id={`${id}-brief`} rows={2} defaultValue='A new homepage and pricing page before launch.' />
          </Field>
          <Field orientation='horizontal'>
            <Checkbox id={`${id}-notify`} defaultChecked />
            <FieldLabel htmlFor={`${id}-notify`}>Notify members</FieldLabel>
          </Field>
          <Field orientation='horizontal'>
            <FieldContent>
              <FieldLabel htmlFor={`${id}-public`}>Public link</FieldLabel>
              <FieldDescription>Anyone with the link can view.</FieldDescription>
            </FieldContent>
            <Switch id={`${id}-public`} defaultChecked />
          </Field>
        </FieldGroup>
      </CardContent>
      <CardFooter>
        <Button>Cancel</Button>
        <Button intent='primary'>Save</Button>
      </CardFooter>
    </Card>
  );
}

/** A menu open on its trigger, portalled into the stage (`container`) so it stays in place. The stage holds the trigger and five rows. */
function OpenMenu() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  return (
    <div ref={setContainer} className='relative h-[calc(var(--spacing-control)*5+3.75rem)]'>
      {container && (
        <DropdownMenu open modal={false}>
          <DropdownMenuTrigger render={<Button size='icon' aria-label='Actions' />}>
            <IconDots />
          </DropdownMenuTrigger>
          <DropdownMenuContent container={container} align='start' className='w-52'>
            <DropdownMenuLabel>Website redesign</DropdownMenuLabel>
            <DropdownMenuItem>
              <IconPencil />
              Edit
              <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <IconCopy />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem>
              <IconArchive />
              Archive
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem intent='destructive'>
              <IconTrash />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

/** Buttons in every size, badges, kbd and tabs. */
function Controls() {
  return (
    <div className='flex flex-col gap-group'>
      <div className='flex flex-wrap items-center gap-related'>
        <Button size='lg' intent='primary'>
          <IconPlus data-icon='inline-start' />
          New task
        </Button>
        <Button>Share</Button>
        <Button size='sm'>Filter</Button>
        <Button size='icon' emphasis='ghost' aria-label='More'>
          <IconDots />
        </Button>
        <Button size='icon-sm' aria-label='Copy'>
          <IconCopy />
        </Button>
      </div>
      <div className='flex flex-wrap items-center gap-related'>
        <Badge intent='success'>Active</Badge>
        <Badge intent='primary' emphasis='solid'>
          New
        </Badge>
        <Badge size='sm'>Draft</Badge>
        <Badge size='sm' shape='pill' intent='info'>
          12
        </Badge>
        <KbdGroup>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </div>
      <Tabs defaultValue='tasks'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='tasks'>Tasks</TabsTrigger>
          <TabsTrigger value='files'>Files</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}

/** One screen: the settings card beside controls, a list, a table, an alert and an open menu. */
function SampleUI({ id }: { id: string }) {
  return (
    <div className='grid items-start gap-group md:grid-cols-2'>
      <SettingsCard id={id} />
      <div className='flex min-w-0 flex-col gap-group'>
        <Controls />
        <Alert>
          <AlertContent>The trial ends on March 31.</AlertContent>
          <AlertAction>
            <Button size='sm'>Upgrade</Button>
          </AlertAction>
        </Alert>
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent>
            <ItemList>
              <Item>
                <ItemContent>
                  <ItemTitle>Anna Schmidt</ItemTitle>
                  <ItemDescription>anna@example.com</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Badge intent='success'>Owner</Badge>
                </ItemActions>
              </Item>
              <Item>
                <ItemContent>
                  <ItemTitle>Jonas Weber</ItemTitle>
                  <ItemDescription>jonas@example.com</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Badge>Member</Badge>
                </ItemActions>
              </Item>
            </ItemList>
          </CardContent>
        </Card>
      </div>
      <Card className='min-w-0'>
        <Table variant='card'>
          <TableHeader>
            <TableRow>
              <TableHead>Task</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {TASKS.map((task) => (
              <TableRow key={task.name}>
                <TableCell className='font-medium'>{task.name}</TableCell>
                <TableCell>{task.owner}</TableCell>
                <TableCell>
                  <Badge intent={task.status.intent}>{task.status.label}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <OpenMenu />
    </div>
  );
}

/** The component sources, read at build time, to find which components use a token. */
const COMPONENT_SOURCES = import.meta.glob<string>('../../src/components/ui/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
});

/** Tailwind utilities that take a spacing token (`px-control-pad`, `-mt-tight`, `min-h-control`). */
const SPACING_UTILITIES =
  'p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y|h|w|size|min-h|min-w|max-h|max-w|inset|inset-x|inset-y|top|right|bottom|left|start|end|translate-x|translate-y|basis|scroll-m|scroll-p';

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** What finds a token in a source: the variable itself (`var(--x)`, `(--x)`), and its utility form. */
const tokenPattern = (token: SizingToken): RegExp => {
  const forms = [`${escape(token)}(?![\\w-])`];
  const [, namespace, name = ''] = /^--(spacing|radius|text)-(.+)$/.exec(token) ?? [];
  if (namespace === 'spacing') forms.push(`(?<![\\w-])-?(?:${SPACING_UTILITIES})-${escape(name)}(?![\\w-])`);
  if (namespace === 'radius') forms.push(`(?<![\\w-])rounded(?:-[trblse]{1,2})?-${escape(name)}(?![\\w-])`);
  if (namespace === 'text' && !name.includes('--')) forms.push(`(?<![\\w-])text-${escape(name)}(?![\\w-])`);
  return new RegExp(forms.join('|'));
};

const titleCase = (file: string) =>
  file
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

/** Per token, the components whose source reads it, by page title (`dropdown-menu.tsx` → Dropdown Menu). */
const USED_BY: ReadonlyMap<SizingToken, ReadonlyArray<string>> = new Map(
  SIZING_TOKEN_NAMES.map((token) => {
    const pattern = tokenPattern(token);
    const users = Object.entries(COMPONENT_SOURCES)
      .filter(([, source]) => pattern.test(source))
      .map(([path]) => titleCase(path.split('/').at(-1)!.replace('.tsx', '')));
    return [token, users];
  }),
);

/**
 * One family's tokens: name and default, what it tunes, the components that read it. Rows, not a table, so a phone
 * reads them without scrolling sideways.
 */
function TokenReference({ group }: { group: SizingGroup }) {
  const tokens = SIZING_TOKEN_NAMES.filter((token) => SIZING_TOKENS[token].group === group);
  return (
    <Card>
      <CardContent>
        {tokens.map((token) => (
          <div
            key={token}
            className='grid grid-cols-[minmax(0,1fr)_auto] gap-x-group gap-y-tight border-t border-border-subtle px-card py-related first:border-t-0 sm:grid-cols-[minmax(0,16rem)_2.5rem_minmax(0,1fr)]'>
            <span className='min-w-0 text-body font-medium'>{token}</span>
            <span className='text-right text-body text-muted-foreground tabular-nums'>{px(DEFAULT_SIZING[token])}</span>
            <div className='col-span-2 flex flex-col sm:col-span-1'>
              <span className='text-body'>{SIZING_TOKENS[token].tunes}</span>
              <span className='text-caption text-muted-foreground'>
                {USED_BY.get(token)?.join(', ') || 'No component'}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

const px = (value: string | undefined) => (value === '9999px' ? 'full' : value?.replace('px', ''));

/** Every emphasis, at the intent it is used with. */
const PAINT_ROWS: ReadonlyArray<{ intent: Intent; emphasis: Emphasis }> = EMPHASES.map((emphasis) => ({
  intent: emphasis === 'solid' ? 'primary' : 'neutral',
  emphasis,
}));

/** The states that change what a button paints; `size` columns at rest. Focus adds its ring outside, on purpose. */
const PAINT_COLUMNS: ReadonlyArray<{
  name: string;
  state: 'rest' | 'hover';
  props: Partial<ButtonProps>;
}> = [
  { name: 'rest', state: 'rest', props: {} },
  { name: 'hover', state: 'hover', props: {} },
  { name: 'open', state: 'rest', props: { 'aria-expanded': true } },
  { name: 'disabled', state: 'rest', props: { disabled: true } },
  { name: 'sm', state: 'rest', props: { size: 'sm' } },
  { name: 'lg', state: 'rest', props: { size: 'lg' } },
];

/** One row per emphasis: each button measured, so a row of buttons at one size always lines up. */
function ButtonPaintMatrix() {
  return (
    <PaintCheckGroup>
      <Matrix
        columns={PAINT_COLUMNS.map(({ name }) => name)}
        columnWidth='6rem'
        rows={PAINT_ROWS.map(({ intent, emphasis }) => ({
          name: emphasis,
          meta: <Code>{intent}</Code>,
          cells: PAINT_COLUMNS.map(({ name, state, props }) => (
            <StateCell key={name} state={state}>
              <PaintCheck>
                <Button intent={intent} emphasis={emphasis} {...props}>
                  Action
                </Button>
              </PaintCheck>
            </StateCell>
          )),
        }))}
      />
      {/* A saturated surface, as in a hero: an edge over the surface would take its color and vanish. */}
      <Card>
        <CardContent>
          <div className='flex flex-wrap items-start gap-group'>
            {(['raised', 'outline'] as const).map((emphasis) =>
              PAINT_COLUMNS.slice(0, 2).map(({ name, state }) => (
                <StateCell key={`${emphasis}-${name}`} state={state}>
                  <PaintCheck backdrop='bg-primary-solid'>
                    <Button emphasis={emphasis}>
                      {emphasis === 'raised' ? 'Raised' : 'Outline'}
                      {state === 'hover' ? ' · hover' : ''}
                    </Button>
                  </PaintCheck>
                </StateCell>
              )),
            )}
          </div>
        </CardContent>
      </Card>
    </PaintCheckGroup>
  );
}

export default defineDocs({
  title: 'Sizing',
  description: 'One design: every length a component draws is a token in tailwind.css.',
  group: 'Foundations',
  Page: () => (
    <FoundationPage
      title='Sizing'
      description='One design, no sizing themes: every length a component draws (control heights, paddings, gaps, icons, insets, radii, type) is a token in tailwind.css. An app that needs a different length re-declares that one CSS variable on :root or a subtree. The hit area, the 16px field text on a phone, hairlines and layout widths are not tokens.'>
      <FoundationSection
        title='The design'
        description='One screen at the default tokens, in this page’s theme and mode. Customize tunes any token live.'>
        <div className='rounded-card border border-border bg-background p-group'>
          <SampleUI id='sizing-sample' />
        </div>
      </FoundationSection>

      <FoundationSection
        title='Painted height'
        description={
          <>
            A control paints exactly its box: fill, border and rings stay between the dashed guides, on any surface, so
            a 36px button looks 36px at every emphasis and in every state. Measured live in this page’s theme and mode;
            a red reading is a regression. Edges are borders inside the box (<Code>--edge</Code> on <Code>raised</Code>,{' '}
            <Code>--intent-border</Code> on <Code>outline</Code>), never a ring outside it.
          </>
        }>
        <ButtonPaintMatrix />
      </FoundationSection>

      <FoundationSection
        title='Token reference'
        description={<>Every token, by family, with its default and the components that read it.</>}>
        <div className='flex flex-col gap-page'>
          {(Object.keys(SIZING_GROUPS) as ReadonlyArray<SizingGroup>).map((group) => (
            <section key={group} className='flex flex-col gap-related'>
              <h3 className='px-1 text-body font-medium'>{SIZING_GROUPS[group]}</h3>
              <TokenReference group={group} />
            </section>
          ))}
        </div>
      </FoundationSection>
    </FoundationPage>
  ),
});
