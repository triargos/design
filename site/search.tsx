import { SearchIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import pages from 'virtual:docs-index';

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command';
import { Kbd, KbdGroup } from '~/components/ui/kbd';
import { SidebarMenuButton } from '~/components/ui/sidebar';

import { GROUPS } from './nav';
import { pathOf } from './page';
import { useRouter } from './router';

/**
 * Ranks page names: a prefix first (`dia` → Dialog), then a word start (Alert Dialog), then anywhere in the name. cmdk's
 * default fuzzy match would also rank names that only hold the letters in order (`dia` → Loading).
 */
const byName = (value: string, search: string) => {
  const name = value.toLowerCase();
  const query = search.trim().toLowerCase();
  if (query === '' || name.startsWith(query)) return 1;
  if (name.split(' ').some((word) => word.startsWith(query))) return 0.8;
  return name.includes(query) ? 0.5 : 0;
};

/** The sidebar's search row and the ⌘K palette it opens: every docs page, by name. */
export function Search() {
  const [open, setOpen] = useState(false);
  const { navigate } = useRouter();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <>
      <SidebarMenuButton
        variant='outline'
        onClick={() => setOpen(true)}
        className='justify-between text-muted-foreground'
        aria-keyshortcuts='Meta+K Control+K'>
        <span className='flex items-center gap-2'>
          <SearchIcon aria-hidden />
          Search
        </span>
        <KbdGroup className='pointer-coarse:hidden'>
          <Kbd>⌘</Kbd>
          <Kbd>K</Kbd>
        </KbdGroup>
      </SidebarMenuButton>
      <CommandDialog open={open} onOpenChange={setOpen} title='Search' description='Go to a page by its name.'>
        <Command filter={byName}>
          <CommandInput aria-label='Page name' placeholder='Button, Color, Dialog…' />
          <CommandList>
            <CommandEmpty>No page with that name.</CommandEmpty>
            {GROUPS.map((group) => (
              <CommandGroup key={group} heading={group}>
                {pages
                  .filter((page) => page.group === group)
                  .map((page) => (
                    <CommandItem
                      key={page.slug}
                      value={page.name}
                      onSelect={() => {
                        setOpen(false);
                        navigate(pathOf(page));
                      }}>
                      {page.name}
                    </CommandItem>
                  ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
