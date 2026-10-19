import type { Meta, StoryObj } from '@storybook/react-vite';

import { ComboboxDefault } from '../examples/combobox/default';
import { ComboboxGrouped } from '../examples/combobox/grouped';
import { ComboboxMultiple } from '../examples/combobox/multiple';
import { ComboboxPlaceholder } from '../examples/combobox/placeholder';
import { ComboboxStates } from '../examples/combobox/states';
import { ComboboxTriggerWithSearch } from '../examples/combobox/trigger-with-search';
import { ComboboxVirtualized } from '../examples/combobox/virtualized';
import { Code, ExampleSection, FoundationPage, FoundationSection, SpecimenList, SpecimenRow } from '../kit/blocks';
import { open } from '../kit/play';

const meta = {
  title: 'Components/Combobox',
  parameters: { description: 'A field that filters a list as you type; the parts to compose your own.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Combobox'
      description='A field that filters a list as you type: Base UI Combobox on the field surface, the list a popup. Search Select covers picking from a list; compose these parts when a list needs its own shape.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>ComboboxInput showClear</Code> with a value.
          </>
        }>
        <ComboboxDefault />
      </ExampleSection>
      <ExampleSection title='Placeholder'>
        <ComboboxPlaceholder />
      </ExampleSection>
      <ExampleSection
        title='Multiple'
        description={
          <>
            <Code>ComboboxChips</Code>: 32px chips, 4px in, rounded-inner.
          </>
        }>
        <ComboboxMultiple />
      </ExampleSection>
      <ExampleSection
        title='Grouped'
        description={
          <>
            <Code>items</Code> as groups; each <Code>ComboboxGroup</Code> renders its own{' '}
            <Code>ComboboxCollection</Code>.
          </>
        }>
        <ComboboxGrouped />
      </ExampleSection>
      <ExampleSection
        title='Trigger with search'
        description='After coss ui: a select-like trigger; the search field sits in the popup.'>
        <ComboboxTriggerWithSearch />
      </ExampleSection>
      <ExampleSection
        title='Virtualized'
        description={
          <>
            <Code>virtualized</Code> + <Code>VirtualizedComboboxList</Code>: 2,100 streets, only the rows in view
            render.
          </>
        }>
        <ComboboxVirtualized />
      </ExampleSection>
      <ExampleSection title='States' description='Invalid and disabled. With no match the list shows ComboboxEmpty.'>
        <ComboboxStates />
      </ExampleSection>

      <FoundationSection title='Which one'>
        <SpecimenList>
          <SpecimenRow name='Pick from a list' meta={<Code>SearchSelect</Code>}>
            <p className='text-body text-pretty text-muted-foreground'>
              Any length, one value or many: forms, reference data (streets, nationalities), groups. Rows and chips take
              custom content through <Code>renderItem</Code>.
            </p>
          </SpecimenRow>
          <SpecimenRow name='List or own text' meta={<Code>OptionSelect · SearchSelect allowCustom</Code>}>
            <p className='text-body text-pretty text-muted-foreground'>
              Short list, a custom value rare: <Code>OptionSelect allowCustom</Code>, an „Andere" row with a text field.
              Longer list, or typing is the main path: <Code>SearchSelect allowCustom</Code>. Both hand over a plain
              string.
            </p>
          </SpecimenRow>
          <SpecimenRow name='Own composition' meta={<Code>Combobox · ComboboxList · ComboboxChips</Code>}>
            <p className='text-body text-pretty text-muted-foreground'>
              Grouped lists, a select-like trigger with search in the popup, a field addon, or a list inline in a dialog
              (<Code>inline</Code>). Add <Code>virtualized</Code> + <Code>VirtualizedComboboxList</Code> for long lists.
            </p>
          </SpecimenRow>
        </SpecimenList>
      </FoundationSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <ComboboxDefault />, play: open('click', 'Ort', 'Bremen', 'combobox') };
export const Placeholder: Story = {
  render: () => <ComboboxPlaceholder />,
  play: open('click', 'Ort', 'Bremen', 'combobox'),
};
export const Multiple: Story = { render: () => <ComboboxMultiple /> };
export const Grouped: Story = { render: () => <ComboboxGrouped />, play: open('click', 'Ort', 'Nord', 'combobox') };
export const TriggerWithSearch: Story = {
  name: 'Trigger with search',
  render: () => <ComboboxTriggerWithSearch />,
  play: open('click', 'Ort', 'Hamburg', 'combobox'),
};
export const Virtualized: Story = {
  render: () => <ComboboxVirtualized />,
  play: open('click', 'Straße', 'Hauptstraße 4', 'combobox'),
};
export const States: Story = { render: () => <ComboboxStates /> };
