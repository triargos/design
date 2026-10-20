import type { Meta, StoryObj } from '@storybook/react-vite';

import { SearchInputDefault } from '../examples/search-input/default';
import { ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Search Input',
  parameters: { description: 'A search field with a clear button.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Search Input'
      description='A search field with a clear button. ⌘F focuses it, Escape clears it.'>
      <ExampleSection title='Default'>
        <SearchInputDefault />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <SearchInputDefault /> };
