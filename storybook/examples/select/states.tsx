import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select';

const GRADES = [
  { value: '5', label: 'Klasse 5' },
  { value: '6', label: 'Klasse 6' },
  { value: '7', label: 'Klasse 7' },
];

/** Placeholder, invalid, read-only, disabled. */
export function SelectStates() {
  return (
    <div className='grid w-56 gap-2'>
      <Select items={GRADES}>
        <SelectTrigger aria-label='Klasse'>
          <SelectValue placeholder='Klasse wählen' />
        </SelectTrigger>
        <SelectContent>
          {GRADES.map((grade) => (
            <SelectItem key={grade.value} value={grade.value}>
              {grade.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select items={GRADES}>
        <SelectTrigger aria-label='Klasse, ungültig' aria-invalid>
          <SelectValue placeholder='Klasse wählen' />
        </SelectTrigger>
        <SelectContent>
          {GRADES.map((grade) => (
            <SelectItem key={grade.value} value={grade.value}>
              {grade.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select items={GRADES} defaultValue='6' readOnly>
        <SelectTrigger aria-label='Klasse, nur lesen'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {GRADES.map((grade) => (
            <SelectItem key={grade.value} value={grade.value}>
              {grade.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select items={GRADES} defaultValue='6' disabled>
        <SelectTrigger aria-label='Klasse, deaktiviert'>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {GRADES.map((grade) => (
            <SelectItem key={grade.value} value={grade.value}>
              {grade.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
