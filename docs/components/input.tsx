import { ChevronsUpDownIcon, SearchIcon } from 'lucide-react';
import { type ReactNode } from 'react';

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from '~/components/ui/combobox';
import { Input } from '~/components/ui/input';
import { InputGroup, InputGroupAddon, InputGroupInput } from '~/components/ui/input-group';
import { cardSurface } from '~/components/ui/inset-card';
import { PickerTrigger } from '~/components/ui/picker-trigger';
import { popupSurface } from '~/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';
import { Textarea } from '~/components/ui/textarea';

import { cn } from '~/lib/utils';

import { InputDefault } from '../examples/input/default';
import { InputFile } from '../examples/input/file';
import { InputStates } from '../examples/input/states';
import { InputWithLabel } from '../examples/input/with-label';
import { Code, ExampleSection, FoundationPage, FoundationSection, SpecimenList, SpecimenRow } from '../kit/blocks';
import { defineDocs } from '../kit/docs';
import { Columns, Stack } from '../kit/stack';

const TEAMS = [
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'marketing', label: 'Marketing' },
];

/** A labelled cell, so a row of states reads as a table. */
function StateCell({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Stack gap='related'>
      <Code>{label}</Code>
      {children}
    </Stack>
  );
}

type FieldState = 'empty' | 'filled' | 'read-only' | 'invalid' | 'disabled';

const STATES: ReadonlyArray<FieldState> = ['empty', 'filled', 'read-only', 'invalid', 'disabled'];

const stateProps = (state: FieldState) => ({
  'aria-invalid': state === 'invalid' || undefined,
  disabled: state === 'disabled',
  readOnly: state === 'read-only',
});

function TeamSelect({ state }: { state: FieldState }) {
  return (
    <Select
      items={TEAMS}
      defaultValue={state === 'empty' ? undefined : 'design'}
      disabled={state === 'disabled'}
      readOnly={state === 'read-only'}>
      <SelectTrigger aria-invalid={state === 'invalid' || undefined}>
        <SelectValue placeholder='Choose a team' />
      </SelectTrigger>
      <SelectContent>
        {TEAMS.map((team) => (
          <SelectItem key={team.value} value={team.value}>
            {team.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

type Team = (typeof TEAMS)[number];

function TeamChips({ state }: { state: FieldState }) {
  return (
    <Combobox
      multiple
      items={TEAMS}
      defaultValue={state === 'empty' ? [] : TEAMS.slice(0, 2)}
      itemToStringLabel={(team: Team) => team.label}
      disabled={state === 'disabled'}
      readOnly={state === 'read-only'}>
      <ComboboxChips aria-invalid={state === 'invalid' || undefined}>
        <ComboboxValue>
          {(value: Team[]) => value.map((team) => <ComboboxChip key={team.value}>{team.label}</ComboboxChip>)}
        </ComboboxValue>
        <ComboboxChipsInput placeholder={state === 'empty' ? 'Choose teams' : undefined} />
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxEmpty>No teams found</ComboboxEmpty>
        <ComboboxList>
          {(team: Team) => (
            <ComboboxItem key={team.value} value={team}>
              {team.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}

const FIELDS: ReadonlyArray<{ name: string; meta: string; render: (state: FieldState) => ReactNode }> = [
  {
    name: 'Input',
    meta: '40px, text-control; on touch 16px scaled to 14',
    render: (state) => (
      <Input
        placeholder='Maya Chen'
        defaultValue={state === 'empty' ? undefined : 'Maya Chen'}
        {...stateProps(state)}
      />
    ),
  },
  {
    name: 'Textarea',
    meta: 'min 60px, grows with rows',
    render: (state) => (
      <Textarea
        placeholder='Add a comment'
        defaultValue={state === 'empty' ? undefined : 'The review moved to Thursday.'}
        {...stateProps(state)}
      />
    ),
  },
  { name: 'Select', meta: 'SelectTrigger', render: (state) => <TeamSelect state={state} /> },
  {
    name: 'PickerTrigger',
    meta: 'opens a popup: date, virtualized combobox',
    render: (state) => (
      <PickerTrigger
        aria-invalid={state === 'invalid' || undefined}
        disabled={state === 'disabled'}
        className={cn(state === 'empty' && 'text-muted-foreground')}>
        <span>{state === 'empty' ? 'Choose an assignee' : 'Maya Chen'}</span>
        <ChevronsUpDownIcon />
      </PickerTrigger>
    ),
  },
  {
    name: 'Combobox chips',
    meta: '32px chips, 4px in, rounded-inner',
    render: (state) => <TeamChips state={state} />,
  },
  {
    name: 'InputGroup',
    meta: 'the group owns surface, focus and invalid',
    render: (state) => (
      <InputGroup data-disabled={state === 'disabled' || undefined}>
        <InputGroupAddon>
          <SearchIcon />
        </InputGroupAddon>
        <InputGroupInput
          placeholder='Search'
          defaultValue={state === 'empty' ? undefined : 'Chen'}
          {...stateProps(state)}
        />
      </InputGroup>
    ),
  },
];

/** A surface the field can sit on, with its `data-surface`. */
function SurfaceSample({
  label,
  surface,
  className,
}: {
  label: string;
  surface?: 'card' | 'popup';
  className: string;
}) {
  return (
    <Stack gap='related'>
      <Code>{label}</Code>
      <div data-surface={surface} className={cn('rounded-[24px] p-group', className)}>
        <Stack gap='related'>
          <Input placeholder='Maya Chen' aria-label='Name' />
          <TeamSelect state='filled' />
        </Stack>
      </div>
    </Stack>
  );
}

export default defineDocs({
  title: 'Input',
  description: 'A single-line text field on the shared field surface.',
  group: 'Components',
  playground: {
    component: Input,
    args: { placeholder: 'Maya Chen' },
  },
  Page: () => (
    <FoundationPage
      title='Input'
      description='One field surface for every control that takes text or a choice: same height, edge, focus and error.'>
      <ExampleSection
        title='Default'
        description='40px, text-control; on touch 16px scaled to 14, so iOS does not zoom.'>
        <InputDefault />
      </ExampleSection>
      <ExampleSection
        title='With label'
        description={
          <>
            <Code>Field · FieldLabel · FieldDescription</Code>
          </>
        }>
        <InputWithLabel />
      </ExampleSection>
      <ExampleSection title='File'>
        <InputFile />
      </ExampleSection>
      <ExampleSection
        title='States'
        description='Read-only keeps the text selectable and never rings; invalid turns the edge; disabled drops the lift.'>
        <InputStates />
      </ExampleSection>

      <FoundationSection
        title='Fields'
        description='Each row: empty, filled, read-only, invalid, disabled. Focus: Tab into one. PickerTrigger has no read-only; it shows filled.'>
        <SpecimenList>
          {FIELDS.map((field) => (
            <SpecimenRow key={field.name} name={field.name} meta={field.meta}>
              <Columns columns={4} gap='related' className='lg:grid-cols-5'>
                {STATES.map((state) => (
                  <StateCell key={state} label={state}>
                    {field.render(state)}
                  </StateCell>
                ))}
              </Columns>
            </SpecimenRow>
          ))}
        </SpecimenList>
      </FoundationSection>

      <FoundationSection
        title='On surfaces'
        description='The field fill is the surface’s own color; the edge carries it.'>
        <div className='grid gap-group md:grid-cols-2 xl:grid-cols-4'>
          <SurfaceSample label='page' className='bg-background ring-1 ring-border' />
          <SurfaceSample label='shell' className='bg-shell' />
          <SurfaceSample label='card' surface='card' className={cardSurface} />
          <SurfaceSample label='popup' surface='popup' className={popupSurface} />
        </div>
      </FoundationSection>
    </FoundationPage>
  ),
});
