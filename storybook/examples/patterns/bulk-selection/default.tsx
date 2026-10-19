import { ArrowLeftIcon, CircleDotIcon, CommandIcon, DownloadIcon, MailIcon, Trash2Icon, XIcon } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '~/components/ui/badge';
import {
  BottomFloatMenu,
  type BottomFloatMenuDismissReason,
  BottomFloatMenuItem,
  type BottomFloatMenuPanel,
  BottomFloatMenuRow,
} from '~/components/ui/bottom-float-menu';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { InsetCard, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '~/components/ui/table';

const APPLICATIONS = [
  { id: '1', child: 'Mia Schmidt', group: 'Einschulung 2025', status: { label: 'In Prüfung', intent: 'warning' } },
  { id: '2', child: 'Leon Weber', group: 'Einschulung 2025', status: { label: 'Neu', intent: 'info' } },
  { id: '3', child: 'Emma Fischer', group: 'Nachmittagsbetreuung', status: { label: 'Neu', intent: 'info' } },
  { id: '4', child: 'Paul Wagner', group: 'Nachmittagsbetreuung', status: { label: 'Zugesagt', intent: 'success' } },
] as const;

type Panel = 'actions' | 'delete' | null;

/**
 * Select rows, act on all of them: a checkbox column with select-all, and a Bottom Float Menu while anything is
 * selected. The bar reads by weight: the count as text, "Aktionen" (every action, in a panel) as the one raised
 * button, a quick action as a raised icon, and clear as a quiet ✕ at the end. Deleting asks in its own panel level.
 */
export function BulkSelectionDefault() {
  const [rows, setRows] = useState<ReadonlyArray<(typeof APPLICATIONS)[number]>>(APPLICATIONS);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set(['1', '3']));
  const [panel, setPanel] = useState<Panel>(null);
  const all = rows.length > 0 && selected.size === rows.length;
  const toggle = (id: string, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  const clear = () => {
    setPanel(null);
    setSelected(new Set());
  };

  const actions: BottomFloatMenuPanel = {
    key: 'actions',
    label: 'Aktionen',
    content: (
      <>
        <BottomFloatMenuRow icon={<MailIcon />} onClick={() => setPanel(null)}>
          Nachricht senden
        </BottomFloatMenuRow>
        <BottomFloatMenuRow icon={<CircleDotIcon />} onClick={() => setPanel(null)}>
          Status ändern
        </BottomFloatMenuRow>
        <BottomFloatMenuRow icon={<DownloadIcon />} onClick={() => setPanel(null)}>
          Exportieren
        </BottomFloatMenuRow>
        <BottomFloatMenuRow icon={<Trash2Icon />} opensPanel onClick={() => setPanel('delete')}>
          Löschen
        </BottomFloatMenuRow>
      </>
    ),
  };
  const confirmDelete: BottomFloatMenuPanel = {
    key: 'delete',
    label: `${selected.size} Anmeldungen löschen`,
    content: (
      <>
        <BottomFloatMenuRow icon={<ArrowLeftIcon />} onClick={() => setPanel('actions')}>
          Zurück
        </BottomFloatMenuRow>
        <div className='p-1'>
          <Button
            type='button'
            intent='destructive'
            emphasis='solid'
            className='w-full'
            onClick={() => {
              setRows((current) => current.filter((row) => !selected.has(row.id)));
              clear();
            }}>
            <Trash2Icon data-icon='inline-start' />
            {selected.size} endgültig löschen
          </Button>
        </div>
      </>
    ),
  };
  const dismiss = (reason: BottomFloatMenuDismissReason) =>
    setPanel((current) => (reason === 'escape' && current === 'delete' ? 'actions' : null));

  return (
    <>
      <InsetCard className='w-full max-w-2xl'>
        <InsetCardHeader>
          <InsetCardTitle>Anmeldungen</InsetCardTitle>
        </InsetCardHeader>
        <Table variant='card'>
          <TableHeader>
            <TableRow>
              <TableHead className='w-10'>
                <Checkbox
                  aria-label='Alle auswählen'
                  checked={all}
                  indeterminate={selected.size > 0 && !all}
                  onCheckedChange={(checked) => setSelected(new Set(checked ? rows.map((row) => row.id) : []))}
                />
              </TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Anmeldung</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} data-state={selected.has(row.id) ? 'selected' : undefined}>
                <TableCell>
                  <Checkbox
                    aria-label={`${row.child} auswählen`}
                    checked={selected.has(row.id)}
                    onCheckedChange={(checked) => toggle(row.id, checked)}
                  />
                </TableCell>
                <TableCell className='font-medium'>{row.child}</TableCell>
                <TableCell>{row.group}</TableCell>
                <TableCell>
                  <Badge intent={row.status.intent}>{row.status.label}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </InsetCard>
      <BottomFloatMenu
        show={selected.size > 0}
        label='Auswahl'
        panel={panel === 'actions' ? actions : panel === 'delete' ? confirmDelete : null}
        onPanelDismiss={dismiss}>
        <span className='ps-4 pe-1 tabular-nums'>{selected.size} ausgewählt</span>
        <BottomFloatMenuItem>
          <Button type='button' intent='neutral' emphasis='raised' onClick={() => setPanel('actions')}>
            <CommandIcon data-icon='inline-start' />
            Aktionen
          </Button>
        </BottomFloatMenuItem>
        <BottomFloatMenuItem>
          <Button type='button' intent='neutral' emphasis='raised' size='icon-lg' aria-label='Nachricht senden'>
            <MailIcon />
          </Button>
        </BottomFloatMenuItem>
        <BottomFloatMenuItem>
          <Button
            type='button'
            intent='neutral'
            emphasis='ghost'
            size='icon-lg'
            aria-label='Auswahl aufheben'
            onClick={clear}>
            <XIcon />
          </Button>
        </BottomFloatMenuItem>
      </BottomFloatMenu>
    </>
  );
}
