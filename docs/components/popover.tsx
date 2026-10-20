import { ArchiveIcon, CopyIcon, MoreHorizontalIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { type ReactNode } from 'react';

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
import { defineDocs } from '../kit/docs';

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
  { value: 'todo', label: 'To do' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
] as const;

export default defineDocs({
  title: 'Popover',
  description: 'A floating surface for a title, a sentence and one action.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Popover'
      description='Anything that is not a menu or a list, floating one step above the page: a title, a sentence, one action. Menus, popovers and selects share the surface and enter from their trigger.'>
      <FoundationSection
        title='Menu, select or popover'
        description='A menu lists actions: an icon, a label, a shortcut; a destructive item takes intent="destructive" and sits last. A select is a field that opens a list. A popover holds anything else: a title, a sentence, one action.'>
        <div className='grid gap-group md:grid-cols-3'>
          <Stage label={<Code>DropdownMenu</Code>}>
            <DropdownMenu defaultOpen modal={false}>
              <DropdownMenuTrigger render={<Button size='icon-sm' aria-label='Actions' />}>
                <MoreHorizontalIcon />
              </DropdownMenuTrigger>
              <DropdownMenuContent align='start' className='w-56'>
                <DropdownMenuLabel>Website redesign</DropdownMenuLabel>
                <DropdownMenuItem>
                  <PencilIcon />
                  Edit
                  <DropdownMenuShortcut>E</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <CopyIcon />
                  Duplicate
                  <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  <ArchiveIcon />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuCheckboxItem checked>Notifications</DropdownMenuCheckboxItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem intent='destructive'>
                  <Trash2Icon />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </Stage>
          <Stage label={<Code>Select</Code>} height='h-80'>
            <div>
              <Select defaultOpen defaultValue='in-progress' items={STATUSES} modal={false}>
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
              <PopoverTrigger render={<Button size='sm' />}>Deadline</PopoverTrigger>
              <PopoverContent align='start'>
                <PopoverHeader>
                  <PopoverTitle>Extend the deadline</PopoverTitle>
                  <PopoverDescription>Members can submit their tasks until the new date.</PopoverDescription>
                </PopoverHeader>
                <Button intent='primary' size='sm' className='self-end'>
                  Extend
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
});
