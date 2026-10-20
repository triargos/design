import { Slider as SliderPrimitive } from '@base-ui/react/slider';

import { cn } from '~/lib/utils';

/** One thumb per value: a number is one thumb, an array (a range) one per entry. */
function Slider<Value extends number | readonly number[]>({ className, ...props }: SliderPrimitive.Root.Props<Value>) {
  const values = props.value ?? props.defaultValue;
  const thumbs = Array.isArray(values) ? values.length : 1;

  return (
    <SliderPrimitive.Root
      className={cn('data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full', className)}
      data-slot='slider'
      thumbAlignment='edge'
      {...props}>
      <SliderPrimitive.Control className='relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col'>
        <SliderPrimitive.Track
          data-slot='slider-track'
          className='relative grow overflow-hidden rounded-full bg-muted data-[orientation=horizontal]:h-1 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-1'>
          <SliderPrimitive.Indicator
            data-slot='slider-range'
            className='bg-primary-solid data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full'
          />
        </SliderPrimitive.Track>
        {Array.from({ length: thumbs }, (_, index) => (
          // A thumb is its position in the value array; nothing reorders them.
          <SliderPrimitive.Thumb
            data-slot='slider-thumb'
            key={index}
            className='relative block size-3 shrink-0 rounded-full border border-ring bg-white ring-ring/24 transition-[color,box-shadow] after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3'
          />
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

export { Slider };
