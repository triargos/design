import type { Meta, StoryObj } from '@storybook/react-vite';

import { StepperDefault } from '../examples/stepper/default';
import { StepperDone } from '../examples/stepper/done';
import { StepperLoading } from '../examples/stepper/loading';
import { StepperVertical } from '../examples/stepper/vertical';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Stepper',
  parameters: { description: 'A fixed sequence and where someone is in it.', frame: 'column' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Stepper'
      description='A fixed sequence and where someone is in it. Done steps show a check on the brand fill and a brand connector, the active step the subtle brand fill, later steps the quiet fill and a muted title.'>
      <ExampleSection
        title='Default'
        description={
          <>
            Horizontal, <Code>value={'{2}'}</Code>: done, active, todo.
          </>
        }>
        <StepperDefault />
      </ExampleSection>
      <ExampleSection
        title='Vertical'
        description={
          <>
            <Code>StepperIndicator · StepperContent · StepperSeparator</Code>
          </>
        }>
        <StepperVertical />
      </ExampleSection>
      <ExampleSection
        title='Loading'
        description={
          <>
            <Code>loading</Code> on the active step.
          </>
        }>
        <StepperLoading />
      </ExampleSection>
      <ExampleSection
        title='Done'
        description={
          <>
            <Code>value</Code> past the last step.
          </>
        }>
        <StepperDone />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <StepperDefault /> };
export const Vertical: Story = { render: () => <StepperVertical /> };
export const Loading: Story = { render: () => <StepperLoading /> };
export const Done: Story = { render: () => <StepperDone /> };
