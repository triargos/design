import { CircleDotIcon, DownloadIcon, MailIcon, MoreHorizontalIcon, Trash2Icon, XIcon } from 'lucide-react';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Card, CardHeader, CardTitle } from '~/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';

const TASKS = [
  {
    id: '1',
    title: 'Update pricing page',
    project: 'Website redesign',
    status: { label: 'In review', intent: 'warning' },
  },
  { id: '2', title: 'Write launch post', project: 'Website redesign', status: { label: 'New', intent: 'info' } },
  { id: '3', title: 'Fix login redirect', project: 'Mobile app', status: { label: 'New', intent: 'info' } },
  { id: '4', title: 'Send onboarding emails', project: 'Mobile app', status: { label: 'Done', intent: 'success' } },
] as const;

const tasks = (count: number) => `${count} ${count === 1 ? 'task' : 'tasks'}`;

/**
 * Select rows, act on all of them: a checkbox column with select-all, and a bar below the table while anything is
 * selected. The bar reads by weight: the count as text, "Actions" (every action, in a menu) as the one raised
 * button, a quick action as a raised icon, and clear as a quiet ✕ at the end. Deleting asks in an alert dialog.
 */
export function BulkSelectionDefault() {
  const [rows, setRows] = useState<ReadonlyArray<(typeof TASKS)[number]>>(TASKS);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set(['1', '3']));
  const [confirming, setConfirming] = useState(false);
  const all = rows.length > 0 && selected.size === rows.length;
  const toggle = (id: string, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  const clear = () => setSelected(new Set());

  return (
    <div className='flex w-full max-w-2xl flex-col gap-group'>
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <Table variant='card'>
          <TableHeader>
            <TableRow>
              <TableHead className='w-10'>
                <Checkbox
                  aria-label='Select all'
                  checked={all}
                  indeterminate={selected.size > 0 && !all}
                  onCheckedChange={(checked) => setSelected(new Set(checked ? rows.map((row) => row.id) : []))}
                />
              </TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} selected={selected.has(row.id)}>
                <TableCell>
                  <Checkbox
                    aria-label={`Select ${row.title}`}
                    checked={selected.has(row.id)}
                    onCheckedChange={(checked) => toggle(row.id, checked)}
                  />
                </TableCell>
                <TableCell className='font-medium'>{row.title}</TableCell>
                <TableCell>{row.project}</TableCell>
                <TableCell>
                  <Badge intent={row.status.intent}>{row.status.label}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      {selected.size > 0 && (
        <div
          role='toolbar'
          aria-label='Selection'
          data-surface='popup'
          className='sticky bottom-4 flex items-center gap-1 self-center rounded-popup bg-popover p-1 text-control text-popover-foreground shadow-popup duration-enter ease-enter animate-in fade-in-0 slide-in-from-bottom-2'>
          <span className='ps-3 pe-1 tabular-nums'>{selected.size} selected</span>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button />}>
              <MoreHorizontalIcon data-icon='inline-start' />
              Actions
            </DropdownMenuTrigger>
            <DropdownMenuContent side='top' className='w-48'>
              <DropdownMenuItem>
                <MailIcon />
                Send reminder
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CircleDotIcon />
                Change status
              </DropdownMenuItem>
              <DropdownMenuItem>
                <DownloadIcon />
                Export
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem intent='destructive' onClick={() => setConfirming(true)}>
                <Trash2Icon />
                Delete…
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size='icon' aria-label='Send reminder'>
            <MailIcon />
          </Button>
          <Button emphasis='ghost' size='icon' aria-label='Clear selection' onClick={clear}>
            <XIcon />
          </Button>
        </div>
      )}
      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {tasks(selected.size)}?</AlertDialogTitle>
            <AlertDialogDescription>Their comments and files are deleted for everyone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              intent='destructive'
              onClick={() => {
                setRows((current) => current.filter((row) => !selected.has(row.id)));
                clear();
                setConfirming(false);
              }}>
              Delete {tasks(selected.size)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
