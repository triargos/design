import { Input } from '~/components/ui/input';

/** 32px, text-control; 36px and 16px below sm, so iOS does not zoom. */
export function InputDefault() {
  return <Input placeholder='Maya Chen' aria-label='Name' className='w-72' />;
}
