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
import { Field, FieldDescription, FieldGroup, FieldLabel } from '~/components/ui/field';
import { Input } from '~/components/ui/input';
import { Textarea } from '~/components/ui/textarea';

/** Header and footer on the shell, the body in a card. */
export function DialogDefault() {
  return (
    <Dialog>
      <DialogTrigger render={<Button intent='neutral' emphasis='raised' />}>Mitglied einladen</DialogTrigger>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>Mitglied einladen</DialogTitle>
          <DialogDescription>Wir schicken eine E-Mail mit einem persönlichen Link.</DialogDescription>
        </DialogHeader>
        <DialogBody>
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
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button intent='neutral' emphasis='raised' />}>Abbrechen</DialogClose>
          <Button type='button'>Einladen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
