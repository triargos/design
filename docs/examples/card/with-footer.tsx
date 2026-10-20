import { useState } from 'react';

import { Button } from '~/components/ui/button';
import { Field, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/card';

/** `CardFooter show` while the form is dirty; type to show it again. */
export function CardWithFooter() {
  const [dirty, setDirty] = useState(true);
  return (
    <Card className='w-full max-w-xl'>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>How your teammates see you.</CardDescription>
      </CardHeader>
      <CardContent className='p-card'>
        <Field>
          <FieldLabel htmlFor='card-name'>Name</FieldLabel>
          <Input id='card-name' defaultValue='Jordan Lee' onChange={() => setDirty(true)} />
        </Field>
      </CardContent>
      <CardFooter show={dirty} className='flex items-center justify-end gap-related'>
        <span className='text-body text-muted-foreground'>Unsaved changes</span>
        <Button intent='primary' onClick={() => setDirty(false)}>
          Save
        </Button>
      </CardFooter>
    </Card>
  );
}
