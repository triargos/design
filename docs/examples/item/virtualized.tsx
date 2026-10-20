import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemContent, ItemDescription, ItemTitle, ItemList } from '~/components/ui/item';

const ACTIONS = ['created a task', 'commented on a task', 'uploaded a document', 'paid an invoice'];
const MEMBERS = ['Maya Chen', 'Jonas Weber', 'Priya Patel', 'Leo Martin', 'Sofia Rossi'];

const ACTIVITY = Array.from({ length: 1000 }, (_, index) => ({
  id: String(index),
  title: `${MEMBERS[index % MEMBERS.length]} ${ACTIONS[index % ACTIONS.length]}`,
  description: `Project Atlas · ${index + 1} min ago`,
}));

/** Only the rows in view render, measured as they mount; the list scrolls itself. */
export function ItemVirtualized() {
  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent className='overflow-hidden'>
        <ItemList virtualized className='h-80' items={ACTIVITY} itemKey={(item) => item.id} estimatedItemSize={60}>
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
  );
}
