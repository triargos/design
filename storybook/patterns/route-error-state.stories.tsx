import type { Meta, StoryObj } from '@storybook/react-vite';

import { RouteErrorState } from '~/components/error/route-error-state';

const meta = {
  title: 'Patterns/Route Error State',
  parameters: { description: 'The error a route shows when its data fails, sorted by the failure.', frame: 'column' },
  component: RouteErrorState,
} satisfies Meta<typeof RouteErrorState>;

export default meta;

type Story = StoryObj<typeof meta>;

// Shapes `RouteErrorState` sorts by `_tag`, as a squashed atom failure would arrive.
export const NoConnection: Story = {
  args: { error: { _tag: 'RequestError', reason: 'Transport' } },
};

export const SessionExpired: Story = {
  args: { error: { _tag: 'UnauthorizedError', message: 'Unauthorized' } },
};
