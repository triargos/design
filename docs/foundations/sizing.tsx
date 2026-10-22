import { IconArchive, IconCopy, IconDots, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState, type ReactNode } from 'react';

import { Alert, AlertAction, AlertContent } from '~/components/ui/alert';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
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
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';
import { Kbd, KbdGroup } from '~/components/ui/kbd';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Switch } from '~/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { Textarea } from '~/components/ui/textarea';

import {
  DEFAULT_SIZING,
  DENSITIES,
  type Density,
  RADII,
  type Radius,
  scaleDensity,
  SIZING_GROUPS,
  SIZING_STYLES,
  SIZING_TOKEN_NAMES,
  SIZING_TOKENS,
  type SizingGroup,
  type SizingStyle,
  type SizingTheme,
  type SizingToken,
  type SizingValues,
  sizingThemeCss,
  sizingValues,
} from '~/lib/theme/sizing';

import { Code, FoundationPage, FoundationSection, SpecimenList, SpecimenRow } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

const STYLES: ReadonlyArray<{ name: SizingStyle; label: string; description: string }> = [
  { name: 'triargos', label: 'Triargos', description: 'The default: 36px controls, 10px corners, 20px cards.' },
  {
    name: 'coss',
    label: 'Coss',
    description:
      'coss ui: 32px controls and 28px menu rows on a desktop, one step bigger on a phone; 10px controls and popups.',
  },
  { name: 'dense', label: 'Dense', description: 'shadcn mira and nova: 28px controls, 13px control text.' },
  { name: 'soft', label: 'Soft', description: 'shadcn maia: comfortable density, pill controls, round surfaces.' },
];

const DENSITY_NAMES = Object.keys(DENSITIES) as ReadonlyArray<Density>;
const RADIUS_NAMES = Object.keys(RADII) as ReadonlyArray<Radius>;

/**
 * Every token set, not only the theme's overrides: a demo must not inherit the sizing theme Customize puts on the page.
 */
const complete = (theme: SizingTheme): SizingTheme => ({
  ...theme,
  tokens: { ...DEFAULT_SIZING, ...sizingValues(theme).base },
});

/** A subtree sized by `theme`: a `<style>` from `sizingThemeCss` on `[data-sizing=name]`. */
function Sized({ name, theme, children }: { name: string; theme: SizingTheme; children: ReactNode }) {
  return (
    <div data-sizing={name} className='min-w-0'>
      <style>{sizingThemeCss(complete(theme), `[data-sizing="${name}"]`)}</style>
      {children}
    </div>
  );
}

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
      <CardContent className='p-card'>
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
      <CardFooter className='flex justify-end gap-related'>
        <Button>Cancel</Button>
        <Button intent='primary'>Save</Button>
      </CardFooter>
    </Card>
  );
}

/**
 * A menu open on its trigger, in the sized subtree (`container`), so it takes the subtree's tokens. The stage holds the
 * trigger and five rows.
 */
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
        <Button size='xs'>Filter</Button>
        <Button size='icon' emphasis='ghost' aria-label='More'>
          <IconDots />
        </Button>
        <Button size='icon-xs' aria-label='Copy'>
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

/** The same screen in every style: the settings card beside controls, a list, a table, an alert and an open menu. */
function SampleUI({ id }: { id: string }) {
  return (
    <div className='grid items-start gap-group md:grid-cols-2'>
      <SettingsCard id={id} />
      <div className='flex min-w-0 flex-col gap-group'>
        <Controls />
        <Alert>
          <AlertContent>The trial ends on March 31.</AlertContent>
          <AlertAction>
            <Button size='xs'>Upgrade</Button>
          </AlertAction>
        </Alert>
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
          </CardHeader>
          <CardContent className='overflow-hidden'>
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

/** One matrix cell: a field, a button pair and the small controls. */
function MiniSample({ id }: { id: string }) {
  return (
    <div className='flex w-full min-w-0 flex-col gap-related'>
      <Input aria-label='Search' placeholder='Search' />
      <div className='flex items-center gap-related'>
        <Button intent='primary'>Save</Button>
        <Button size='icon' aria-label='More'>
          <IconDots />
        </Button>
      </div>
      <div className='flex flex-wrap items-center gap-related'>
        <Checkbox aria-label={`${id} done`} defaultChecked />
        <Switch aria-label={`${id} public`} defaultChecked />
        <Badge intent='success'>Done</Badge>
      </div>
    </div>
  );
}

const controlHeight = (density: Density | SizingValues) =>
  px(sizingValues({ density, radius: 'default' }).base['--spacing-control'] ?? DEFAULT_SIZING['--spacing-control']);

/** `scaleDensity` factors shown beside the named densities. */
const SCALES = [0.875, 1, 1.125] as const;

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
  const [, namespace, name] = /^--(spacing|radius|text)-(.+)$/.exec(token) ?? [];
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
      <CardContent className='overflow-hidden'>
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

/** Token rows of a value table: one per token any column sets; a column that leaves it shows a dash. */
function ValueTable({
  columns,
  defaults = false,
}: {
  columns: ReadonlyArray<{ name: string; values: SizingValues }>;
  /** Add a column for the default value. */
  defaults?: boolean;
}) {
  const tokens = SIZING_TOKEN_NAMES.filter((token) => columns.some((column) => column.values[token] !== undefined));
  return (
    <Card>
      <Table variant='card'>
        <TableHeader>
          <TableRow>
            <TableHead>Token</TableHead>
            {defaults && <TableHead className='text-right'>default</TableHead>}
            {columns.map((column) => (
              <TableHead key={column.name} className='text-right'>
                {column.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {tokens.map((token: SizingToken) => (
            <TableRow key={token}>
              <TableCell className='font-medium whitespace-nowrap'>{token}</TableCell>
              {defaults && (
                <TableCell className='text-right text-muted-foreground tabular-nums'>
                  {px(DEFAULT_SIZING[token])}
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell key={column.name} className='text-right tabular-nums'>
                  {px(column.values[token]) ?? <span className='text-faint-foreground'>–</span>}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

export default defineDocs({
  title: 'Sizing',
  description: 'Two axes size every component: density and radius. A sizing theme sets them on the page or a subtree.',
  group: 'Foundations',
  Page: () => (
    <FoundationPage
      title='Sizing'
      description='Two axes size every component: density (control heights, paddings, gaps, icons, card and dialog padding) and radius (every radius role). A sizing theme picks one of each, adds its own values and, below 640px, its touch values; sizingThemeCss renders it for :root or a subtree. The hit area, the 16px field text on a phone, hairlines and layout widths never scale.'>
      <FoundationSection
        title='Styles'
        description={
          <>
            Named sizing themes: a density, a radius and their own values. Each sample below is scoped with{' '}
            <Code>sizingThemeCss(SIZING_STYLES.name, '[data-sizing=…]')</Code>. Pick one for every page in Customize.
          </>
        }>
        <div className='flex flex-col gap-page'>
          {STYLES.map((style) => (
            <section key={style.name} className='flex flex-col gap-related'>
              <div className='flex flex-col px-1'>
                <h3 className='text-body font-medium'>{style.label}</h3>
                <p className='text-caption text-muted-foreground'>
                  {style.description} Density {SIZING_STYLES[style.name].density}, radius{' '}
                  {SIZING_STYLES[style.name].radius}.
                </p>
              </div>
              <Sized name={`style-${style.name}`} theme={SIZING_STYLES[style.name]}>
                <div className='rounded-card border border-border bg-background p-group'>
                  <SampleUI id={`sizing-${style.name}`} />
                </div>
              </Sized>
            </section>
          ))}
        </div>
      </FoundationSection>

      <FoundationSection
        title='Density × radius'
        description='The two axes alone, without a style’s own values. Density moves heights and room; radius moves shape.'>
        <SpecimenList>
          {DENSITY_NAMES.map((density) => (
            <SpecimenRow key={density} name={density} meta={`${controlHeight(density)}px controls`}>
              <div className='grid grid-cols-2 gap-group sm:grid-cols-4'>
                {RADIUS_NAMES.map((radius) => (
                  <div key={radius} className='flex min-w-0 flex-col gap-related'>
                    <span className='text-caption text-muted-foreground'>{radius}</span>
                    <Sized name={`${density}-${radius}`} theme={{ density, radius }}>
                      <MiniSample id={`${density} ${radius}`} />
                    </Sized>
                  </div>
                ))}
              </div>
            </SpecimenRow>
          ))}
          <SpecimenRow name='scale' meta='scaleDensity(factor), default radius'>
            <div className='grid grid-cols-2 gap-group sm:grid-cols-4'>
              {SCALES.map((factor) => (
                <div key={factor} className='flex min-w-0 flex-col gap-related'>
                  <span className='text-caption text-muted-foreground'>
                    ×{factor} · {controlHeight(scaleDensity(factor))}px
                  </span>
                  <Sized
                    name={`scale-${String(factor).replace('.', '-')}`}
                    theme={{ density: scaleDensity(factor), radius: 'default' }}>
                    <MiniSample id={`scale ${factor}`} />
                  </Sized>
                </div>
              ))}
            </div>
          </SpecimenRow>
        </SpecimenList>
      </FoundationSection>

      <FoundationSection
        title='Token reference'
        description={
          <>
            Every token a sizing theme sets, by family, with the components that read it. A density of your own is any
            of these: <Code>scaleDensity(0.9)</Code>, or a map of token to px.
          </>
        }>
        <div className='flex flex-col gap-page'>
          {(Object.keys(SIZING_GROUPS) as ReadonlyArray<SizingGroup>).map((group) => (
            <section key={group} className='flex flex-col gap-related'>
              <h3 className='px-1 text-body font-medium'>{SIZING_GROUPS[group]}</h3>
              <TokenReference group={group} />
            </section>
          ))}
        </div>
      </FoundationSection>

      <FoundationSection
        title='Density'
        description='What each density sets; a dash keeps the default. Type, page and section spacing stay.'>
        <ValueTable
          defaults
          columns={DENSITY_NAMES.filter((name) => name !== 'default').map((name) => ({
            name,
            values: DENSITIES[name],
          }))}
        />
      </FoundationSection>

      <FoundationSection
        title='Radius'
        description='What each radius sets. Pill rounds single-line controls fully and caps surfaces, multi-line fields, blocks, tooltips and the checkbox; sharp squares the fixed steps too.'>
        <ValueTable
          defaults
          columns={RADIUS_NAMES.filter((name) => name !== 'default').map((name) => ({ name, values: RADII[name] }))}
        />
      </FoundationSection>

      <FoundationSection
        title='Style values'
        description='Each style’s values on top of its density and radius, then its touch values below 640px.'>
        <ValueTable
          columns={STYLES.filter((style) => style.name !== 'triargos').flatMap((style) => {
            const values = sizingValues(SIZING_STYLES[style.name]);
            return Object.keys(values.touch).length > 0
              ? [
                  { name: style.label, values: values.base },
                  { name: `${style.label} touch`, values: values.touch },
                ]
              : [{ name: style.label, values: values.base }];
          })}
        />
      </FoundationSection>
    </FoundationPage>
  ),
});
