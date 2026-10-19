import { useState } from 'react';

import { SearchInput } from '~/components/ui/search-input';

/** ⌘F focuses it. In the URL: `SearchParamInput`. */
export function SearchInputDefault() {
  const [query, setQuery] = useState('Schmidt');
  return <SearchInput value={query} onValueChange={setQuery} placeholder='Mitglieder suchen' />;
}
