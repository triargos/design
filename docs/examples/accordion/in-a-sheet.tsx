import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '~/components/ui/accordion';
import { Button } from '~/components/ui/button';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet';

const SECTIONS = [
  {
    value: 'roles',
    title: 'Roles',
    body: 'Owners manage billing and members. Admins manage projects. Members work on the tasks they are assigned.',
  },
  {
    value: 'guests',
    title: 'Guests',
    body: 'Guests see only the projects they are invited to and cannot invite anyone else.',
  },
  {
    value: 'removal',
    title: 'Removing a member',
    body: 'Their tasks stay in the project, unassigned. Documents they uploaded stay where they are.',
  },
] as const;

/** In a `SheetBody`, a flush accordion runs past the body's padding to the sheet's edge. */
export function AccordionInASheet() {
  return (
    <Sheet>
      <SheetTrigger render={<Button />}>Member permissions</SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Member permissions</SheetTitle>
          <SheetDescription>What each member of the workspace can do.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <Accordion variant='flush' defaultValue={['roles']}>
            {SECTIONS.map((section) => (
              <AccordionItem key={section.value} value={section.value}>
                <AccordionTrigger>{section.title}</AccordionTrigger>
                <AccordionContent className='text-muted-foreground'>{section.body}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
