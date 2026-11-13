import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';

const ISSUES = [
  { title: 'Birth date missing', description: 'Child 1' },
  { title: 'Address does not match', description: 'Custodian 2' },
] as const;

/** `intent` colors the title; `emphasis='subtle'` tints the shell in it too. */
export function CardEmphasis() {
  return (
    <div className='grid w-full max-w-3xl gap-group md:grid-cols-2'>
      <Card intent='destructive' emphasis='subtle'>
        <CardHeader>
          <CardTitle>2 issues</CardTitle>
        </CardHeader>
        <CardContent>
          <ItemList>
            {ISSUES.map((issue) => (
              <Item key={issue.title}>
                <ItemContent>
                  <ItemTitle>{issue.title}</ItemTitle>
                  <ItemDescription>{issue.description}</ItemDescription>
                </ItemContent>
              </Item>
            ))}
          </ItemList>
        </CardContent>
      </Card>
      <Card intent='warning' emphasis='subtle'>
        <CardHeader>
          <CardTitle>Mapping incomplete</CardTitle>
        </CardHeader>
        <CardContent>
          <p className='p-card text-body text-muted-foreground'>Two fields have no target yet.</p>
        </CardContent>
      </Card>
    </div>
  );
}
