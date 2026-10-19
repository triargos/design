import type { Meta, StoryObj } from '@storybook/react-vite';

import { MobileDropdownMenuDefault } from '../examples/mobile-dropdown-menu/default';
import { ExampleSection, FoundationPage } from '../kit/blocks';
import { open } from '../kit/play';

const meta = {
  title: 'Components/Mobile Dropdown Menu',
  parameters: { description: 'A dropdown menu as a drawer, for touch.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Mobile Dropdown Menu'
      description='A dropdown menu as a drawer, for touch. DropdownMenu switches to it on its own below md; use it directly only for a menu that is always a drawer. A submenu opens a nested drawer.'>
      <ExampleSection title='Default'>
        <MobileDropdownMenuDefault />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = {
  render: () => <MobileDropdownMenuDefault />,
  play: open('click', 'Aktionen', 'Status ändern'),
};
