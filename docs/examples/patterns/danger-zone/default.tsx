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
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemTitle } from '~/components/ui/item';

const NAME = 'Website redesign';

/**
 * The last card of a settings page: each row names the action, says what it costs, and offers one button. Lifecycle
 * actions that can be undone (withdraw, archive) are raised; only a destructive row takes the solid destructive button,
 * behind an AlertDialog. For what cannot be undone, typing the name unlocks the confirmation.
 */
export function DangerZoneDefault() {
  const inputId = useId();
  const [value, setValue] = useState('');
  return (
    <Card intent='destructive' className='w-full max-w-2xl'>
      <CardHeader>
        <CardTitle>Danger zone</CardTitle>
      </CardHeader>
      <CardContent className='overflow-hidden'>
        <ItemList>
          <Item>
            <ItemContent>
              <ItemTitle>Unpublish</ItemTitle>
              <ItemDescription>Guests lose access; members keep it.</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button>Unpublish</Button>
            </ItemActions>
          </Item>
          <Item>
            <ItemContent>
              <ItemTitle>Archive</ItemTitle>
              <ItemDescription>Removes it from the list. You can restore it.</ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button>Archive</Button>
            </ItemActions>
          </Item>
          <Item>
            <ItemContent>
              <ItemTitle>Delete</ItemTitle>
              <ItemDescription>The project and all its tasks. This can’t be undone.</ItemDescription>
            </ItemContent>
            <ItemActions>
              <AlertDialog onOpenChange={() => setValue('')}>
                <AlertDialogTrigger render={<Button intent='destructive' />}>Delete…</AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete project?</AlertDialogTitle>
                    <AlertDialogDescription>“{NAME}” and all its tasks are deleted for good.</AlertDialogDescription>
                    <Field className='mt-group'>
                      <FieldLabel htmlFor={inputId}>Type the name to confirm</FieldLabel>
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
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction intent='destructive' disabled={value !== NAME}>
                      Delete project
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </ItemActions>
          </Item>
        </ItemList>
      </CardContent>
    </Card>
  );
}
