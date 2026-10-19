import type { Meta, StoryObj } from '@storybook/react-vite';

import { FadeInDefault } from '../examples/fade-in/default';
import { FadeInFadeOut } from '../examples/fade-in/fade-out';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Fade In',
  parameters: { description: 'Content that arrives after a load fades in once.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Fade In'
      description='Content that arrives after a load fades in once (150ms, opacity only). useShouldFadeIn skips it when the first render already has the data. FadeOut for content that leaves.'>
      <ExampleSection title='Default' description='Replay with the button.'>
        <FadeInDefault />
      </ExampleSection>
      <ExampleSection
        title='Fade out'
        description={
          <>
            <Code>FadeOut</Code>: 300ms, as the content leaves.
          </>
        }>
        <FadeInFadeOut />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <FadeInDefault /> };
export const FadeOut: Story = {
  name: 'Fade out',
  render: () => <FadeInFadeOut />,
};
