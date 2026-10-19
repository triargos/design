import { MoreHorizontalIcon } from 'lucide-react';

import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';

/** A status and a ghost menu button on the right. */
export function ItemWithActions() {
  return (
    <InsetCard className='w-full max-w-xl'>
      <InsetCardHeader>
        <InsetCardTitle>Erziehungsberechtigte</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='overflow-hidden'>
        <ItemList>
          <Item>
            <ItemContent>
              <ItemTitle>Anna Schmidt</ItemTitle>
              <ItemDescription>anna.schmidt@example.de</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Badge intent='success'>Bestätigt</Badge>
              <Button type='button' intent='neutral' emphasis='ghost' size='icon-xs' aria-label='Mehr'>
                <MoreHorizontalIcon />
              </Button>
            </ItemActions>
          </Item>
          <Item>
            <ItemContent>
              <ItemTitle>Jonas Schmidt</ItemTitle>
              <ItemDescription>jonas.schmidt@example.de</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Badge intent='warning'>Eingeladen</Badge>
              <Button type='button' intent='neutral' emphasis='ghost' size='icon-xs' aria-label='Mehr'>
                <MoreHorizontalIcon />
              </Button>
            </ItemActions>
          </Item>
        </ItemList>
      </InsetCardContent>
    </InsetCard>
  );
}
