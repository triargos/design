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

/** Invalid and disabled. With no match the list shows `ComboboxEmpty`. */
export function ComboboxStates() {
  return (
    <div className='grid w-64 gap-2'>
      <Combobox items={PROJECTS} itemToStringLabel={(project: Project) => project.label}>
        <ComboboxInput placeholder='Search projects' aria-label='Project, invalid' aria-invalid />
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
      <Combobox
        items={PROJECTS}
        defaultValue={PROJECTS[0]}
        disabled
        itemToStringLabel={(project: Project) => project.label}>
        <ComboboxInput placeholder='Search projects' aria-label='Project, disabled' />
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
    </div>
  );
}
