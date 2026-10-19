import type { Meta, StoryObj } from '@storybook/react-vite';

import { LoaderDefault } from '../examples/loader/default';
import { LoaderInAButton } from '../examples/loader/in-a-button';
import { LoaderSizes } from '../examples/loader/sizes';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Loader',
  parameters: { description: 'The spinner, in currentColor.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Loader'
      description='The spinner alone, in currentColor: inside a button it takes the label color; alone, give it a text level. Still with reduced motion.'>
      <ExampleSection title='Default'>
        <LoaderDefault />
      </ExampleSection>
      <ExampleSection
        title='Sizes'
        description={
          <>
            <Code>size</Code> 16 · 20 · 24 · 32
          </>
        }>
        <LoaderSizes />
      </ExampleSection>
      <ExampleSection
        title='In a button'
        description={
          <>
            Use <Code>isLoading</Code>, not a Loader child: the label keeps the width; the spinner shows at least 800ms.
          </>
        }>
        <LoaderInAButton />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <LoaderDefault /> };
export const Sizes: Story = { render: () => <LoaderSizes /> };
export const InAButton: Story = {
  name: 'In a button',
  render: () => <LoaderInAButton />,
};
