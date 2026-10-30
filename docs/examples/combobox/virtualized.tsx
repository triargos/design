import { useMemo, useState } from 'react';

import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from '~/components/ui/combobox';
import type { SelectOption } from '~/components/ui/select';

const FIRST_NAMES = [
  'Ada',
  'Ben',
  'Cara',
  'Dan',
  'Eva',
  'Finn',
  'Gia',
  'Hugo',
  'Ivy',
  'Jack',
  'Kai',
  'Lena',
  'Max',
  'Nina',
  'Oscar',
  'Pia',
  'Quinn',
  'Rosa',
  'Sam',
  'Tara',
  'Uma',
  'Vince',
  'Wren',
  'Xena',
  'Yuri',
  'Zoe',
  'Alex',
  'Bea',
  'Cole',
  'Dina',
  'Eli',
  'Faye',
  'Gus',
  'Hana',
  'Ian',
  'June',
  'Kurt',
  'Lia',
  'Milo',
  'Nora',
  'Otto',
  'Paz',
  'Rex',
  'Sia',
  'Theo',
  'Una',
  'Vera',
  'Will',
  'Yara',
  'Zack',
];

const LAST_NAMES = [
  'Adams',
  'Baker',
  'Carter',
  'Dalton',
  'Ellis',
  'Fischer',
  'Garcia',
  'Hansen',
  'Ito',
  'Jensen',
  'Keller',
  'Lopez',
  'Moreau',
  'Nakamura',
  'Olsen',
  'Park',
  'Quist',
  'Rivera',
  'Silva',
  'Torres',
  'Ueda',
  'Vargas',
  'Walsh',
  'Young',
  'Zimmer',
  'Anderson',
  'Brooks',
  'Costa',
  'Diaz',
  'Evans',
  'Foster',
  'Gray',
  'Hughes',
  'Ivanov',
  'Johnson',
  'Khan',
  'Lambert',
  'Meyer',
  'Novak',
  'Ortiz',
];

const TEAMS = ['Design', 'Engineering', 'Finance', 'Marketing', 'Operations', 'Sales', 'Support', 'Legal'];

/**
 * `count` members, the same every time: 50 first names × 40 last names, then numbered rounds. No random, no fetch.
 * The description is a team, so every row has two texts.
 */
const members = (count: number): ReadonlyArray<SelectOption> =>
  Array.from({ length: count }, (_, index) => {
    const round = Math.floor(index / (FIRST_NAMES.length * LAST_NAMES.length));
    const name = `${FIRST_NAMES[index % FIRST_NAMES.length]} ${LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length]}`;
    return {
      value: String(index),
      label: round === 0 ? name : `${name} ${round + 1}`,
      description: TEAMS[index % TEAMS.length] ?? '',
    };
  });

/** A workspace at full size, 2,000 members by default: `virtualized` renders only the rows in view. */
export function ComboboxVirtualized({ count = 2000, multiple = false }: { count?: number; multiple?: boolean }) {
  const options = useMemo(() => members(count), [count]);
  const [member, setMember] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const content = (
    <ComboboxContent>
      <ComboboxEmpty>No members found</ComboboxEmpty>
      <ComboboxList>
        {(item) => (
          <ComboboxItem key={item.value} value={item}>
            <span className='truncate'>{item.label}</span>
            <span className='truncate text-caption text-muted-foreground'>{item.description}</span>
          </ComboboxItem>
        )}
      </ComboboxList>
    </ComboboxContent>
  );
  return multiple ? (
    <Combobox virtualized multiple items={options} value={selected} onValueChange={setSelected}>
      <ComboboxChips className='w-80'>
        <ComboboxValue>
          {(chosen: SelectOption[]) => chosen.map((item) => <ComboboxChip key={item.value}>{item.label}</ComboboxChip>)}
        </ComboboxValue>
        <ComboboxChipsInput aria-label='Members' placeholder={selected.length === 0 ? 'Add members' : undefined} />
      </ComboboxChips>
      {content}
    </Combobox>
  ) : (
    <Combobox virtualized items={options} value={member} onValueChange={setMember}>
      <ComboboxInput id='many-options' aria-label='Member' placeholder='Choose a member' className='w-80' />
      {content}
    </Combobox>
  );
}
