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
      <SheetTrigger render={<Button />}>Invite member</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Invite member</SheetTitle>
          <SheetDescription>We’ll email them a link to join the workspace.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor='invite-email'>Email</FieldLabel>
              <Input id='invite-email' type='email' placeholder='name@company.com' />
            </Field>
            <Field>
              <FieldLabel htmlFor='invite-note'>Message</FieldLabel>
              <Textarea id='invite-note' rows={3} placeholder='Optional' />
              <FieldDescription>Shown above the link in the invitation.</FieldDescription>
            </Field>
          </FieldGroup>
        </SheetBody>
        <SheetFooter>
          <Button intent='primary'>Send invite</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
