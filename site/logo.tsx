import type { ComponentProps } from 'react';

import { cn } from '~/lib/utils';

/**
 * The Triargos mark (`elternportal/apps/dashboard/public/assets/triargos-logo.svg`), inline so its three greys can follow
 * the mode: the front and back shades swap in dark, so the front stroke stays the strongest.
 */
export function TriargosLogo({ className, ...props }: ComponentProps<'svg'>) {
  return (
    <svg viewBox='0 0 20 25' fill='none' aria-hidden className={cn('h-6 w-auto shrink-0', className)} {...props}>
      <path
        className='fill-[#5C5C5C] dark:fill-[#E4E4E4]'
        d='M18.97 14.1C18.94 14.92 18.71 15.7 18.18 15.62C16.17 15.31 14.22 14.62 12.4 13.66C10.02 14.45 7.69 15.63 5.6 17.07C3.72 18.37 2.04 19.87 0.720004 21.49C0.540004 21.71 0.450005 22.09 0.440005 22.52C0.390005 23.73 0.890005 25.28 1.58 24.43C1.92 24.01 2.29 23.6 2.68 23.2C2.86 23.02 3.04 22.83 3.24 22.65C7.18 18.88 12.98 15.99 18.09 15.99C18.89 15.99 19.02 14.99 18.98 14.09'
      />
      <path
        className='fill-[#E4E4E4] dark:fill-[#5C5C5C]'
        d='M6.49 9.13001C6.4 7.48001 6.14 5.84001 5.69 4.26001C5.42 3.33001 5.09 2.41001 4.68 1.52001C3.58 -0.889994 0.340001 2.82001 1.14 4.56001C3.39 9.49001 3.49 15.75 0.96 20.56C0.71 21.04 0.390004 21.84 0.440004 22.52C0.460004 22.09 0.550005 21.71 0.730005 21.49C2.05 19.87 3.73 18.36 5.61 17.07C6.32 14.5 6.64 11.79 6.51 9.13001'
      />
      <path
        className='fill-[#8F8F8F]'
        d='M18.18 12.21C13.32 11.46 8.72 8.27001 5.68 4.26001C6.13 5.84001 6.4 7.48 6.48 9.13C8.2 10.94 10.2 12.5 12.39 13.66C14.21 14.62 16.29 15.55 18.3 15.86C18.83 15.94 19 14.94 19.03 14.11C19.07 13.24 18.8 12.31 18.17 12.21'
      />
    </svg>
  );
}
