import { IconFileText } from '@tabler/icons-react';
import { useCommandState } from 'cmdk';

import {
  Command,
  CommandEmpty,
  CommandFooter,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command';
import { Kbd } from '~/components/ui/kbd';

import { cn } from '~/lib/utils';

const DOCUMENTS = ['Onboarding guide', 'Q3 roadmap', 'Release checklist', 'Brand guidelines', 'Invoice template'];

/** Inside `Command`: cmdk counts the rows the search leaves. */
function ResultCount() {
  const count = useCommandState((state) => state.filtered.count);
  return <span className='tabular-nums'>{count === 1 ? '1 result' : `${count} results`}</span>;
}

/** `CommandFooter`: the result count and the keys, hidden on touch screens. */
export function CommandWithFooter() {
  return (
    <div
      className={cn(
        'rounded-popup bg-popover text-popover-foreground shadow-popup',
        'w-full max-w-lg overflow-hidden',
      )}>
      <Command>
        <CommandInput placeholder='Search documents' />
        <CommandList>
          <CommandEmpty>No document with that name</CommandEmpty>
          <CommandGroup heading='Documents'>
            {DOCUMENTS.map((document) => (
              <CommandItem key={document}>
                <IconFileText />
                {document}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
        <CommandFooter>
          <ResultCount />
          <span className='flex items-center gap-4 pointer-coarse:hidden'>
            <span className='flex items-center gap-1.5'>
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              Navigate
            </span>
            <span className='flex items-center gap-1.5'>
              <Kbd>↵</Kbd>
              Open
            </span>
          </span>
        </CommandFooter>
      </Command>
    </div>
  );
}
