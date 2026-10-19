import type { Meta, StoryObj } from '@storybook/react-vite';
import { screen } from 'storybook/test';

import { SettingsFormDefault } from '../examples/patterns/settings-form/default';
import { ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Patterns/Settings Form',
  parameters: { description: 'Fields in a card, saved through the Bottom Float Menu.', frame: 'column' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Settings Form'
      description='A settings page: fields in an Inset Card, bound with react-hook-form, saved through UnsavedChangesToast (a Bottom Float Menu). Edit a field: the bar grows in. Zurücksetzen restores the values; Speichern spins for a second, shows Gespeichert, then leaves.'>
      <ExampleSection title='Default' bare>
        <SettingsFormDefault />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = {
  render: () => <SettingsFormDefault />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(canvas.getByLabelText('Name'), ' Nord');
    await screen.findByText('Zurücksetzen');
  },
};
