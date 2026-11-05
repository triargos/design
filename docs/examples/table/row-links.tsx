import { IconDots } from '@tabler/icons-react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableRowLink } from '~/components/ui/table';

const PROJECTS = [
  { id: 'website', name: 'Website redesign', lead: 'Maya Chen', status: { label: 'On track', intent: 'success' } },
  { id: 'mobile', name: 'Mobile app', lead: 'Leo Martin', status: { label: 'At risk', intent: 'warning' } },
  { id: 'brand', name: 'Brand refresh', lead: 'Sofia Rossi', status: { label: 'Paused', intent: 'neutral' } },
] as const;

/**
 * `TableRowLink` in the first cell: the whole row opens the project. The menu button sits above the link and opens
 * its own menu.
 */
export function TableRowLinks() {
  return (
    <Card className='w-full max-w-2xl'>
      <Table variant='card'>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Lead</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className='w-px'>
              <span className='sr-only'>Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {PROJECTS.map((project) => (
            <TableRow key={project.id}>
              <TableCell className='font-medium'>
                <TableRowLink href={`#project-${project.id}`}>{project.name}</TableRowLink>
              </TableCell>
              <TableCell>{project.lead}</TableCell>
              <TableCell>
                <Badge intent={project.status.intent}>{project.status.label}</Badge>
              </TableCell>
              <TableCell className='py-1'>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button emphasis='ghost' size='icon-sm' aria-label={`Actions for ${project.name}`}>
                        <IconDots />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem>Rename…</DropdownMenuItem>
                    <DropdownMenuItem>Archive</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem intent='destructive'>Delete…</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
