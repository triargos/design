import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { Item, ItemContent, ItemDescription, ItemTitle } from '~/components/ui/item';
import { VirtualizedList } from '~/components/ui/virtualized-list';

const ACTIONS = ['created a task', 'commented on a task', 'uploaded a document', 'paid an invoice'];
const MEMBERS = ['Maya Chen', 'Jonas Weber', 'Priya Patel', 'Leo Martin', 'Sofia Rossi'];

const ACTIVITY = Array.from({ length: 1000 }, (_, index) => ({
  id: String(index),
  title: `${MEMBERS[index % MEMBERS.length]} ${ACTIONS[index % ACTIONS.length]}`,
  description: `Project Atlas · ${index + 1} min ago`,
}));

/** Only the rows in view render, measured as they mount; the list scrolls itself. */
export function VirtualizedListDefault() {
  return (
    <InsetCard className='w-full max-w-md'>
      <InsetCardHeader>
        <InsetCardTitle>Activity</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='overflow-hidden'>
        <VirtualizedList
          className='h-80'
          items={ACTIVITY}
          itemKey={(item) => item.id}
          estimatedItemSize={60}
          renderItem={(item) => (
            <Item>
              <ItemContent>
                <ItemTitle>{item.title}</ItemTitle>
                <ItemDescription>{item.description}</ItemDescription>
              </ItemContent>
            </Item>
          )}
        />
      </InsetCardContent>
    </InsetCard>
  );
}
