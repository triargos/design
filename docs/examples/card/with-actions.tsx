import { MoreHorizontalIcon, PlusIcon, UsersIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemMedia, ItemTitle } from '~/components/ui/item';

const MEMBERS = [
  { name: 'Jordan Lee', role: 'Admin · Design' },
  { name: 'Sam Rivera', role: 'Engineering' },
  { name: 'Priya Patel', role: 'Design' },
];

/** Header actions take xs / icon-xs buttons and end on the column of the row actions below. */
export function CardWithActions() {
  return (
    <Card className='w-full max-w-xl'>
      <CardHeader
        actions={
          <>
            <Button emphasis='ghost' size='xs'>
              <PlusIcon data-icon='inline-start' />
              Invite
            </Button>
            <Button emphasis='ghost' size='icon-xs' aria-label='More'>
              <MoreHorizontalIcon />
            </Button>
          </>
        }>
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent className='overflow-hidden'>
        <ItemList>
          {MEMBERS.map((member) => (
            <Item key={member.name}>
              <ItemMedia variant='icon'>
                <UsersIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{member.name}</ItemTitle>
                <ItemDescription>{member.role}</ItemDescription>
              </ItemContent>
              <ItemActions>
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
