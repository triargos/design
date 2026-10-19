import { FileTextIcon } from 'lucide-react';

import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { Item, ItemContent, ItemDescription, ItemList, ItemMedia, ItemTitle } from '~/components/ui/item';

/** `ItemMedia variant='icon'`; an Avatar for people. */
export function ItemWithMedia() {
  return (
    <InsetCard className='w-full max-w-xl'>
      <InsetCardHeader>
        <InsetCardTitle>Nachweise</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='overflow-hidden'>
        <ItemList>
          <Item>
            <ItemMedia variant='icon'>
              <FileTextIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Arbeitgeberbescheinigung.pdf</ItemTitle>
              <ItemDescription>Hochgeladen am 12. März</ItemDescription>
            </ItemContent>
          </Item>
          <Item>
            <ItemMedia variant='icon'>
              <FileTextIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Meldebescheinigung.pdf</ItemTitle>
            </ItemContent>
          </Item>
        </ItemList>
      </InsetCardContent>
    </InsetCard>
  );
}
