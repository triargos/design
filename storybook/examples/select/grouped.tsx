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

const ITEMS = [
  { value: '1a', label: 'Klasse 1a', level: 'Grundschule' },
  { value: '2b', label: 'Klasse 2b', level: 'Grundschule' },
  { value: '5a', label: 'Klasse 5a', level: 'Sekundarstufe' },
  { value: '6c', label: 'Klasse 6c', level: 'Sekundarstufe' },
];

const GROUPS = ['Grundschule', 'Sekundarstufe'].map((label) => ({
  label,
  items: ITEMS.filter((item) => item.level === label),
}));

export function SelectGrouped() {
  return (
    <Select items={ITEMS} defaultValue='2b'>
      <SelectTrigger aria-label='Klasse' className='w-56'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {GROUPS.map((group, index) => (
          <SelectGroup key={group.label}>
            {index > 0 && <SelectSeparator />}
            <SelectLabel>{group.label}</SelectLabel>
            {group.items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
