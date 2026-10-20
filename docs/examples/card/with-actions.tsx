import { IconDots, IconPlus, IconUsers } from '@tabler/icons-react';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemMedia, ItemTitle } from '~/components/ui/item';

const MEMBERS = [
  { name: 'Jordan Lee', role: 'Admin · Design' },
  { name: 'Sam Rivera', role: 'Engineering' },
  { name: 'Priya Patel', role: 'Design' },
];

/** Header actions are raised xs / icon-xs buttons; row actions inside the list stay ghost. Both end on one column. */
export function CardWithActions() {
  return (
    <Card className='w-full max-w-xl'>
      <CardHeader
        actions={
          <>
            <Button size='xs'>
              <IconPlus data-icon='inline-start' />
              Invite
            </Button>
            <Button size='icon-xs' aria-label='More'>
              <IconDots />
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
                <IconUsers />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{member.name}</ItemTitle>
                <ItemDescription>{member.role}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button emphasis='ghost' size='icon-xs' aria-label={`Actions for ${member.name}`}>
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
