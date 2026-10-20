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
  parameters: { description: 'A select over a short list of options, optionally with an “Other…” row.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Option Select'
      description='A select over a short list of options, with Search Select’s items and value: no typing, no virtualization. For long lists or search, Search Select.'>
      <ExampleSection title='Default'>
        <OptionSelectDefault />
      </ExampleSection>
      <ExampleSection
        title='Allow custom'
        description={
          <>
            <Code>allowCustom</Code>: the value is an option's value or the typed text. “Other…” stays last, after a
            separator; picking it emits <Code>''</Code>, folds open a text field and focuses it.
          </>
        }>
        <OptionSelectAllowCustom />
      </ExampleSection>
      <ExampleSection
        title='In a field'
        description={
          <>
            Required: a non-empty check covers “Other” without text (<Code>''</Code>); <Code>aria-invalid</Code> then
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
  play: open('click', 'Status', 'Done', 'combobox'),
};
export const AllowCustom: Story = {
  name: 'Allow custom',
  render: () => <OptionSelectAllowCustom />,
  /** Away from “Other” and back: the field folds open again, empty, and takes focus once the popup has closed. */
  play: async ({ canvas, userEvent }) => {
    const trigger = canvas.getByRole('combobox', { name: 'How did you hear about us?' });
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole('option', { name: 'A colleague' }));
    await waitFor(() => expect(canvas.queryByLabelText('Other source')).toBeNull());
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole('option', { name: 'Other source…' }));
    const other = await canvas.findByLabelText('Other source');
    await waitFor(() => expect(other).toHaveFocus());
    await expect(other).toHaveValue('');
  },
};
export const InAField: Story = { name: 'In a field', render: () => <OptionSelectInAField /> };
export const States: Story = { render: () => <OptionSelectStates /> };
