import { Item, ItemContent, ItemDescription, ItemTitle } from '~/components/ui/item';
import { StatusDot } from '~/components/ui/status-dot';

/** Projects by type: the dot is the color the workspace picked, or a category when it picked none. */
const PROJECTS = [
  { name: 'Website redesign', owner: 'Lena Park', type: 'Client work', color: '#8b5cf6' },
  { name: 'Q3 hiring plan', owner: 'Omar Haddad', type: 'Hiring', color: 'var(--category-4)' },
  { name: 'Onboarding guide', owner: 'Mia Chen', type: 'Training', color: 'var(--category-5)' },
] as const;

export function StatusDotDataColor() {
  return (
    <div className='flex w-96 flex-col'>
      {PROJECTS.map((project) => (
        <Item key={project.name}>
          <ItemContent>
            <ItemTitle>{project.name}</ItemTitle>
            <ItemDescription>{project.owner}</ItemDescription>
          </ItemContent>
          <span className='flex items-center gap-1.5 text-caption text-muted-foreground'>
            <StatusDot color={project.color} />
            {project.type}
          </span>
        </Item>
      ))}
    </div>
  );
}
