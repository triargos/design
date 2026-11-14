import { IconPlus } from '@tabler/icons-react';
import * as React from 'react';

import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Item, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';

const STATUSES = ['Anwesend', 'Krank'] as const;

/**
 * `+` in the header opens a new row whose input takes focus as it mounts; pressed again, it closes the row. The list
 * springs to its new height each time.
 */
export function ListInCardAddRow() {
  const [adding, setAdding] = React.useState(false);

  return (
    <Card className='w-full max-w-2xl'>
      <CardHeader
        actions={
          <Button size='icon-sm' aria-label='Add status' aria-pressed={adding} onClick={() => setAdding(!adding)}>
            <IconPlus />
          </Button>
        }>
        <CardTitle>Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ItemList>
          {STATUSES.map((status, index) => (
            <Item key={status}>
              <ItemContent>
                <ItemTitle>{status}</ItemTitle>
                <ItemDescription>Status #{index + 1}</ItemDescription>
              </ItemContent>
            </Item>
          ))}
          {adding && (
            <Item key='new'>
              <ItemContent>
                <Input autoFocus placeholder='New status' aria-label='New status' />
              </ItemContent>
            </Item>
          )}
        </ItemList>
      </CardContent>
    </Card>
  );
}
