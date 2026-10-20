import { IconDownload, IconMail, IconTrash, IconX } from '@tabler/icons-react';
import { useRef, useState } from 'react';

import { ActionBar } from '~/components/ui/action-bar';
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
import { Card, CardHeader, CardTitle } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
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
 * selected. The bar holds two groups behind a hairline: the selection (the count in muted text, clear as a ghost ✕)
 * and the actions, each a raised button with its label, Delete… last as a subtle destructive that asks in an alert
 * dialog. In a container under 32rem the labels go to screen readers and the actions become icons.
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
  // The bar springs out after a clear; it keeps the last count instead of reading "0 selected" on the way.
  const lastCount = useRef(selected.size);
  if (selected.size > 0) lastCount.current = selected.size;
  const count = lastCount.current;

  return (
    <div className='@container flex w-full max-w-2xl flex-col gap-group'>
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
      <ActionBar open={selected.size > 0} aria-label='Selection'>
        <span className='ps-2.5 whitespace-nowrap text-muted-foreground tabular-nums'>{count} selected</span>
        <Button emphasis='ghost' size='icon' aria-label='Clear selection' onClick={clear}>
          <IconX />
        </Button>
        <Separator orientation='vertical' className='my-1.5' />
        {/* No `data-icon`: its padding would outweigh the square icon-only size below 32rem. */}
        <Button className='@max-lg:w-9 @max-lg:px-0'>
          <IconMail />
          <span className='@max-lg:sr-only'>Send reminder</span>
        </Button>
        <Button className='@max-lg:w-9 @max-lg:px-0'>
          <IconDownload />
          <span className='@max-lg:sr-only'>Export</span>
        </Button>
        <Button
          intent='destructive'
          emphasis='subtle'
          className='@max-lg:w-9 @max-lg:px-0'
          onClick={() => setConfirming(true)}>
          <IconTrash />
          <span className='@max-lg:sr-only'>Delete…</span>
        </Button>
      </ActionBar>
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
