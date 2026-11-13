import { IconDots, IconPlus, IconUsers } from '@tabler/icons-react';

import { Button } from '~/components/ui/button';
import { ButtonGroup } from '~/components/ui/button-group';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemMedia, ItemTitle } from '~/components/ui/item';

const MEMBERS = [
  { name: 'Jordan Lee', role: 'Admin · Design' },
  { name: 'Sam Rivera', role: 'Engineering' },
  { name: 'Priya Patel', role: 'Design' },
];

/**
 * Header actions are raised sm / icon-sm buttons; an action and its overflow menu join in a `ButtonGroup`. Row actions
 * inside the list stay ghost. Both end on one column.
 */
export function CardWithActions() {
  return (
    <Card className='w-full max-w-xl'>
      <CardHeader
        actions={
          <ButtonGroup>
            <Button size='sm'>
              <IconPlus data-icon='inline-start' />
              Invite
            </Button>
            <Button size='icon-sm' aria-label='More'>
              <IconDots />
            </Button>
          </ButtonGroup>
        }>
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent>
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
