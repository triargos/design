import { IconPencil, IconTrash } from '@tabler/icons-react';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Item, ItemActions, ItemContent, ItemMedia } from '~/components/ui/item';
import { SortableItemHandle, SortableItemList } from '~/components/ui/sortable';

const LISTS = [
  { value: 'diet', name: 'Diet', values: ['Vegetarian', 'Vegan', 'Halal'] },
  { value: 'size', name: 'T-shirt size', values: ['S', 'M', 'L'] },
] as const;

/**
 * `actions` on the trigger: the item's buttons on its line, beside the trigger. Open, an `ItemList` starts on the
 * row's edge; `Input emphasis='ghost'` edits the values in place.
 */
export function AccordionWithActions() {
  return (
    <Card className='w-full max-w-lg'>
      <CardContent>
        <Accordion variant='flush' defaultValue={['diet']}>
          {LISTS.map((list) => (
            <AccordionItem key={list.value} value={list.value}>
              <AccordionTrigger
                actions={
                  <>
                    <Button intent='neutral' emphasis='ghost' size='icon-sm' aria-label={`Rename ${list.name}`}>
                      <IconPencil />
                    </Button>
                    <Button intent='neutral' emphasis='ghost' size='icon-sm' aria-label={`Delete ${list.name}`}>
                      <IconTrash />
                    </Button>
                  </>
                }>
                <span className='flex min-w-0 flex-col gap-tight'>
                  <span className='truncate'>{list.name}</span>
                  <span className='truncate font-normal text-muted-foreground'>{list.values.join(' · ')}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <SortableItemList items={list.values} itemKey={(value) => value} onReorder={() => {}}>
                  {(value) => (
                    <Item>
                      <ItemMedia>
                        <SortableItemHandle aria-label={`Move ${value}`} />
                      </ItemMedia>
                      <ItemContent>
                        <Input emphasis='ghost' aria-label='Value' defaultValue={value} />
                      </ItemContent>
                      <ItemActions>
                        <Button intent='neutral' emphasis='ghost' size='icon-sm' aria-label={`Delete ${value}`}>
                          <IconTrash />
                        </Button>
                      </ItemActions>
                    </Item>
                  )}
                </SortableItemList>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
