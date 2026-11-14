import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemChevron, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';

const SHORT = ['Class 1', 'Class 6'];
const LONG = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const List = ({ rows }: { rows: ReadonlyArray<string> }) => (
  <ItemList>
    {rows.map((row) => (
      <Item key={row} render={<a href='#stretched' />}>
        <ItemContent>
          <ItemTitle>{row}</ItemTitle>
          <ItemDescription>Opened today</ItemDescription>
        </ItemContent>
        <ItemChevron />
      </Item>
    ))}
  </ItemList>
);

/** Cards in a grid row take the row's height; the content grows, the header keeps its own. No class on the card. */
export function CardStretched() {
  return (
    <div className='grid w-full max-w-3xl gap-group md:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle>Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <List rows={SHORT} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Absences</CardTitle>
        </CardHeader>
        <CardContent>
          <List rows={LONG} />
        </CardContent>
      </Card>
    </div>
  );
}
