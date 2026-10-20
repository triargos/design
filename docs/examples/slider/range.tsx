import { Slider } from '~/components/ui/slider';

export function SliderRange() {
  return <Slider defaultValue={[20, 70]} className='w-72' aria-label='Budget range' />;
}
