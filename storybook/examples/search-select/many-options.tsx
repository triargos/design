import { useMemo, useState } from 'react';

import { SearchSelect } from '~/components/ui/search-select';
import type { SelectOption } from '~/components/ui/select-option';

const STEMS = [
  'Ahorn',
  'Birken',
  'Buchen',
  'Eichen',
  'Erlen',
  'Linden',
  'Tannen',
  'Fichten',
  'Kiefern',
  'Pappel',
  'Ulmen',
  'Weiden',
  'Kastanien',
  'Holunder',
  'Rosen',
  'Tulpen',
  'Nelken',
  'Lilien',
  'Veilchen',
  'Flieder',
  'Sonnen',
  'Mond',
  'Stern',
  'Regen',
  'Wind',
  'Wiesen',
  'Feld',
  'Wald',
  'Berg',
  'Tal',
  'Bach',
  'See',
  'Fluss',
  'Brunnen',
  'Mühlen',
  'Kirch',
  'Schul',
  'Markt',
  'Bahnhof',
  'Garten',
  'Hafen',
  'Burg',
  'Schloss',
  'Dorf',
  'Hof',
  'Anger',
  'Heide',
  'Moor',
  'Quellen',
  'Lerchen',
];

const SUFFIXES = [
  'straße',
  'weg',
  'allee',
  'gasse',
  'ring',
  'platz',
  'pfad',
  'steig',
  'damm',
  'ufer',
  'graben',
  'hang',
  'höhe',
  'blick',
  'winkel',
  'grund',
  'stieg',
  'kamp',
  'feld',
  'berg',
  'chaussee',
  'promenade',
  'zeile',
  'bogen',
  'hof',
  'markt',
  'brücke',
  'kreuz',
  'eck',
  'tor',
  'garten',
  'park',
  'anger',
  'wall',
  'steg',
  'rain',
  'au',
  'busch',
  'heide',
  'koppel',
];

const POSTCODES = ['10115', '20095', '28195', '50667', '60311', '70173', '80331', '90402'];

/**
 * `count` streets, the same every time: 50 stems × 40 suffixes, then numbered rounds. No random, no fetch. The
 * description is a postcode, so every row has two lines of text, as in the address form.
 */
const streets = (count: number): ReadonlyArray<SelectOption> =>
  Array.from({ length: count }, (_, index) => {
    const round = Math.floor(index / (STEMS.length * SUFFIXES.length));
    const name = `${STEMS[index % STEMS.length]}${SUFFIXES[Math.floor(index / STEMS.length) % SUFFIXES.length]}`;
    return {
      value: String(index),
      label: round === 0 ? name : `${name} ${round + 1}`,
      description: POSTCODES[index % POSTCODES.length],
    };
  });

/** Reference data at app size (streets, nationalities): 2,000 options by default. The perf check for the virtualized list. */
export function SearchSelectManyOptions({ count = 2000, multiple = false }: { count?: number; multiple?: boolean }) {
  const options = useMemo(() => streets(count), [count]);
  const [street, setStreet] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const common = {
    id: 'many-options',
    items: options,
    itemKey: (option: SelectOption) => option.value,
    itemLabel: (option: SelectOption) => option.label,
    placeholder: 'Straße wählen',
    className: 'w-80',
  };
  return multiple ? (
    <SearchSelect {...common} multiple value={selected} onValueChange={setSelected} />
  ) : (
    <SearchSelect {...common} value={street} onValueChange={setStreet} />
  );
}
