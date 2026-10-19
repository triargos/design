import type { Meta, StoryObj } from '@storybook/react-vite';

import { SelectDefault } from '../examples/select/default';
import { SelectGrouped } from '../examples/select/grouped';
import { SelectSizes } from '../examples/select/sizes';
import { SelectStates } from '../examples/select/states';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { open } from '../kit/play';

const meta = {
  title: 'Components/Select',
  parameters: { description: 'A field that opens a list of options.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Select'
      description='A field that opens a list of options, on the field surface. For many options or search, Combobox or Search Select.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>items</Code> lets SelectValue show the label.
          </>
        }>
        <SelectDefault />
      </ExampleSection>
      <ExampleSection
        title='Sizes'
        description={
          <>
            <Code>size='sm'</Code> (36px) in toolbars and filters.
          </>
        }>
        <SelectSizes />
      </ExampleSection>
      <ExampleSection
        title='Grouped'
        description={
          <>
            <Code>SelectGroup · SelectLabel · SelectSeparator</Code>
          </>
        }>
        <SelectGrouped />
      </ExampleSection>
      <ExampleSection title='States' description='Placeholder, invalid, read-only, disabled.'>
        <SelectStates />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = {
  render: () => <SelectDefault />,
  play: open('click', 'Status', 'Erledigt', 'combobox'),
};
export const Sizes: Story = { render: () => <SelectSizes /> };
export const Grouped: Story = {
  render: () => <SelectGrouped />,
  play: open('click', 'Klasse', 'Sekundarstufe', 'combobox'),
};
export const States: Story = { render: () => <SelectStates /> };
