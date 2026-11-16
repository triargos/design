import { IconDots } from '@tabler/icons-react';

import { Avatar, AvatarFallback, getInitials } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemActions, ItemContent, ItemList, ItemMedia, ItemTitle } from '~/components/ui/item';

const MEMBERS = [
  { name: 'Sarah Kim', status: { label: 'Active', intent: 'success' } },
  { name: 'Tom Becker', status: { label: 'Invited', intent: 'warning' } },
  { name: 'Lea Schmidt', status: { label: 'Active', intent: 'success' } },
] as const;

/** A title alone: the actions stay on the row's line, on a phone too. */
export function ItemCompact() {
  return (
    <Card className='w-full max-w-xl'>
      <CardHeader>
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent>
        <ItemList>
          {MEMBERS.map((member) => (
            <Item key={member.name}>
              <ItemMedia optional>
                <Avatar>
                  <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
                </Avatar>
              </ItemMedia>

              <ItemContent>
                <ItemTitle>{member.name}</ItemTitle>
              </ItemContent>
              <ItemActions>
                <Badge intent={member.status.intent}>{member.status.label}</Badge>
                <Button emphasis='ghost' size='icon-sm' aria-label={`Actions for ${member.name}`}>
                  <IconDots />
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemList>
      </CardContent>
    </Card>
  );
}
