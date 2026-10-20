import { Button } from '~/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '~/components/ui/popover';

/** Anything that is not a menu or a list: a title, a sentence, one action. */
export function PopoverDefault() {
  return (
    <Popover>
      <PopoverTrigger render={<Button />}>Deadline</PopoverTrigger>
      <PopoverContent align='start'>
        <PopoverHeader>
          <PopoverTitle>Extend the deadline</PopoverTitle>
          <PopoverDescription>Members can submit their tasks until the new date.</PopoverDescription>
        </PopoverHeader>
        <Button intent='primary' className='self-end'>
          Extend
        </Button>
      </PopoverContent>
    </Popover>
  );
}
