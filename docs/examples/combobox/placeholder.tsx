import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '~/components/ui/combobox';

interface Project {
  readonly value: string;
  readonly label: string;
}

const PROJECTS: ReadonlyArray<Project> = [
  { value: 'atlas', label: 'Atlas' },
  { value: 'beacon', label: 'Beacon' },
  { value: 'comet', label: 'Comet' },
  { value: 'delta', label: 'Delta' },
  { value: 'orbit', label: 'Orbit' },
];

export function ComboboxPlaceholder() {
  return (
    <Combobox items={PROJECTS} itemToStringLabel={(project: Project) => project.label}>
      <ComboboxInput placeholder='Search projects' aria-label='Project' className='w-64' />
      <ComboboxContent>
        <ComboboxEmpty>No projects found</ComboboxEmpty>
        <ComboboxList>
          {(project: Project) => (
            <ComboboxItem key={project.value} value={project}>
              {project.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
