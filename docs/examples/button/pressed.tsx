import { IconBold, IconItalic, IconUnderline } from '@tabler/icons-react';
import { useState } from 'react';

import { Button } from '~/components/ui/button';

/** Ghost + `aria-pressed` in a muted toolbar. */
export function ButtonPressed() {
  const [bold, setBold] = useState(true);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  return (
    <div className='flex items-center gap-0.5 text-muted-foreground'>
      <Button emphasis='ghost' size='icon-xs' aria-pressed={bold} aria-label='Bold' onClick={() => setBold(!bold)}>
        <IconBold />
      </Button>
      <Button
        emphasis='ghost'
        size='icon-xs'
        aria-pressed={italic}
        aria-label='Italic'
        onClick={() => setItalic(!italic)}>
        <IconItalic />
      </Button>
      <Button
        emphasis='ghost'
        size='icon-xs'
        aria-pressed={underline}
        aria-label='Underline'
        onClick={() => setUnderline(!underline)}>
        <IconUnderline />
      </Button>
    </div>
  );
}
