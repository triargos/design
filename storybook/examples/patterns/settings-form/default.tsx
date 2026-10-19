import { standardSchemaResolver } from '@hookform/resolvers/standard-schema';
import * as Schema from 'effect/Schema';
import { Controller, useForm } from 'react-hook-form';

import { UnsavedChangesToast } from '~/components/features/form/unsaved-changes-toast';
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import {
  InsetCard,
  InsetCardContent,
  InsetCardDescription,
  InsetCardHeader,
  InsetCardTitle,
} from '~/components/ui/inset-card';
import { Switch } from '~/components/ui/switch';

const FORM_ID = 'settings-form';
const SAVE_DELAY_MS = 1000;

const Settings = Schema.Struct({
  name: Schema.String.check(Schema.isMinLength(1, { message: 'Bitte gib einen Namen ein.' })),
  email: Schema.String,
  reminders: Schema.Boolean,
});

/**
 * A settings page: fields in a card, saved through the Bottom Float Menu. `show` is `isDirty`, Speichern submits by
 * `formId`, `isLoading` is `isSubmitting`; a save resets the form to the saved values, which the bar reads as saved.
 * Edit a field: the bar grows in. Zurücksetzen restores; Speichern spins, shows Gespeichert, leaves.
 */
export function SettingsFormDefault() {
  const form = useForm({
    resolver: standardSchemaResolver(Schema.toStandardSchemaV1(Settings)),
    defaultValues: { name: 'Grundschule am See', email: 'sekretariat@gs-am-see.de', reminders: true },
  });
  const { isDirty, isSubmitting } = form.formState;
  const onSubmit = form.handleSubmit(async (data) => {
    await new Promise((resolve) => setTimeout(resolve, SAVE_DELAY_MS));
    form.reset(data);
  });
  return (
    <form id={FORM_ID} noValidate onSubmit={onSubmit} className='w-full max-w-xl pb-28'>
      <InsetCard>
        <InsetCardHeader>
          <InsetCardTitle>Schule</InsetCardTitle>
          <InsetCardDescription>So erscheint die Schule in E-Mails an Eltern.</InsetCardDescription>
        </InsetCardHeader>
        <InsetCardContent className='p-group'>
          <FieldGroup>
            <Controller
              name='name'
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                  <Input {...field} id={field.name} aria-invalid={fieldState.invalid} autoComplete='off' />
                </Field>
              )}
            />
            <Controller
              name='email'
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Absender</FieldLabel>
                  <Input {...field} id={field.name} type='email' autoComplete='off' />
                  <FieldDescription>Antworten der Eltern gehen an diese Adresse.</FieldDescription>
                </Field>
              )}
            />
            <FieldSeparator />
            <Controller
              name='reminders'
              control={form.control}
              render={({ field }) => (
                <Field orientation='horizontal'>
                  <FieldContent>
                    <FieldLabel htmlFor={field.name}>Erinnerungen</FieldLabel>
                    <FieldDescription>Nach drei Tagen ohne Antwort noch einmal schicken.</FieldDescription>
                  </FieldContent>
                  <Switch id={field.name} checked={field.value} onCheckedChange={field.onChange} />
                </Field>
              )}
            />
          </FieldGroup>
        </InsetCardContent>
      </InsetCard>
      <UnsavedChangesToast show={isDirty} formId={FORM_ID} onReset={() => form.reset()} isLoading={isSubmitting} />
    </form>
  );
}
