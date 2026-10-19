import { Button } from '~/components/ui/button';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet';
import { Textarea } from '~/components/ui/textarea';

/** The dialog shell at full height. SheetBody scrolls; from sm the panel floats 8px in. */
export function SheetDefault() {
  return (
    <Sheet>
      <SheetTrigger render={<Button intent='neutral' emphasis='raised' />}>Mitglied einladen</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Mitglied einladen</SheetTitle>
          <SheetDescription>Wir schicken eine E-Mail mit einem persönlichen Link.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='invite-email'>E-Mail</FieldLabel>
              <Input id='invite-email' type='email' placeholder='name@schule.de' />
            </Field>
            <Field>
              <FieldLabel htmlFor='invite-note'>Nachricht</FieldLabel>
              <Textarea id='invite-note' rows={3} placeholder='Optional' />
              <FieldDescription>Steht über dem Link in der Einladung.</FieldDescription>
            </Field>
          </FieldGroup>
        </SheetBody>
        <SheetFooter>
          <Button type='button'>Einladen</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
