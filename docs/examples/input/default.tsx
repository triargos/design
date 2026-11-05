import { Input } from '~/components/ui/input';

/** 36px, text-control; 16px below md, so iOS does not zoom. */
export function InputDefault() {
  return <Input placeholder='Maya Chen' aria-label='Name' className='w-72' />;
}
