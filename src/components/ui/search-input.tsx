import { SearchIcon, XIcon } from 'lucide-react';
import { useRef } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from '~/components/ui/input-group';

import { cn } from '~/lib/utils';

interface SearchInputProps {
  value: string;
  onValueChange: (value: string) => void;
  /** Also the accessible name, unless `aria-label` is given. */
  placeholder?: string;
  clearLabel?: string;
  className?: string;
  'aria-label'?: string;
}

/** A search field: a leading icon, a clear button while it holds text. ⌘F focuses it, Escape clears and leaves it. */
function SearchInput({
  value,
  onValueChange,
  placeholder = 'Search',
  clearLabel = 'Clear',
  className,
  'aria-label': ariaLabel,
}: SearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useHotkeys('meta+f', () => inputRef.current?.focus(), { preventDefault: true });

  return (
    <InputGroup data-slot='search-input' className={cn('max-w-md', className)}>
      <InputGroupInput
        ref={inputRef}
        aria-label={ariaLabel ?? placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            onValueChange('');
            event.currentTarget.blur();
          }
        }}
      />
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      {value !== '' && (
        <InputGroupAddon align='inline-end'>
          <InputGroupButton size='icon-xs' aria-label={clearLabel} onClick={() => onValueChange('')}>
            <XIcon />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  );
}

export { SearchInput };
