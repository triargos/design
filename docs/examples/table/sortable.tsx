import { useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { Card } from '~/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, type TableSort } from '~/components/ui/table';

const MEMBERS = [
  { id: '1', name: 'Maya Chen', role: 'Admin', tasks: 14, joined: '2024-02-12' },
  { id: '2', name: 'Jonas Weber', role: 'Member', tasks: 9, joined: '2023-11-03' },
  { id: '3', name: 'Priya Patel', role: 'Member', tasks: 21, joined: '2024-06-27' },
  { id: '4', name: 'Leo Martin', role: 'Guest', tasks: 2, joined: '2025-01-15' },
  { id: '5', name: 'Sofia Rossi', role: 'Admin', tasks: 17, joined: '2022-09-30' },
] as const;

type Member = (typeof MEMBERS)[number];
type SortKey = 'name' | 'tasks' | 'joined';

const compare: Record<SortKey, (a: Member, b: Member) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  tasks: (a, b) => a.tasks - b.tasks,
  joined: (a, b) => a.joined.localeCompare(b.joined),
};

const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' });

/** `TableHead sort onSort`: the header is a button, the cell carries `aria-sort`; the call site sorts the rows. */
export function TableSortable() {
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'name', dir: 'asc' });
  const sortOf = (key: SortKey): TableSort => (sort.key === key ? sort.dir : 'none');
  // A new column starts ascending; the sort column turns over.
  const toggle = (key: SortKey) =>
    setSort((current) => ({ key, dir: current.key === key && current.dir === 'asc' ? 'desc' : 'asc' }));
  const rows = [...MEMBERS].sort((a, b) => (sort.dir === 'asc' ? 1 : -1) * compare[sort.key](a, b));

  return (
    <Card className='w-full max-w-2xl'>
      <Table variant='card'>
        <TableHeader>
          <TableRow>
            <TableHead sort={sortOf('name')} onSort={() => toggle('name')}>
              Member
            </TableHead>
            <TableHead>Role</TableHead>
            <TableHead className='text-right' sort={sortOf('tasks')} onSort={() => toggle('tasks')}>
              Open tasks
            </TableHead>
            <TableHead className='text-right' sort={sortOf('joined')} onSort={() => toggle('joined')}>
              Joined
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((member) => (
            <TableRow key={member.id}>
              <TableCell className='font-medium'>{member.name}</TableCell>
              <TableCell>
                <Badge>{member.role}</Badge>
              </TableCell>
              <TableCell className='text-right tabular-nums'>{member.tasks}</TableCell>
              <TableCell className='text-right text-muted-foreground tabular-nums'>
                {date.format(new Date(member.joined))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
