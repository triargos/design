import type { Meta, StoryObj } from '@storybook/react-vite';

import { InputGroupBlockAddon } from '../examples/input-group/block-addon';
import { InputGroupPending } from '../examples/input-group/pending';
import { InputGroupSideBySide } from '../examples/input-group/side-by-side';
import { InputGroupWithButton } from '../examples/input-group/with-button';
import { InputGroupWithIcon } from '../examples/input-group/with-icon';
import { InputGroupWithShortcut } from '../examples/input-group/with-shortcut';
import { InputGroupWithText } from '../examples/input-group/with-text';
import { InputGroupWithTextarea } from '../examples/input-group/with-textarea';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Input Group',
  parameters: { description: 'A field with text, icons, keys or buttons inside it.', frame: 'column' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Input Group'
      description='A field with text, icons, keys or buttons inside it. The group owns the surface, focus and invalid; addons sit on the field’s 14px padding line.'>
      <ExampleSection title='With icon'>
        <InputGroupWithIcon />
      </ExampleSection>
      <ExampleSection
        title='With text'
        description={
          <>
            <Code>InputGroupText</Code>: a prefix or a unit.
          </>
        }>
        <InputGroupWithText />
      </ExampleSection>
      <ExampleSection
        title='With button'
        description={
          <>
            An icon for a field-local toggle, text for a field-local action, <Code>size='action'</Code> for a field that
            submits on its own.
          </>
        }>
        <InputGroupWithButton />
      </ExampleSection>
      <ExampleSection
        title='Side by side'
        description='Not a group: a field and a button, one related gap apart. For an action that is not about the field alone.'>
        <InputGroupSideBySide />
      </ExampleSection>
      <ExampleSection
        title='Block addon'
        description={
          <>
            <Code>align='block-end'</Code>: a toolbar under a ghost textarea.
          </>
        }>
        <InputGroupBlockAddon />
      </ExampleSection>
      <ExampleSection title='With shortcut' description='A Kbd in the end addon.'>
        <InputGroupWithShortcut />
      </ExampleSection>
      <ExampleSection title='Pending' description='A Loader in the end addon while results load.'>
        <InputGroupPending />
      </ExampleSection>
      <ExampleSection title='With textarea'>
        <InputGroupWithTextarea />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const WithIcon: Story = {
  name: 'With icon',
  render: () => <InputGroupWithIcon />,
};
export const WithText: Story = {
  name: 'With text',
  render: () => <InputGroupWithText />,
};
export const WithButton: Story = {
  name: 'With button',
  render: () => <InputGroupWithButton />,
};
export const SideBySide: Story = {
  name: 'Side by side',
  render: () => <InputGroupSideBySide />,
};
export const BlockAddon: Story = {
  name: 'Block addon',
  render: () => <InputGroupBlockAddon />,
};
export const WithShortcut: Story = {
  name: 'With shortcut',
  render: () => <InputGroupWithShortcut />,
};
export const Pending: Story = { render: () => <InputGroupPending /> };
export const WithTextarea: Story = {
  name: 'With textarea',
  render: () => <InputGroupWithTextarea />,
};
