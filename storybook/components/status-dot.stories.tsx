import type { Meta, StoryObj } from '@storybook/react-vite';

import { StatusDotVariants } from '../examples/status-dot/variants';
import { StatusDotWithLabel } from '../examples/status-dot/with-label';
import { ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Status Dot',
  parameters: { description: 'A state as a dot in its intent’s hue, next to a label that names it.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Status Dot'
      description='The intent’s hue as a dot, only next to a label that names the state: in dense rows, legends and stats. The dot alone is decorative.'>
      <ExampleSection title='Variants'>
        <StatusDotVariants />
      </ExampleSection>
      <ExampleSection title='With label' description='In a dense row, where a badge would be too loud.'>
        <StatusDotWithLabel />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Variants: Story = { render: () => <StatusDotVariants /> };
export const WithLabel: Story = {
  name: 'With label',
  render: () => <StatusDotWithLabel />,
};
