import { ArrowLeftIcon, CircleDotIcon, CommandIcon, DownloadIcon, MailIcon, Trash2Icon, XIcon } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '~/components/ui/badge';
import {
  BottomFloatMenu,
  type BottomFloatMenuDismissReason,
  BottomFloatMenuItem,
  type BottomFloatMenuPanel,
  BottomFloatMenuRow,
} from '~/components/ui/bottom-float-menu';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { InsetCard, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
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

type Panel = 'actions' | 'delete' | null;

/**
 * Select rows, act on all of them: a checkbox column with select-all, and a Bottom Float Menu while anything is
 * selected. The bar reads by weight: the count as text, "Actions" (every action, in a panel) as the one raised
 * button, a quick action as a raised icon, and clear as a quiet ✕ at the end. Deleting asks in its own panel level.
 */
export function BulkSelectionDefault() {
  const [rows, setRows] = useState<ReadonlyArray<(typeof TASKS)[number]>>(TASKS);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set(['1', '3']));
  const [panel, setPanel] = useState<Panel>(null);
  const all = rows.length > 0 && selected.size === rows.length;
  const toggle = (id: string, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  const clear = () => {
    setPanel(null);
    setSelected(new Set());
  };

  const actions: BottomFloatMenuPanel = {
    key: 'actions',
    label: 'Actions',
    content: (
      <>
        <BottomFloatMenuRow icon={<MailIcon />} onClick={() => setPanel(null)}>
          Send reminder
        </BottomFloatMenuRow>
        <BottomFloatMenuRow icon={<CircleDotIcon />} onClick={() => setPanel(null)}>
          Change status
        </BottomFloatMenuRow>
        <BottomFloatMenuRow icon={<DownloadIcon />} onClick={() => setPanel(null)}>
          Export
        </BottomFloatMenuRow>
        <BottomFloatMenuRow icon={<Trash2Icon />} opensPanel onClick={() => setPanel('delete')}>
          Delete
        </BottomFloatMenuRow>
      </>
    ),
  };
  const confirmDelete: BottomFloatMenuPanel = {
    key: 'delete',
    label: `Delete ${tasks(selected.size)}`,
    content: (
      <>
        <BottomFloatMenuRow icon={<ArrowLeftIcon />} onClick={() => setPanel('actions')}>
          Back
        </BottomFloatMenuRow>
        <div className='p-1'>
          <Button
            intent='destructive'
            className='w-full'
            onClick={() => {
              setRows((current) => current.filter((row) => !selected.has(row.id)));
              clear();
            }}>
            <Trash2Icon data-icon='inline-start' />
            Delete {tasks(selected.size)}
          </Button>
        </div>
      </>
    ),
  };
  const dismiss = (reason: BottomFloatMenuDismissReason) =>
    setPanel((current) => (reason === 'escape' && current === 'delete' ? 'actions' : null));

  return (
    <>
      <InsetCard className='w-full max-w-2xl'>
        <InsetCardHeader>
          <InsetCardTitle>Tasks</InsetCardTitle>
        </InsetCardHeader>
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
      </InsetCard>
      <BottomFloatMenu
        show={selected.size > 0}
        label='Selection'
        panel={panel === 'actions' ? actions : panel === 'delete' ? confirmDelete : null}
        onPanelDismiss={dismiss}>
        <span className='ps-4 pe-1 tabular-nums'>{selected.size} selected</span>
        <BottomFloatMenuItem>
          <Button onClick={() => setPanel('actions')}>
            <CommandIcon data-icon='inline-start' />
            Actions
          </Button>
        </BottomFloatMenuItem>
        <BottomFloatMenuItem>
          <Button size='icon-lg' aria-label='Send reminder'>
            <MailIcon />
          </Button>
        </BottomFloatMenuItem>
        <BottomFloatMenuItem>
          <Button emphasis='ghost' size='icon-lg' aria-label='Clear selection' onClick={clear}>
            <XIcon />
          </Button>
        </BottomFloatMenuItem>
      </BottomFloatMenu>
    </>
  );
}
