import { IconFolder } from '@tabler/icons-react';
import { Fragment, useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { Card } from '~/components/ui/card';
import { Table, TableBody, TableCell, TableGroupRow, TableHead, TableHeader, TableRow } from '~/components/ui/table';

const PROJECTS = [
  {
    id: 'website',
    name: 'Website redesign',
    tasks: [
      {
        id: '1',
        title: 'Update pricing page',
        assignee: 'Maya Chen',
        status: { label: 'In review', intent: 'warning' },
      },
      { id: '2', title: 'Write launch post', assignee: 'Jonas Weber', status: { label: 'New', intent: 'info' } },
      { id: '3', title: 'Swap hero images', assignee: 'Priya Patel', status: { label: 'Done', intent: 'success' } },
    ],
  },
  {
    id: 'mobile',
    name: 'Mobile app',
    tasks: [
      { id: '4', title: 'Fix login redirect', assignee: 'Leo Martin', status: { label: 'New', intent: 'info' } },
      {
        id: '5',
        title: 'Push notifications',
        assignee: 'Sofia Rossi',
        status: { label: 'In review', intent: 'warning' },
      },
    ],
  },
] as const;

const COLUMNS = 3;

/**
 * `TableGroupRow` names the rows after it: an icon, the name, a count pill. With `onOpenChange` it folds them, and the
 * call site leaves them out.
 */
export function TableGroupedRows() {
  const [closed, setClosed] = useState<ReadonlySet<string>>(new Set());
  const setOpen = (id: string, open: boolean) =>
    setClosed((current) => {
      const next = new Set(current);
      if (open) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <Card className='w-full max-w-2xl'>
      <Table variant='card'>
        <TableHeader>
          <TableRow>
            <TableHead>Task</TableHead>
            <TableHead>Assignee</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {PROJECTS.map((project) => {
            const open = !closed.has(project.id);
            return (
              <Fragment key={project.id}>
                <TableGroupRow colSpan={COLUMNS} open={open} onOpenChange={(next) => setOpen(project.id, next)}>
                  <IconFolder aria-hidden className='size-4 shrink-0 text-muted-foreground' />
                  {project.name}
                  <Badge size='sm' shape='pill' className='tabular-nums'>
                    {project.tasks.length}
                  </Badge>
                </TableGroupRow>
                {open &&
                  project.tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className='font-medium'>{task.title}</TableCell>
                      <TableCell>{task.assignee}</TableCell>
                      <TableCell>
                        <Badge intent={task.status.intent}>{task.status.label}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
