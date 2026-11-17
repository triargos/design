import { Input } from '~/components/ui/input';

/** Values edited in place: each reads as text until hovered or focused. */
export function InputPlain() {
  return (
    <div className='grid w-72 gap-1'>
      <Input variant='plain' aria-label='Value 1' defaultValue='Vegetarian' />
      <Input variant='plain' aria-label='Value 2' defaultValue='Vegan' />
      <Input variant='plain' aria-label='Value 3' placeholder='Add a value' />
    </div>
  );
}
