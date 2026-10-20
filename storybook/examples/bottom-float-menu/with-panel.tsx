import { ArrowLeftIcon, CommandIcon, FolderIcon, FolderInputIcon, XIcon } from 'lucide-react';
import { useState } from 'react';

import {
  BottomFloatMenu,
  type BottomFloatMenuDismissReason,
  BottomFloatMenuItem,
  type BottomFloatMenuPanel,
  BottomFloatMenuRow,
} from '~/components/ui/bottom-float-menu';
import { Button } from '~/components/ui/button';

const PROJECTS = ['Website redesign', 'Mobile app'];

/**
 * A count, an actions panel with a nested panel, and clear at the end: a row opens a panel and the bar morphs into it.
 * `opensPanel` adds the chevron; Escape in the nested panel goes back one level.
 */
export function BottomFloatMenuWithPanel() {
  const [openPanel, setOpenPanel] = useState<'actions' | 'move' | null>(null);
  const actions: BottomFloatMenuPanel = {
    key: 'actions',
    label: 'Actions',
    content: (
      <>
        <BottomFloatMenuRow icon={<FolderInputIcon />} opensPanel onClick={() => setOpenPanel('move')}>
          Move to project
        </BottomFloatMenuRow>
        <BottomFloatMenuRow icon={<CommandIcon />} onClick={() => setOpenPanel(null)}>
          All actions
        </BottomFloatMenuRow>
      </>
    ),
  };
  const move: BottomFloatMenuPanel = {
    key: 'move',
    label: 'Move to project',
    content: (
      <>
        <BottomFloatMenuRow icon={<ArrowLeftIcon />} onClick={() => setOpenPanel('actions')}>
          Back
        </BottomFloatMenuRow>
        {PROJECTS.map((project) => (
          <BottomFloatMenuRow key={project} icon={<FolderIcon />} onClick={() => setOpenPanel(null)}>
            {project}
          </BottomFloatMenuRow>
        ))}
      </>
    ),
  };
  const dismiss = (reason: BottomFloatMenuDismissReason) =>
    setOpenPanel((current) => (reason === 'escape' && current === 'move' ? 'actions' : null));
  return (
    <BottomFloatMenu
      show
      label='Selection'
      panel={openPanel === 'actions' ? actions : openPanel === 'move' ? move : null}
      onPanelDismiss={dismiss}>
      <span className='ps-4 pe-1 tabular-nums'>3 selected</span>
      <BottomFloatMenuItem>
        <Button onClick={() => setOpenPanel('actions')}>
          <CommandIcon data-icon='inline-start' />
          Actions
        </Button>
      </BottomFloatMenuItem>
      <BottomFloatMenuItem>
        <Button emphasis='ghost' size='icon-lg' aria-label='Clear selection'>
          <XIcon />
        </Button>
      </BottomFloatMenuItem>
    </BottomFloatMenu>
  );
}
