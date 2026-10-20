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

/**
 * Header and footer on the shell, the body in a card. A form wraps `DialogBody` and `DialogFooter` with
 * `className='contents'`, so the modal's layout is unchanged and Enter submits; the submit button sits in the footer.
 */
export function DialogDefault() {
  const [open, setOpen] = useState(false);
  const form = useForm({ defaultValues: { email: '', note: '' } });
  const onSubmit = form.handleSubmit(async () => {
    await new Promise((resolve) => setTimeout(resolve, SEND_DELAY_MS));
    setOpen(false);
    form.reset();
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>Invite member</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
          <DialogDescription>We’ll email them a link to join the workspace.</DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={onSubmit} className='contents'>
          <DialogBody>
            <FieldGroup>
              <Controller
                name='email'
                control={form.control}
                rules={{
                  required: 'Enter an email address.',
                  pattern: { value: /^\S+@\S+$/, message: 'Enter an email address.' },
                }}
                render={({ field, fieldState }) => (
                  <Field invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type='email'
                      placeholder='name@company.com'
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
                    <FieldLabel htmlFor={field.name}>Message</FieldLabel>
                    <Textarea {...field} id={field.name} rows={3} placeholder='Optional' />
                    <FieldDescription>Shown above the link in the invitation.</FieldDescription>
                  </Field>
                )}
              />
            </FieldGroup>
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button type='button' />}>Cancel</DialogClose>
            <Button type='submit' intent='primary' isLoading={form.formState.isSubmitting}>
              Send invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
