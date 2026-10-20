import { MoreHorizontalIcon, PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react';

import { Avatar, AvatarFallback, getInitials } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemMedia, ItemTitle } from '~/components/ui/item';

const FIRST = ['Sarah', 'Tom', 'Lea', 'Jonas', 'Priya', 'Leo', 'Sofia', 'Noah', 'Emma', 'Omar'];
const LAST = ['Kim', 'Becker', 'Schmidt', 'Weber', 'Patel', 'Martin', 'Rossi', 'Larsen', 'Haddad', 'Chen'];
const ROLES = ['Member', 'Member', 'Member', 'Admin'] as const;

/** 500 members, the same every time: 10 first names × 10 last names, then numbered rounds. */
const MEMBERS = Array.from({ length: 500 }, (_, index) => {
  const name = `${FIRST[index % 10]} ${LAST[Math.floor(index / 10) % 10]}`;
  const round = Math.floor(index / 100);
  return {
    id: String(index),
    name: round === 0 ? name : `${name} ${round + 1}`,
    email: `member${index + 1}@example.com`,
    role: ROLES[index % ROLES.length]!,
    invited: index % 7 === 3,
  };
});

/**
 * The same card and rows for a long list: `ItemList virtualized` with the members and a height. Only the rows in view
 * render; the header stays put while the rows scroll.
 */
export function ListInCardVirtualized() {
  return (
    <Card className='w-full max-w-2xl'>
      <CardHeader
        actions={
          <Button emphasis='ghost' size='xs'>
            <PlusIcon data-icon='inline-start' />
            Invite
          </Button>
        }>
        <CardTitle>{MEMBERS.length} members</CardTitle>
      </CardHeader>
      <CardContent className='overflow-hidden'>
        <ItemList virtualized items={MEMBERS} itemKey={(member) => member.id} className='h-96'>
          {(member) => (
            <Item>
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
                <Badge intent={member.invited ? 'warning' : 'success'}>{member.invited ? 'Invited' : 'Active'}</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={<Button emphasis='ghost' size='icon-xs' aria-label={`Actions for ${member.name}`} />}>
                    <MoreHorizontalIcon />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem>
                      <PencilIcon />
                      Change role
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem intent='destructive'>
                      <Trash2Icon />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ItemActions>
            </Item>
          )}
        </ItemList>
      </CardContent>
    </Card>
  );
}
