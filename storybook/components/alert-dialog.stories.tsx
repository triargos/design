import type { Meta, StoryObj } from '@storybook/react-vite';
import { screen } from 'storybook/test';

import { AlertDialogCloseConfirmation } from '../examples/alert-dialog/close-confirmation';
import { AlertDialogDefault } from '../examples/alert-dialog/default';
import { AlertDialogDestructive } from '../examples/alert-dialog/destructive';
import { AlertDialogSizes } from '../examples/alert-dialog/sizes';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { open } from '../kit/play';

const meta = {
  title: 'Components/Alert Dialog',
  parameters: { description: 'Asks to confirm before an action that cannot be undone.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Alert Dialog'
      description='Asks to confirm an action before it happens. The header is the card, the actions sit on the shell; no close button. Dialog/Board compares it with Dialog, Sheet and Drawer.'>
      <ExampleSection title='Default'>
        <AlertDialogDefault />
      </ExampleSection>
      <ExampleSection
        title='Sizes'
        description={
          <>
            <Code>size='sm'</Code> with <Code>AlertDialogMedia</Code>: centered, the two actions in equal columns.
          </>
        }>
        <AlertDialogSizes />
      </ExampleSection>
      <ExampleSection
        title='Close confirmation'
        description='Closing a dialog with changes asks first. Type a note, then press Escape.'>
        <AlertDialogCloseConfirmation />
      </ExampleSection>
      <ExampleSection title='Destructive' description='Opened by destructive/subtle, confirmed by destructive/solid.'>
        <AlertDialogDestructive />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = {
  render: () => <AlertDialogDefault />,
  play: open('click', 'Anmeldung einreichen', 'Danach kannst du die Angaben nur noch über das Sekretariat ändern.'),
};
export const Sizes: Story = {
  render: () => <AlertDialogSizes />,
  play: open('click', 'Datei löschen…', 'Elternbrief_März.pdf wird endgültig entfernt.'),
};
export const CloseConfirmation: Story = {
  name: 'Close confirmation',
  render: () => <AlertDialogCloseConfirmation />,
  play: async ({ userEvent }) => {
    await userEvent.click(await screen.findByRole('button', { name: 'Notiz schreiben' }));
    await userEvent.type(await screen.findByLabelText('Notiz'), 'Mia fehlt am Freitag.');
    await userEvent.keyboard('{Escape}');
    await screen.findByText('Notiz verwerfen?');
  },
};
export const Destructive: Story = {
  render: () => <AlertDialogDestructive />,
  play: open('click', 'Ankündigung löschen…', 'Ankündigung löschen?'),
};
