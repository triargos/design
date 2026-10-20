import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { ChevronLeftIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '~/lib/utils';

// The page layout the foundation pages show their specimens in. Not part of the library: an app writes its own (see
// the Page pattern, `docs/examples/patterns/page/default.tsx`).

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

/** The title and its description or meta, `tight` apart. */
export const PageHeaderGroup = ({ className, ...props }: ComponentProps<'hgroup'>) => {
  return <hgroup data-slot='page-header-group' className={cn('flex flex-col gap-tight', className)} {...props} />;
};

export const PageTitle = ({ className, ...props }: ComponentProps<'h1'>) => {
  return <h1 className={cn('text-title text-balance', className)} {...props} />;
};

export const PageDescription = ({ className, ...props }: ComponentProps<'p'>) => {
  return <p className={cn('max-w-prose text-body text-pretty text-muted-foreground', className)} {...props} />;
};

/** Status and facts under the title, such as a badge and dates. Children are the items; separators are the caller's. */
export const PageHeaderMeta = ({ className, ...props }: ComponentProps<'div'>) => {
  return (
    <div
      className={cn('flex flex-wrap items-center gap-x-related gap-y-tight text-body text-muted-foreground', className)}
      {...props}
    />
  );
};

/** The `PageHeaderGroup` with `PageHeaderActions` on the right; wraps below them on a narrow page. */
export const PageHeaderRow = ({ className, ...props }: ComponentProps<'div'>) => {
  return <div className={cn('flex flex-wrap items-start justify-between gap-group', className)} {...props} />;
};

/** The page's buttons, the main action last. */
export const PageHeaderActions = ({ className, ...props }: ComponentProps<'div'>) => {
  return <div className={cn('flex flex-wrap items-center gap-related', className)} {...props} />;
};

/** Link to the parent page, above the title. `children` is the link text; `render={<Link to='…' />}` for a router link. */
export const PageHeaderBackLink = ({ className, children, render, ...props }: useRender.ComponentProps<'a'>) => {
  return useRender({
    defaultTagName: 'a',
    render,
    props: mergeProps<'a'>(
      {
        className: cn(
          'inline-flex min-h-6 items-center gap-1.5 self-start text-body text-muted-foreground transition-colors hover:text-foreground',
          className,
        ),
        children: (
          <>
            <ChevronLeftIcon aria-hidden className='size-4' />
            {children}
          </>
        ),
      },
      props,
    ),
  });
};

interface PageSectionProps extends Omit<ComponentProps<'section'>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
}

/**
 * A titled group of blocks on a page: the title and description, indented to the text of the `Card`s below, then
 * the blocks, `group` apart. Inside a `PageContent` it sits `section` from its neighbours.
 */
export const PageSection = ({ title, description, children, className, ...props }: PageSectionProps) => {
  return (
    <section data-slot='page-section' className={cn('flex flex-col gap-group', className)} {...props}>
      <hgroup className={'space-y-tight px-[calc(--spacing(1)+1px+var(--spacing-group))]'}>
        <h2 className='text-heading text-balance'>{title}</h2>
        {description !== undefined && <p className='text-body text-pretty text-muted-foreground'>{description}</p>}
      </hgroup>
      {children}
    </section>
  );
};
