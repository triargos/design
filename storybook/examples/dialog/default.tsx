import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import * as Schema from 'effect/Schema';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';

const SEND_DELAY_MS = 1000;

const Invite = Schema.Struct({
  email: Schema.String.check(Schema.isPattern(/^\S+@\S+$/, { message: 'Bitte gib eine E-Mail-Adresse ein.' })),
  note: Schema.String,
});

/**
 * Header and footer on the shell, the body in a card. A form wraps `DialogBody` and `DialogFooter` with
 * `className='contents'`, so the modal's layout is unchanged and Enter submits; the submit button sits in the footer.
 */
export function DialogDefault() {
  const [open, setOpen] = useState(false);
  const form = useForm({
    resolver: standardSchemaResolver(Schema.toStandardSchemaV1(Invite)),
    defaultValues: { email: '', note: '' },
  });
  const onSubmit = form.handleSubmit(async () => {
    await new Promise((resolve) => setTimeout(resolve, SEND_DELAY_MS));
    setOpen(false);
    form.reset();
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button intent='neutral' emphasis='raised' />}>Mitglied einladen</DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Mitglied einladen</DialogTitle>
          <DialogDescription>Wir schicken eine E-Mail mit einem persönlichen Link.</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={onSubmit} className='contents'>
          <DialogBody>
            <FieldGroup>
              <Controller
                name='email'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>E-Mail</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type='email'
                      placeholder='name@schule.de'
                      aria-invalid={fieldState.invalid}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                name='note'
                control={form.control}
                render={({ field }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Nachricht</FieldLabel>
                    <Textarea {...field} id={field.name} rows={3} placeholder='Optional' />
                    <FieldDescription>Steht über dem Link in der Einladung.</FieldDescription>
                  </Field>
                )}
              />
            </FieldGroup>
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button type='button' intent='neutral' emphasis='raised' />}>Abbrechen</DialogClose>
            <Button type='submit' isLoading={form.formState.isSubmitting}>
              Einladen
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
