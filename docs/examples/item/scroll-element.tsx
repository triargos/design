import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';

const ACTIONS = ['created a task', 'commented on a task', 'uploaded a document', 'paid an invoice'];
const MEMBERS = ['Maya Chen', 'Jonas Weber', 'Priya Patel', 'Leo Martin', 'Sofia Rossi'];

const ACTIVITY = Array.from({ length: 1000 }, (_, index) => ({
  id: String(index),
  title: `${MEMBERS[index % MEMBERS.length]} ${ACTIONS[index % ACTIONS.length]}`,
  description: `Project Atlas · ${index + 1} min ago`,
}));

/** `scrollElement`: the rows scroll with what holds the list, here a page panel with a title above. */
export function ItemScrollElement() {
  const [panel, setPanel] = useState<HTMLDivElement | null>(null);
  return (
    <div
      ref={setPanel}
      className='h-[28rem] w-full max-w-md overflow-y-auto rounded-card border border-border bg-background'>
      <div className='flex flex-col gap-group p-group'>
        <div className='flex flex-col gap-tight'>
          <h2 className='text-heading'>Activity</h2>
          <p className='text-body text-muted-foreground'>
            Everything in Project Atlas. The list scrolls with the page.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>This week</CardTitle>
          </CardHeader>
          <CardContent className='overflow-hidden'>
            <ItemList
              virtualized
              scrollElement={panel}
              items={ACTIVITY}
              itemKey={(item) => item.id}
              estimatedItemSize={60}>
              {(item) => (
                <Item>
                  <ItemContent>
                    <ItemTitle>{item.title}</ItemTitle>
                    <ItemDescription>{item.description}</ItemDescription>
                  </ItemContent>
                </Item>
              )}
            </ItemList>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
