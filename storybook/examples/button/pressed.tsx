import { BoldIcon, ItalicIcon, UnderlineIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';

/** Ghost + `aria-pressed` in a muted toolbar. */
export function ButtonPressed() {
  const [bold, setBold] = useState(true);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  return (
    <div className='flex items-center gap-0.5 text-muted-foreground'>
      <Button
        type='button'
        emphasis='ghost'
        intent='neutral'
        size='icon-xs'
        aria-pressed={bold}
        aria-label='Fett'
        onClick={() => setBold(!bold)}>
        <BoldIcon />
      </Button>
      <Button
        type='button'
        emphasis='ghost'
        intent='neutral'
        size='icon-xs'
        aria-pressed={italic}
        aria-label='Kursiv'
        onClick={() => setItalic(!italic)}>
        <ItalicIcon />
      </Button>
      <Button
        type='button'
        emphasis='ghost'
        intent='neutral'
        size='icon-xs'
        aria-pressed={underline}
        aria-label='Unterstrichen'
        onClick={() => setUnderline(!underline)}>
        <UnderlineIcon />
      </Button>
    </div>
  );
}
