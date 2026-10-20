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

/** A field that filters a list as you type; with a value, a clear button replaces the ⇅ button. */
export function ComboboxDefault() {
  return (
    <Combobox items={PROJECTS} defaultValue={PROJECTS[2]} itemToStringLabel={(project: Project) => project.label}>
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
