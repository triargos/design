import { Slider } from '~/components/ui/slider';

/** Dims the whole control: the one place opacity stays. */
export function SliderDisabled() {
  return <Slider defaultValue={60} disabled className='w-72' aria-label='Volume' />;
}
