import { CalendarIcon } from 'lucide-react';
import { useState } from 'react';

import { Calendar } from '~/components/ui/calendar';
import { PickerTrigger } from '~/components/ui/picker-trigger';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';

/** `YYYY-MM-DD` as “March 14, 2025”; a plain date has no zone, so it is formatted as UTC midnight. */
const longDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' });

/** A `PickerTrigger` that opens a calendar: the shape of every picker. */
export function PopoverPicker() {
  const [date, setDate] = useState('2025-03-14');
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={<PickerTrigger className='w-64' />}>
        <span>{date === '' ? 'Pick a date' : longDate.format(new Date(date))}</span>
        <CalendarIcon />
      </PopoverTrigger>
      <PopoverContent align='start' className='w-auto p-0'>
        <Calendar
          autoFocus
          value={date}
          onValueChange={(next) => {
            setDate(next);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
