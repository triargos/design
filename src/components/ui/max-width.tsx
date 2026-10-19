import { VariantProps, cva } from 'class-variance-authority';
import { ReactNode } from 'react';

import { cn } from '~/lib/utils';

const maxWithVariants = cva('w-full', {
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

interface MaxWidthProps extends VariantProps<typeof maxWithVariants> {
  children: ReactNode;
  className?: string;
}

export const MaxWidth = ({ children, className, size }: MaxWidthProps) => {
  return <div className={cn(maxWithVariants({ size }), className, 'mx-auto w-full space-y-4')}>{children}</div>;
};
