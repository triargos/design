import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from '~/components/ui/combobox';

interface Project {
  readonly value: string;
  readonly label: string;
}

interface Team {
  readonly value: string;
  readonly items: ReadonlyArray<Project>;
}

const TEAMS: ReadonlyArray<Team> = [
  {
    value: 'Design',
    items: [
      { value: 'atlas', label: 'Atlas' },
      { value: 'beacon', label: 'Beacon' },
    ],
  },
  {
    value: 'Engineering',
    items: [
      { value: 'comet', label: 'Comet' },
      { value: 'orbit', label: 'Orbit' },
    ],
  },
];

/** `items` as groups; each `ComboboxGroup` renders its own `ComboboxCollection`. */
export function ComboboxGrouped() {
  return (
    <Combobox items={TEAMS} itemToStringLabel={(project: Project) => project.label}>
      <ComboboxInput placeholder='Search projects' aria-label='Project' className='w-64' />
      <ComboboxContent>
        <ComboboxEmpty>No projects found</ComboboxEmpty>
        <ComboboxList>
          {(team: Team) => (
            <ComboboxGroup key={team.value} items={team.items}>
              <ComboboxLabel>{team.value}</ComboboxLabel>
              <ComboboxCollection>
                {(project: Project) => (
                  <ComboboxItem key={project.value} value={project}>
                    {project.label}
                  </ComboboxItem>
                )}
              </ComboboxCollection>
            </ComboboxGroup>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
