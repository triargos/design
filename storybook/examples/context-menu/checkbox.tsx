import { useState } from 'react';

import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuLabel,
  ContextMenuTrigger,
} from '~/components/ui/context-menu';

export function ContextMenuCheckbox() {
  const [parents, setParents] = useState(true);
  const [teachers, setTeachers] = useState(false);
  return (
    <ContextMenu>
      <ContextMenuTrigger className='flex h-40 w-72 items-center justify-center rounded-control-lg border border-dashed border-border text-body text-muted-foreground'>
        Rechtsklick auf die Datei
      </ContextMenuTrigger>
      <ContextMenuContent className='w-52'>
        <ContextMenuGroup>
          <ContextMenuLabel>Sichtbar für</ContextMenuLabel>
          <ContextMenuCheckboxItem checked={parents} onCheckedChange={setParents}>
            Eltern
          </ContextMenuCheckboxItem>
          <ContextMenuCheckboxItem checked={teachers} onCheckedChange={setTeachers}>
            Lehrkräfte
          </ContextMenuCheckboxItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
