import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { type VariantProps, cva } from 'class-variance-authority';
import type { ComponentProps } from 'react';

import { cn } from '~/lib/utils';

const errorStateVariants = cva(
  'group/error-state flex min-w-0 animate-in flex-col duration-move fade-in slide-in-from-bottom-1 motion-reduce:animate-none',
  {
    variants: {
      size: {
        // No outer padding: the page or card around it owns the inset, so it lines up with sibling content.
        page: 'items-start text-start',
        section: 'flex-1 items-center justify-center px-6 py-10 text-center',
      },
    },
    defaultVariants: { size: 'page' },
  },
);

/**
 * `page` reads like the page it replaces, left-aligned; `section` sits centered inside a card. Parts read the size from
 * `data-size`. Compose with `ErrorStateIcon`, `ErrorStateTitle`, `ErrorStateDescription`, and `ErrorStateActions`.
 */
function ErrorState({
  className,
  size = 'page',
  ...props
}: ComponentProps<'div'> & VariantProps<typeof errorStateVariants>) {
  return (
    <div
      role='alert'
      data-slot='error-state'
      data-size={size}
      className={cn(errorStateVariants({ size }), className)}
      {...props}
    />
  );
}

/** Pass one lucide icon as the child; it takes the primary (branding) color. */
function ErrorStateIcon({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      aria-hidden
      data-slot='error-state-icon'
      className={cn('mb-3 text-primary [&_svg]:size-5', className)}
      {...props}
    />
  );
}

/** Renders an `h2`; pass `render={<h1 />}` when the error replaces a whole page. */
function ErrorStateTitle({ className, render, ...props }: useRender.ComponentProps<'h2'>) {
  return useRender({
    defaultTagName: 'h2',
    render,
    props: mergeProps<'h2'>(
      {
        className: cn('text-title text-balance group-data-[size=section]/error-state:text-heading', className),
      },
      props,
    ),
    state: { slot: 'error-state-title' },
  });
}

/** What happened and what it means for the user; say whether their data is safe when it matters. */
function ErrorStateDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot='error-state-description'
      className={cn(
        'mt-2 max-w-prose text-body text-pretty text-muted-foreground',
        'group-data-[size=section]/error-state:max-w-sm',
        className,
      )}
      {...props}
    />
  );
}

/** The next step. Every error state should offer at least one. */
function ErrorStateActions({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='error-state-actions'
      className={cn(
        'mt-6 flex flex-wrap items-center gap-related',
        'group-data-[size=section]/error-state:mt-5 group-data-[size=section]/error-state:justify-center',
        className,
      )}
      {...props}
    />
  );
}

export { ErrorState, ErrorStateIcon, ErrorStateTitle, ErrorStateDescription, ErrorStateActions };
