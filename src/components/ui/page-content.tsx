import type { ComponentProps, ReactNode } from 'react';

import { cn } from '~/lib/utils';

interface PageContentProps extends ComponentProps<'div'> {
  /**
   * Stacked `group` apart in a `<header>`: a `PageHeaderBackLink`, the `PageHeaderGroup` (or a `PageHeaderRow` with
   * actions), a `TabsNav`.
   */
  header: ReactNode;
}

/**
 * Page layout: the header, then the content `page` (32px) below it. Blocks sit `group` (16px) apart; a `PageSection`
 * that is a direct child sits `section` (48px) from its neighbours.
 */
export const PageContent = ({ header, children, className, ...props }: PageContentProps) => (
  <div className={cn('flex flex-col gap-page', className)} {...props}>
    <header data-slot='page-header' className='flex flex-col gap-group'>
      {header}
    </header>
    {/* A section adds `section − group` on top of the block gap, so it sits `section` from its neighbours. */}
    <div className='flex flex-col gap-group [&>[data-slot=page-section]+*]:mt-[calc(var(--spacing-section)-var(--spacing-group))] [&>[data-slot=page-section]:not(:first-child)]:mt-[calc(var(--spacing-section)-var(--spacing-group))]'>
      {children}
    </div>
  </div>
);
