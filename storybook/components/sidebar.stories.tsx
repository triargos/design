import type { Meta, StoryObj } from '@storybook/react-vite';

import { SidebarCollapsed } from '../examples/sidebar/collapsed';
import { SidebarDefault } from '../examples/sidebar/default';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Sidebar',
  parameters: {
    description: 'The app navigation: the sidebar on the shell, the page panel beside it.',
    frame: 'page',
  },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Sidebar'
      description='The app navigation: the sidebar on the shell, the page panel beside it. Groups of links with an active state, counts and one level of sub-links. On mobile the sidebar is a sheet the trigger opens: shoot with --mobile.'>
      <ExampleSection title='Default' bare>
        <SidebarDefault />
      </ExampleSection>
      <ExampleSection
        title='Collapsed'
        description={
          <>
            <Code>collapsible='icon'</Code>, closed: icons only. The trigger or ⌘[ toggles it.
          </>
        }
        bare>
        <SidebarCollapsed />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <SidebarDefault /> };
export const Collapsed: Story = { render: () => <SidebarCollapsed /> };
