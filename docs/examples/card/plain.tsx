import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';

const PROJECTS = [
  { name: 'Website redesign', due: 'Due Friday', status: 'On track', intent: 'success' },
  { name: 'Mobile app', due: 'Due next week', status: 'At risk', intent: 'warning' },
] as const;

/** The exception: the title above the card, on the page, as a section heading; no tint. */
export function CardPlain() {
  return (
    <Card variant='plain' className='w-full max-w-xl'>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
      </CardHeader>
      <CardContent className='overflow-hidden'>
        <ItemList>
          {PROJECTS.map((project) => (
            <Item key={project.name}>
              <ItemContent>
                <ItemTitle>{project.name}</ItemTitle>
                <ItemDescription>{project.due}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Badge intent={project.intent}>{project.status}</Badge>
              </ItemActions>
            </Item>
          ))}
        </ItemList>
      </CardContent>
    </Card>
  );
}
