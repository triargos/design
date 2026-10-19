import type { Meta, StoryObj } from '@storybook/react-vite';

import { LabelDefault } from '../examples/label/default';
import { LabelWithCheckbox } from '../examples/label/with-checkbox';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Label',
  parameters: { description: 'Names a control. Legacy: new forms use FieldLabel.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Label'
      description='Names a control. Legacy: new forms use FieldLabel inside a Field, which also places the description and error.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>required</Code> adds the asterisk.
          </>
        }>
        <LabelDefault />
      </ExampleSection>
      <ExampleSection title='With checkbox'>
        <LabelWithCheckbox />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <LabelDefault /> };
export const WithCheckbox: Story = {
  name: 'With checkbox',
  render: () => <LabelWithCheckbox />,
};
