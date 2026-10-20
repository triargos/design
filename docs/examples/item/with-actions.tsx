import { MoreHorizontalIcon } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';

const MEMBERS = [
  { name: 'Jordan Lee', email: 'jordan@acme.com', status: { label: 'Active', intent: 'success' } },
  { name: 'Sam Rivera', email: 'sam@acme.com', status: { label: 'Invited', intent: 'warning' } },
] as const;

/** A status and a ghost menu button on the right. */
export function ItemWithActions() {
  return (
    <Card className='w-full max-w-xl'>
      <CardHeader>
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent className='overflow-hidden'>
        <ItemList>
          {MEMBERS.map((member) => (
            <Item key={member.email}>
              <ItemContent>
                <ItemTitle>{member.name}</ItemTitle>
                <ItemDescription>{member.email}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Badge intent={member.status.intent}>{member.status.label}</Badge>
                <Button emphasis='ghost' size='icon-xs' aria-label={`Actions for ${member.name}`}>
                  <MoreHorizontalIcon />
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemList>
      </CardContent>
    </Card>
  );
}
