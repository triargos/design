import type { Meta, StoryObj } from '@storybook/react-vite';

import { TextareaDefault } from '../examples/textarea/default';
import { TextareaStates } from '../examples/textarea/states';
import { TextareaTall } from '../examples/textarea/tall';
import { TextareaVariants } from '../examples/textarea/variants';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Textarea',
  parameters: { description: 'Multi-line text on the shared field surface.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Textarea'
      description='Multi-line text on the shared field surface. No input-scale: on touch the text renders 16px, where iOS does not zoom.'>
      <ExampleSection title='Default' description='At least 60px; grows with rows.'>
        <TextareaDefault />
      </ExampleSection>
      <ExampleSection
        title='Variants'
        description={
          <>
            <Code>ghost</Code> drops the surface, for a textarea inside an InputGroup that owns it.
          </>
        }>
        <TextareaVariants />
      </ExampleSection>
      <ExampleSection
        title='Tall'
        description={
          <>
            <Code>rows=6</Code>
          </>
        }>
        <TextareaTall />
      </ExampleSection>
      <ExampleSection title='States' description='Read-only, invalid, disabled.'>
        <TextareaStates />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <TextareaDefault /> };
export const Variants: Story = { render: () => <TextareaVariants /> };
export const Tall: Story = { render: () => <TextareaTall /> };
export const States: Story = { render: () => <TextareaStates /> };
