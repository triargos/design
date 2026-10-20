import { useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { Card } from '~/components/ui/card';
import { Table, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';

const ROLES = [
  { label: 'Admin', intent: 'primary' },
  { label: 'Member', intent: 'neutral' },
  { label: 'Guest', intent: 'neutral' },
] as const;
const FIRST = ['Maya', 'Jonas', 'Priya', 'Leo', 'Sofia', 'Amir', 'Hana', 'Lukas'];
const LAST = ['Chen', 'Weber', 'Patel', 'Martin', 'Rossi', 'Khan', 'Sato', 'Novak'];

const MEMBERS = Array.from({ length: 500 }, (_, index) => {
  const first = FIRST[index % FIRST.length]!;
  const last = LAST[Math.floor(index / FIRST.length) % LAST.length]!;
  return {
    id: String(index),
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${index}@acme.com`,
    role: ROLES[index % 7 === 0 ? 0 : index % 3 === 0 ? 2 : 1]!,
  };
});

/**
 * `scrollElement`: the rows scroll with what holds the table, here a page panel with a title above; the header
 * sticks to its top. The table does not scroll sideways, so the columns fit the width.
 */
export function TableScrollElement() {
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  return (
    // The panel scrolls and pads nothing at the top, so the header sticks to its edge; the content pads inside.
    <div
      ref={setPanel}
      className='h-[28rem] w-full max-w-2xl overflow-y-auto rounded-card border border-border bg-background'>
      <div className='flex flex-col gap-group p-group pt-0'>
        <div className='flex flex-col gap-tight pt-group'>
          <h2 className='text-heading'>Members</h2>
          <p className='text-body text-muted-foreground'>
            {MEMBERS.length} people in Acme. The list scrolls with the page.
          </p>
        </div>
        <Card>
          <Table
            virtualized
            variant='card'
            scrollElement={panel}
            aria-label='Members'
            items={MEMBERS}
            itemKey={(member) => member.id}
            estimatedItemSize={64}
            header={
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead className='w-28'>Role</TableHead>
                </TableRow>
              </TableHeader>
            }>
            {(member) => (
              <TableRow>
                <TableCell>
                  <div className='flex min-w-0 flex-col gap-tight'>
                    <span className='truncate font-medium'>{member.name}</span>
                    <span className='truncate text-muted-foreground'>{member.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge intent={member.role.intent}>{member.role.label}</Badge>
                </TableCell>
              </TableRow>
            )}
          </Table>
        </Card>
      </div>
    </div>
  );
}
