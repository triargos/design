import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '~/lib/utils';

const maxWidthVariants = cva('mx-auto w-full space-y-group', {
  variants: {
    size: {
      sm: 'max-w-[640px]',
      md: 'max-w-[768px]',
      lg: 'max-w-4xl',
      xl: 'max-w-[1480px]',
    },
  },
  defaultVariants: {
    size: 'lg',
  },
});

/**
 * Caps the page column and centers it; its blocks sit `group` apart. By content: `sm` a form or one record, `md`
 * settings and details, `lg` (default) lists and overviews, `xl` wide tables and editors.
 */
export const MaxWidth = ({
  className,
  size,
  ...props
}: ComponentProps<'div'> & VariantProps<typeof maxWidthVariants>) => {
  return <div className={cn(maxWidthVariants({ size }), className)} {...props} />;
};
