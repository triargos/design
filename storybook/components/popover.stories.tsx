import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArchiveIcon, CopyIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { type ReactNode } from 'react';
import { screen } from 'storybook/test';

import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '~/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

import { PopoverDefault } from '../examples/popover/default';
import { PopoverPicker } from '../examples/popover/picker';
import { PopoverPositions } from '../examples/popover/positions';
import { Code, ExampleSection, FoundationPage, FoundationSection } from '../kit/blocks';
import { open } from '../kit/play';

/**
 * Every popup shares one surface (`popupSurface`: `rounded-popup bg-popover shadow-popup`, items 4px in with
 * `rounded-inner`) and one entrance (`duration-enter ease-enter`, fade and zoom from 95%). Open on load; non-modal so
 * they can be open together.
 */
const meta = {
  title: 'Components/Popover',
  parameters: { description: 'A floating surface for a title, a sentence and one action.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

/** Room under the trigger for the open popup, on the page surface the popup portals to. */
function Stage({ label, height = 'h-80', children }: { label: ReactNode; height?: string; children: ReactNode }) {
  return (
    <div className='flex flex-col gap-related'>
      <div className='text-caption text-muted-foreground'>{label}</div>
      <div className={`${height} rounded-card p-group shadow-border`}>{children}</div>
    </div>
  );
}

const STATUSES = [
  { value: 'open', label: 'Offen' },
  { value: 'review', label: 'In Prüfung' },
  { value: 'done', label: 'Erledigt' },
] as const;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Popover'
      description='Anything that is not a menu or a list, floating one step above the page: a title, a sentence, one action. Menus, popovers and selects share the surface and enter from their trigger.'>
      <FoundationSection
        title='Menu, select or popover'
        description='A menu lists actions: an icon, a label, a shortcut; a destructive item takes intent="destructive" and sits last. A select is a field that opens a list. A popover holds anything else: a title, a sentence, one action.'>
        <div className='grid gap-group md:grid-cols-3'>
          <Stage label={<Code>DropdownMenu</Code>}>
            <DropdownMenu defaultOpen modal={false}>
              <DropdownMenuTrigger
                render={
                  <Button type='button' intent='neutral' emphasis='raised' size='icon-sm' aria-label='Aktionen' />
                }>
                <MoreHorizontalIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className='w-56'>
                <DropdownMenuLabel>Antrag 2024-118</DropdownMenuLabel>
                <DropdownMenuItem>
                  <PencilIcon />
                  Bearbeiten
                  <DropdownMenuShortcut>E</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CopyIcon />
                  Duplizieren
                  <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <ArchiveIcon />
                  Archivieren
                </DropdownMenuItem>
                <DropdownMenuCheckboxItem checked>Benachrichtigungen</DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem intent='destructive'>
                  <Trash2Icon />
                  Löschen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Stage>
          <Stage label={<Code>Select</Code>} height='h-80'>
            <div>
              <Select defaultOpen defaultValue='review' items={STATUSES} modal={false}>
                <SelectTrigger aria-label='Status'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </Stage>
          <Stage label={<Code>Popover</Code>} height='h-80'>
            <Popover defaultOpen modal={false}>
              <PopoverTrigger render={<Button type='button' intent='neutral' emphasis='raised' size='sm' />}>
                Frist
              </PopoverTrigger>
              <PopoverContent align='start'>
                <PopoverHeader>
                  <PopoverTitle>Frist verlängern</PopoverTitle>
                  <PopoverDescription>Eltern können bis zum neuen Datum noch Anträge stellen.</PopoverDescription>
                </PopoverHeader>
                <Button type='button' size='sm' className='self-end'>
                  Verlängern
                </Button>
              </PopoverContent>
            </Popover>
          </Stage>
        </div>
      </FoundationSection>
      <ExampleSection title='Default'>
        <PopoverDefault />
      </ExampleSection>
      <ExampleSection
        title='Picker'
        description={
          <>
            A <Code>PickerTrigger</Code> that opens a calendar: the shape of every picker.
          </>
        }>
        <PopoverPicker />
      </ExampleSection>
      <ExampleSection
        title='Positions'
        description={
          <>
            <Code>side</Code> picks the edge; it flips away from the viewport edge.
          </>
        }>
        <PopoverPositions />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <PopoverDefault />, play: open('click', 'Frist', 'Frist verlängern') };
export const Picker: Story = {
  render: () => <PopoverPicker />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByText('14. März 2025'));
    await screen.findByRole('grid');
  },
};
export const Positions: Story = { render: () => <PopoverPositions />, play: open('click', 'Rechts', 'Öffnet rechts.') };
