import { Controller, useForm } from 'react-hook-form';

import { Button } from '~/components/ui/button';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** react-hook-form: `Controller` renders the `Field`; `invalid` from fieldState, the field name as the control id. */
export function FieldInAForm() {
  const form = useForm({ defaultValues: { email: 'maya@' } });
  return (
    <form noValidate onSubmit={form.handleSubmit(() => undefined)} className='w-80'>
      <FieldGroup>
        <Controller
          control={form.control}
          name='email'
          rules={{ pattern: { value: EMAIL, message: 'Enter a valid email address.' } }}
          render={({ field, fieldState }) => (
            <Field invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input id={field.name} aria-invalid={fieldState.invalid} type='email' {...field} />
              <FieldDescription>We send the invitation to this address.</FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Button type='submit' intent='primary' isLoading={form.formState.isSubmitting} className='self-start'>
          Invite
        </Button>
      </FieldGroup>
    </form>
  );
}
