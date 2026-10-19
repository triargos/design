import { MailCheckIcon, MailXIcon, Trash2Icon, XIcon } from 'lucide-react';

import { BottomFloatMenu, BottomFloatMenuItem } from '~/components/ui/bottom-float-menu';
import { Button } from '~/components/ui/button';

/**
 * Direct actions on a selection. Floats over the bottom of the page; MainLayout provides the slot it portals into,
 * without one it is fixed to the viewport.
 */
export function BottomFloatMenuDefault() {
  return (
    <BottomFloatMenu show className='max-w-[calc(100vw-2rem)] flex-wrap justify-center'>
      <BottomFloatMenuItem>
        <Button type='button' intent='neutral' emphasis='raised'>
          <XIcon data-icon='inline-start' />
          Auswahl aufheben
        </Button>
      </BottomFloatMenuItem>
      <BottomFloatMenuItem>
        <Button type='button' intent='destructive' emphasis='solid'>
          <Trash2Icon data-icon='inline-start' />
          Löschen
        </Button>
      </BottomFloatMenuItem>
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
    </BottomFloatMenu>
  );
}
