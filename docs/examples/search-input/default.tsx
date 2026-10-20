import { useState } from 'react';

import { SearchInput } from '~/components/ui/search-input';

/** ⌘F focuses it; Escape clears it. */
export function SearchInputDefault() {
  const [query, setQuery] = useState('Chen');
  return <SearchInput value={query} onValueChange={setQuery} placeholder='Search members' />;
}
