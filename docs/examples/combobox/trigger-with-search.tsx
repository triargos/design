import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxSearch,
  ComboboxTrigger,
  ComboboxValue,
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

/** A select-like trigger; the search field sits in the popup. */
export function ComboboxTriggerWithSearch() {
  return (
    <Combobox items={PROJECTS} defaultValue={PROJECTS[0]} itemToStringLabel={(project: Project) => project.label}>
      <ComboboxTrigger aria-label='Project' className='w-64'>
        <ComboboxValue />
      </ComboboxTrigger>
      <ComboboxContent aria-label='Choose a project'>
        <ComboboxSearch placeholder='Search projects' />
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
