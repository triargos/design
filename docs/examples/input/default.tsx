import { Input } from '~/components/ui/input';

/** 40px, text-control; on touch 16px scaled to 14, so iOS does not zoom. */
export function InputDefault() {
  return <Input placeholder='Maya Chen' aria-label='Name' className='w-72' />;
}
