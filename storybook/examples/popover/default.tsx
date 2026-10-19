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
      <PopoverTrigger render={<Button type='button' intent='neutral' emphasis='raised' size='sm' />}>
        Frist
      </PopoverTrigger>
      <PopoverContent align='start'>
        <PopoverHeader>
          <PopoverTitle>Frist verlängern</PopoverTitle>
          <PopoverDescription>Eltern können bis zum neuen Datum noch Anträge stellen.</PopoverDescription>
        </PopoverHeader>
        <Button type='button' size='sm' className='self-end'>
          Verlängern
        </Button>
      </PopoverContent>
    </Popover>
  );
}
