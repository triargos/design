import { MailIcon, Trash2Icon, XIcon } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '~/components/ui/badge';
import { BottomFloatMenu, BottomFloatMenuItem } from '~/components/ui/bottom-float-menu';
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

/**
 * Select rows, act on all of them: a checkbox column with select-all, and a Bottom Float Menu with the count, clear
 * and the actions while anything is selected.
 */
export function BulkSelectionDefault() {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set(['1', '3']));
  const all = selected.size === APPLICATIONS.length;
  const toggle = (id: string, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
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
                  onCheckedChange={(checked) => setSelected(new Set(checked ? APPLICATIONS.map((row) => row.id) : []))}
                />
              </TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Anmeldung</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {APPLICATIONS.map((row) => (
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
      <BottomFloatMenu show={selected.size > 0} label='Auswahl'>
        <span className='px-3 font-medium tabular-nums'>{selected.size} ausgewählt</span>
        <BottomFloatMenuItem>
          <Button
            type='button'
            intent='neutral'
            emphasis='ghost'
            size='icon-lg'
            aria-label='Auswahl aufheben'
            onClick={() => setSelected(new Set())}>
            <XIcon />
          </Button>
        </BottomFloatMenuItem>
        <BottomFloatMenuItem>
          <Button type='button' intent='neutral' emphasis='ghost'>
            <MailIcon data-icon='inline-start' />
            Nachricht
          </Button>
        </BottomFloatMenuItem>
        <BottomFloatMenuItem>
          <Button type='button' intent='destructive' emphasis='solid'>
            <Trash2Icon data-icon='inline-start' />
            Löschen
          </Button>
        </BottomFloatMenuItem>
      </BottomFloatMenu>
    </>
  );
}
