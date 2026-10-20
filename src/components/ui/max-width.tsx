import { VariantProps, cva } from 'class-variance-authority';
import { ReactNode } from 'react';

import { cn } from '~/lib/utils';

const maxWidthVariants = cva('mx-auto w-full space-y-group', {
  variants: {
    size: {
      sm: 'max-w-[640px]',
      base: 'max-w-[768px]',
      md: 'max-w-4xl',
      lg: 'max-w-[1480px]',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

interface MaxWidthProps extends VariantProps<typeof maxWidthVariants> {
  children: ReactNode;
  className?: string;
}

/** Caps the page column and centers it; its blocks sit `group` apart. */
export const MaxWidth = ({ children, className, size }: MaxWidthProps) => {
  return <div className={cn(maxWidthVariants({ size }), className)}>{children}</div>;
};
