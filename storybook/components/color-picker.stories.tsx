import type { Meta, StoryObj } from '@storybook/react-vite';

import { ColorPickerCustom } from '../examples/color-picker/custom';
import { ColorPickerDefault } from '../examples/color-picker/default';
import { ColorPickerInAField } from '../examples/color-picker/in-a-field';
import { ColorPickerInline } from '../examples/color-picker/inline';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Color Picker',
  parameters: { description: 'A user-chosen label color: twelve presets and a custom color.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Color Picker'
      description='A user-chosen label color (application categories, submission statuses): twelve Tailwind 500 presets that read as a dot and as an icon stroke, and a custom color. These are data colors, not theme tokens; the UI around them stays on the intents.'>
      <ExampleSection title='Default' description='A preset.'>
        <ColorPickerDefault />
      </ExampleSection>
      <ExampleSection title='Custom' description='Any other hex shows as the custom swatch.'>
        <ColorPickerCustom />
      </ExampleSection>
      <ExampleSection
        title='Inline'
        description={
          <>
            <Code>custom='inline'</Code>: the custom picker in place, inside a popup.
          </>
        }>
        <ColorPickerInline />
      </ExampleSection>
      <ExampleSection
        title='In a field'
        description={
          <>
            <Code>FieldTitle</Code> + <Code>aria-labelledby</Code>
          </>
        }>
        <ColorPickerInAField />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <ColorPickerDefault /> };
export const Custom: Story = { render: () => <ColorPickerCustom /> };
export const Inline: Story = { render: () => <ColorPickerInline /> };
export const InAField: Story = {
  name: 'In a field',
  render: () => <ColorPickerInAField />,
};
