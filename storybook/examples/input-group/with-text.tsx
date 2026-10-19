import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '~/components/ui/input-group';

export function InputGroupWithText() {
  return (
    <div className='flex flex-wrap items-center gap-4'>
      <InputGroup className='w-72'>
        <InputGroupAddon>
          <InputGroupText>https://</InputGroupText>
        </InputGroupAddon>
        <InputGroupInput placeholder='schule.de' />
      </InputGroup>
      <InputGroup className='w-40'>
        <InputGroupInput type='number' defaultValue={14} aria-label='Frist' className='tabular-nums' />
        <InputGroupAddon align='inline-end'>
          <InputGroupText>Tage</InputGroupText>
        </InputGroupAddon>
      </InputGroup>
    </div>
  );
}
