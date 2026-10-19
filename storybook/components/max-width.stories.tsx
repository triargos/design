import type { Meta, StoryObj } from '@storybook/react-vite';

import { MaxWidthSizes } from '../examples/max-width/sizes';
import { ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Max Width',
  parameters: { description: 'Caps the page column and centers it.', frame: 'page' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Max Width'
      description='Caps the page column inside the panel and centers it. Pick by content: forms read best narrow, tables need room. max-width-layout wraps routes in the default, md.'>
      <ExampleSection title='Sizes' bare>
        <MaxWidthSizes />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Sizes: Story = { render: () => <MaxWidthSizes /> };
