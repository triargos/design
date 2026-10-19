import { MailCheckIcon, MailXIcon, Trash2Icon, XIcon } from 'lucide-react';

import { BottomFloatMenu, BottomFloatMenuItem } from '~/components/ui/bottom-float-menu';
import { Button } from '~/components/ui/button';

/**
 * Direct actions on a selection, read by weight: the count as text, the actions raised, the destructive one subtle
 * (its confirmation is where the solid fill belongs), and clear as a quiet ✕ at the end.
 */
export function BottomFloatMenuDefault() {
  return (
    <BottomFloatMenu show label='Auswahl' className='max-w-[calc(100vw-2rem)] flex-wrap justify-center'>
      <span className='ps-4 pe-1 tabular-nums'>3 ausgewählt</span>
      <BottomFloatMenuItem>
        <Button type='button' intent='neutral' emphasis='raised'>
          <MailCheckIcon data-icon='inline-start' />
          Gelesen
        </Button>
      </BottomFloatMenuItem>
      <BottomFloatMenuItem>
        <Button type='button' intent='neutral' emphasis='raised'>
          <MailXIcon data-icon='inline-start' />
          Ungelesen
        </Button>
      </BottomFloatMenuItem>
      <BottomFloatMenuItem>
        <Button type='button' intent='destructive' emphasis='subtle'>
          <Trash2Icon data-icon='inline-start' />
          Löschen
        </Button>
      </BottomFloatMenuItem>
      <BottomFloatMenuItem>
        <Button type='button' intent='neutral' emphasis='ghost' size='icon-lg' aria-label='Auswahl aufheben'>
          <XIcon />
        </Button>
      </BottomFloatMenuItem>
    </BottomFloatMenu>
  );
}
