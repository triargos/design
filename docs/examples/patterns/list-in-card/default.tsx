import { IconDots, IconPencil, IconPlus, IconTrash } from '@tabler/icons-react';

import { Avatar, AvatarFallback, getInitials } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemMedia, ItemTitle } from '~/components/ui/item';

const MEMBERS = [
  { name: 'Sarah Kim', email: 'sarah@example.com', role: 'Admin', status: { label: 'Active', intent: 'success' } },
  { name: 'Tom Becker', email: 'tom@example.com', role: 'Member', status: { label: 'Invited', intent: 'warning' } },
  { name: 'Lea Schmidt', email: 'lea@example.com', role: 'Owner', status: { label: 'Active', intent: 'success' } },
] as const;

/**
 * Every list on a page: `CardContent className='overflow-hidden'` around an `ItemList`. The header holds the
 * add action; each row ends in a status and a ghost menu, on one column with the header action.
 */
export function ListInCardDefault() {
  return (
    <Card className='w-full max-w-2xl'>
      <CardHeader
        actions={
          <Button size='sm'>
            <IconPlus data-icon='inline-start' />
            Invite
          </Button>
        }>
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent className='overflow-hidden'>
        <ItemList>
          {MEMBERS.map((member) => (
            <Item key={member.email}>
              <ItemMedia>
                <Avatar size='2xl'>
                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                </Avatar>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{member.name}</ItemTitle>
                <ItemDescription>
                  {member.role} · {member.email}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Badge intent={member.status.intent}>{member.status.label}</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button emphasis='ghost' size='icon-sm' aria-label={`Actions for ${member.name}`} />}>
                    <IconDots />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem>
                      <IconPencil />
                      Change role
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem intent='destructive'>
                      <IconTrash />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ItemActions>
            </Item>
          ))}
        </ItemList>
      </CardContent>
    </Card>
  );
}
