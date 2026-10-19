import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, waitFor } from 'storybook/test';

import { OptionSelectAllowCustom } from '../examples/option-select/allow-custom';
import { OptionSelectDefault } from '../examples/option-select/default';
import { OptionSelectInAField } from '../examples/option-select/in-a-field';
import { OptionSelectStates } from '../examples/option-select/states';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { open } from '../kit/play';

const meta = {
  title: 'Components/Option Select',
  parameters: { description: 'A select over a short list of items; optionally with an „Andere" row.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Option Select'
      description='Select over items with SearchSelect’s API (items, itemKey, itemLabel, value, onValueChange) for short lists: no typing, no virtualization. Not bound to a form: wire it through Controller + Field. For long lists or search, Search Select.'>
      <ExampleSection title='Default'>
        <OptionSelectDefault />
      </ExampleSection>
      <ExampleSection
        title='Allow custom'
        description={
          <>
            <Code>allowCustom</Code>: the value is a plain string, a key or the typed text. „Andere angeben …" stays
            last, after a separator; picking it emits <Code>''</Code>, folds open a text field hung off the select and
            focuses it. A value that is no key opens with the field.
          </>
        }>
        <OptionSelectAllowCustom />
      </ExampleSection>
      <ExampleSection
        title='In a field'
        description={
          <>
            Required: a non-empty check covers „Andere" without text (<Code>''</Code>); <Code>invalid</Code> then
            marks the text field.
          </>
        }>
        <OptionSelectInAField />
      </ExampleSection>
      <ExampleSection title='States' description='Placeholder, invalid, disabled, size sm.'>
        <OptionSelectStates />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = {
  render: () => <OptionSelectDefault />,
  play: open('click', 'Status', 'Erledigt', 'combobox'),
};
export const AllowCustom: Story = {
  name: 'Allow custom',
  render: () => <OptionSelectAllowCustom />,
  /** Away from „Andere" and back: the field folds open again, empty, and takes focus once the popup has closed. */
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('combobox', { name: 'Beziehung zum Kind' });
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole('option', { name: 'Vater' }));
    await waitFor(() => expect(canvas.queryByLabelText('Andere Beziehung')).toBeNull());
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole('option', { name: 'Andere angeben …' }));
    const other = await canvas.findByLabelText('Andere Beziehung');
    await waitFor(() => expect(other).toHaveFocus());
    await expect(other).toHaveValue('');
  },
};
export const InAField: Story = { name: 'In a field', render: () => <OptionSelectInAField /> };
export const States: Story = { render: () => <OptionSelectStates /> };
