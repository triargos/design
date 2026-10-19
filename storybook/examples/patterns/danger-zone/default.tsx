import { useId, useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';
import { Button } from '~/components/ui/button';
import { CopyButton } from '~/components/ui/copy-button';
import { Field, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';

const NAME = 'Einschulung 2025';

/**
 * The last card of a settings page: each row names the action, says what it costs, and offers one button. Lifecycle
 * actions that can be undone (withdraw, archive) are raised; only a destructive row takes the solid destructive button,
 * behind an AlertDialog. For what cannot be undone, typing the name unlocks the confirmation.
 */
export function DangerZoneDefault() {
  const inputId = useId();
  const [value, setValue] = useState('');
  return (
    <InsetCard tone='destructive' className='w-full max-w-2xl'>
      <InsetCardHeader>
        <InsetCardTitle>Gefahrenzone</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='overflow-hidden'>
        <ItemList animate={false}>
          <Item>
            <ItemContent>
              <ItemTitle>Veröffentlichung zurückziehen</ItemTitle>
              <ItemDescription>Eltern sehen die Anmeldung nicht mehr; eingereichte bleiben erhalten.</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button type='button' intent='neutral' emphasis='raised' size='sm'>
                Zurückziehen
              </Button>
            </ItemActions>
          </Item>
          <Item>
            <ItemContent>
              <ItemTitle>Archivieren</ItemTitle>
              <ItemDescription>Aus der Liste entfernen. Lässt sich wiederherstellen.</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button type='button' intent='neutral' emphasis='raised' size='sm'>
                Archivieren
              </Button>
            </ItemActions>
          </Item>
          <Item>
            <ItemContent>
              <ItemTitle>Löschen</ItemTitle>
              <ItemDescription>Die Anmeldung und alle Einreichungen. Nicht rückgängig zu machen.</ItemDescription>
            </ItemContent>
            <ItemActions>
              <AlertDialog onOpenChange={() => setValue('')}>
                <AlertDialogTrigger render={<Button intent='destructive' emphasis='solid' size='sm' />}>
                  Löschen…
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Anmeldung löschen?</AlertDialogTitle>
                    <AlertDialogDescription>
                      „{NAME}“ und alle Einreichungen werden endgültig gelöscht.
                    </AlertDialogDescription>
                    <Field className='mt-group'>
                      <FieldLabel htmlFor={inputId}>Zum Bestätigen den Namen eingeben</FieldLabel>
                      <div className='flex items-center gap-2'>
                        <span className='text-caption font-medium text-muted-foreground'>{NAME}</span>
                        <CopyButton value={NAME} size='icon-xs' />
                      </div>
                      <Input
                        id={inputId}
                        placeholder={NAME}
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                      />
                    </Field>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                    <AlertDialogAction intent='destructive' emphasis='solid' disabled={value !== NAME}>
                      Endgültig löschen
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </ItemActions>
          </Item>
        </ItemList>
      </InsetCardContent>
    </InsetCard>
  );
}
