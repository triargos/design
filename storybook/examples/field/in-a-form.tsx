import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import * as Schema from 'effect/Schema';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '~/components/ui/button';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';

const Invitation = Schema.Struct({
  email: Schema.String.check(
    Schema.isPattern(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, { message: 'Bitte gib eine gültige E-Mail-Adresse ein.' }),
  ),
});

/** react-hook-form: `Controller` renders the `Field`; data-invalid from fieldState, the field name as the control id. */
export function FieldInAForm() {
  const form = useForm({
    resolver: standardSchemaResolver(Schema.toStandardSchemaV1(Invitation)),
    defaultValues: { email: 'erika@' },
  });
  return (
    <form noValidate onSubmit={form.handleSubmit(() => undefined)} className='w-80'>
      <FieldGroup>
        <Controller
          control={form.control}
          name='email'
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>E-Mail</FieldLabel>
              <Input id={field.name} aria-invalid={fieldState.invalid} type='email' {...field} />
              <FieldDescription>An diese Adresse schicken wir die Einladung.</FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Button type='submit' isLoading={form.formState.isSubmitting} className='self-start'>
          Einladen
        </Button>
      </FieldGroup>
    </form>
  );
}
