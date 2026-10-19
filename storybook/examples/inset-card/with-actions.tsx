import { MoreHorizontalIcon, PlusIcon, UsersIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemMedia, ItemTitle } from '~/components/ui/item';

const MEMBERS = [
  { name: 'Erika Mustermann', role: 'Klasse 5a · Elternvertretung' },
  { name: 'Max Mustermann', role: 'Klasse 7b' },
  { name: 'Lea Schmidt', role: 'Klasse 5a' },
];

/** Header actions take xs / icon-xs buttons and end on the column of the row actions below. */
export function InsetCardWithActions() {
  return (
    <InsetCard className='w-full max-w-xl'>
      <InsetCardHeader
        actions={
          <>
            <Button type='button' intent='neutral' emphasis='ghost' size='xs'>
              <PlusIcon data-icon='inline-start' />
              Hinzufügen
            </Button>
            <Button type='button' intent='neutral' emphasis='ghost' size='icon-xs' aria-label='Mehr'>
              <MoreHorizontalIcon />
            </Button>
          </>
        }>
        <InsetCardTitle>Mitglieder</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='overflow-hidden'>
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
                <Button type='button' intent='neutral' emphasis='ghost' size='icon-xs' aria-label='Mehr'>
                  <MoreHorizontalIcon />
                </Button>
              </ItemActions>
            </Item>
          ))}
        </ItemList>
      </InsetCardContent>
    </InsetCard>
  );
}
