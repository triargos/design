import type { Meta, StoryObj } from '@storybook/react-vite';
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
  useComboboxAnchor,
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
import { Columns, Stack } from '../kit/stack';

const meta = {
  title: 'Components/Input',
  parameters: { description: 'A single-line text field on the shared field surface.' },
  component: Input,
  args: { placeholder: 'Max Mustermann' },
} satisfies Meta<typeof Input>;

export default meta;

type Story = StoryObj<typeof meta>;

const GRADES = [
  { value: '5', label: 'Klasse 5' },
  { value: '6', label: 'Klasse 6' },
  { value: '7', label: 'Klasse 7' },
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

function GradeSelect({ state }: { state: FieldState }) {
  return (
    <Select
      items={GRADES}
      defaultValue={state === 'empty' ? undefined : '6'}
      disabled={state === 'disabled'}
      readOnly={state === 'read-only'}>
      <SelectTrigger aria-invalid={state === 'invalid' || undefined}>
        <SelectValue placeholder='Klasse wählen' />
      </SelectTrigger>
      <SelectContent>
        {GRADES.map((grade) => (
          <SelectItem key={grade.value} value={grade.value}>
            {grade.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

type Grade = (typeof GRADES)[number];

function GradeChips({ state }: { state: FieldState }) {
  const anchor = useComboboxAnchor();
  return (
    <Combobox
      multiple
      items={GRADES}
      defaultValue={state === 'empty' ? [] : GRADES.slice(0, 2)}
      itemToStringLabel={(grade: Grade) => grade.label}
      disabled={state === 'disabled'}
      readOnly={state === 'read-only'}>
      <ComboboxChips ref={anchor} aria-invalid={state === 'invalid' || undefined}>
        <ComboboxValue>
          {(value: Grade[]) => value.map((grade) => <ComboboxChip key={grade.value}>{grade.label}</ComboboxChip>)}
        </ComboboxValue>
        <ComboboxChipsInput placeholder={state === 'empty' ? 'Klassen wählen' : undefined} />
      </ComboboxChips>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>Keine Klasse gefunden</ComboboxEmpty>
        <ComboboxList>
          {(grade: Grade) => (
            <ComboboxItem key={grade.value} value={grade}>
              {grade.label}
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
        placeholder='Max Mustermann'
        defaultValue={state === 'empty' ? undefined : 'Erika Mustermann'}
        {...stateProps(state)}
      />
    ),
  },
  {
    name: 'Textarea',
    meta: 'min 60px, grows with rows',
    render: (state) => (
      <Textarea
        placeholder='Nachricht an die Eltern'
        defaultValue={state === 'empty' ? undefined : 'Der Elternabend beginnt um 19 Uhr.'}
        {...stateProps(state)}
      />
    ),
  },
  { name: 'Select', meta: 'SelectTrigger', render: (state) => <GradeSelect state={state} /> },
  {
    name: 'PickerTrigger',
    meta: 'opens a popup: date, virtualized combobox',
    render: (state) => (
      <PickerTrigger
        aria-invalid={state === 'invalid' || undefined}
        disabled={state === 'disabled'}
        className={cn('justify-between', state === 'empty' && 'text-muted-foreground')}>
        <span>{state === 'empty' ? 'Schüler wählen' : 'Erika Mustermann'}</span>
        <ChevronsUpDownIcon className='opacity-50' />
      </PickerTrigger>
    ),
  },
  {
    name: 'Combobox chips',
    meta: '32px chips, 4px in, rounded-inner',
    render: (state) => <GradeChips state={state} />,
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
          placeholder='Suchen'
          defaultValue={state === 'empty' ? undefined : 'Mustermann'}
          {...stateProps(state)}
        />
      </InputGroup>
    ),
  },
];

/** A surface the field can sit on, with the `data-surface` the app sets. */
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
          <Input placeholder='Max Mustermann' />
          <GradeSelect state='filled' />
        </Stack>
      </div>
    </Stack>
  );
}

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
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
};

export const Playground: Story = {};
export const Default: Story = { render: () => <InputDefault /> };
export const WithLabel: Story = {
  name: 'With label',
  render: () => <InputWithLabel />,
};
export const File: Story = { render: () => <InputFile /> };
export const States: Story = { render: () => <InputStates /> };
