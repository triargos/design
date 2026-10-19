import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';

import { Calendar } from '~/components/ui/calendar';
import { PickerTrigger } from '~/components/ui/picker-trigger';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';

/** A `PickerTrigger` that opens a calendar: the shape of every picker. */
export function PopoverPicker() {
  const [date, setDate] = useState<Date | undefined>(new Date(2025, 2, 14));
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<PickerTrigger className='w-64 justify-between' />}>
        <span>{date === undefined ? 'Datum wählen' : format(date, 'PPP', { locale: de })}</span>
        <CalendarIcon className='opacity-50' />
      </PopoverTrigger>
      <PopoverContent align='start' className='w-auto p-0'>
        <Calendar
          mode='single'
          selected={date}
          defaultMonth={date}
          onSelect={(next) => {
            setDate(next);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
