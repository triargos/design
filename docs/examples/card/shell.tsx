import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';

const PROJECTS = [
  { name: 'Website redesign', due: 'Due Friday', status: 'On track', intent: 'success' },
  { name: 'Mobile app', due: 'Due next week', status: 'At risk', intent: 'warning' },
] as const;

/** One card tinted with the shell: the header a label band, the content a panel below it. */
export function CardShell() {
  return (
    <Card variant='shell' className='w-full max-w-xl'>
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
