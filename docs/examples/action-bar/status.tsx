import { IconCheck } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

import { ActionBar } from '~/components/ui/action-bar';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Field, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

const SAVED = 'Website redesign';

/**
 * Unsaved changes: the bar opens while the form differs from what is saved. Save sets `status`, which replaces the
 * actions (the bar springs to fit it); the bar closes a moment later. `priority={1}` keeps it over a selection bar.
 */
export function ActionBarStatus() {
  const [saved, setSaved] = useState(SAVED);
  const [name, setName] = useState('Website relaunch');
  const [status, setStatus] = useState(false);
  useEffect(() => {
    if (!status) return;
    const timeout = setTimeout(() => setStatus(false), 1500);
    return () => clearTimeout(timeout);
  }, [status]);
  return (
    <div className='flex w-full max-w-xl flex-col gap-group'>
      <Card>
        <CardHeader>
          <CardTitle>Project</CardTitle>
        </CardHeader>
        <CardContent className='p-card'>
          <Field>
            <FieldLabel htmlFor='action-bar-name'>Name</FieldLabel>
            <Input id='action-bar-name' value={name} onChange={(event) => setName(event.target.value)} />
          </Field>
        </CardContent>
      </Card>
      <ActionBar
        open={name !== saved || status}
        priority={1}
        status={
          status ? (
            <>
              <IconCheck className='text-success' />
              Saved
            </>
          ) : undefined
        }
        aria-label='Unsaved changes'>
        <span className='ps-2.5 whitespace-nowrap text-muted-foreground'>Unsaved changes</span>
        <Button emphasis='ghost' onClick={() => setName(saved)}>
          Discard
        </Button>
        <Button
          intent='primary'
          onClick={() => {
            setSaved(name);
            setStatus(true);
          }}>
          Save
        </Button>
      </ActionBar>
    </div>
  );
}
