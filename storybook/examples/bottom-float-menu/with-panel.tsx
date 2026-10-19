import { ArrowLeftIcon, CommandIcon, MailCheckIcon, MailIcon, XIcon } from 'lucide-react';
import { useState } from 'react';

import {
  BottomFloatMenu,
  type BottomFloatMenuDismissReason,
  BottomFloatMenuItem,
  type BottomFloatMenuPanel,
  BottomFloatMenuRow,
} from '~/components/ui/bottom-float-menu';
import { Button } from '~/components/ui/button';

/**
 * A count, clear, and an actions panel with a nested panel: a row opens a panel and the bar morphs into it.
 * `opensPanel` adds the chevron; Escape in the nested panel goes back one level.
 */
export function BottomFloatMenuWithPanel() {
  const [openPanel, setOpenPanel] = useState<'actions' | 'invitations' | null>(null);
  const actions: BottomFloatMenuPanel = {
    key: 'actions',
    label: 'Aktionen',
    content: (
      <>
        <BottomFloatMenuRow icon={<MailIcon />} opensPanel onClick={() => setOpenPanel('invitations')}>
          Eltern einladen
        </BottomFloatMenuRow>
        <BottomFloatMenuRow icon={<CommandIcon />} onClick={() => setOpenPanel(null)}>
          Alle Aktionen
        </BottomFloatMenuRow>
      </>
    ),
  };
  const invitations: BottomFloatMenuPanel = {
    key: 'invitations',
    label: 'Eltern einladen',
    content: (
      <>
        <BottomFloatMenuRow icon={<ArrowLeftIcon />} onClick={() => setOpenPanel('actions')}>
          Zurück
        </BottomFloatMenuRow>
        <BottomFloatMenuRow icon={<MailIcon />} onClick={() => setOpenPanel(null)}>
          An noch nicht Eingeladene
        </BottomFloatMenuRow>
        <BottomFloatMenuRow icon={<MailCheckIcon />} onClick={() => setOpenPanel(null)}>
          An alle
        </BottomFloatMenuRow>
      </>
    ),
  };
  const dismiss = (reason: BottomFloatMenuDismissReason) =>
    setOpenPanel((current) => (reason === 'escape' && current === 'invitations' ? 'actions' : null));
  return (
    <BottomFloatMenu
      show
      label='Aktionen'
      panel={openPanel === 'actions' ? actions : openPanel === 'invitations' ? invitations : null}
      onPanelDismiss={dismiss}>
      <span className='ps-4 pe-1 tabular-nums'>3 ausgewählt</span>
      <BottomFloatMenuItem>
        <Button type='button' intent='neutral' emphasis='raised' size='icon-lg' aria-label='Auswahl aufheben'>
          <XIcon />
        </Button>
      </BottomFloatMenuItem>
      <BottomFloatMenuItem>
        <Button type='button' intent='neutral' emphasis='raised' onClick={() => setOpenPanel('actions')}>
          <CommandIcon data-icon='inline-start' />
          Aktionen
        </Button>
      </BottomFloatMenuItem>
    </BottomFloatMenu>
  );
}
