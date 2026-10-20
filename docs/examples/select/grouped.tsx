import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

const PROJECTS = [
  { value: 'atlas', label: 'Atlas', team: 'Design' },
  { value: 'beacon', label: 'Beacon', team: 'Design' },
  { value: 'comet', label: 'Comet', team: 'Engineering' },
  { value: 'orbit', label: 'Orbit', team: 'Engineering' },
];

const TEAMS = ['Design', 'Engineering'].map((label) => ({
  label,
  items: PROJECTS.filter((project) => project.team === label),
}));

export function SelectGrouped() {
  return (
    <Select items={PROJECTS} defaultValue='beacon'>
      <SelectTrigger aria-label='Project' className='w-56'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TEAMS.map((team, index) => (
          <SelectGroup key={team.label}>
            {index > 0 && <SelectSeparator />}
            <SelectLabel>{team.label}</SelectLabel>
            {team.items.map((project) => (
              <SelectItem key={project.value} value={project.value}>
                {project.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
