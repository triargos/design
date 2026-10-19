import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { ChevronLeftIcon } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

import { alignToInsetCardText } from '~/components/ui/inset-card';

import { cn } from '~/lib/utils';

interface HeaderProps {
  children?: ReactNode;
  className?: string;
}

export const PageHeaderRow = ({ className, ...props }: ComponentProps<'div'>) => {
  return <div className={cn('flex flex-wrap items-start justify-between gap-group', className)} {...props} />;
};

export const PageHeaderTools = ({ className, ...props }: ComponentProps<'div'>) => {
  return <div className={cn('flex flex-wrap items-center gap-related', className)} {...props} />;
};

/**
 * Page header with navigation above the title: a breadcrumb or back link, then a `PageHeaderGroup` or
 * `PageHeaderRow`, optionally followed by `TabsList as='nav'`.
 */
export const PageHeaderSection = ({ className, ...props }: ComponentProps<'header'>) => {
  return <header className={cn('flex flex-col gap-group', className)} {...props} />;
};

/**
 * Link to the parent page above the title, inside a `PageHeaderSection`. `children` is the link text. An `<a>`;
 * pass `render={<Link to='…' />}` for a router link.
 */
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

/** Status and facts under the title, such as a badge and dates. Children are the items; separators are the caller's. */
export const PageHeaderMeta = ({ className, ...props }: ComponentProps<'div'>) => {
  return (
    <div
      className={cn('flex flex-wrap items-center gap-x-related gap-y-tight text-body text-muted-foreground', className)}
      {...props}
    />
  );
};

/**
 * Title and its description or meta, 4px apart, with 16px below. Inside a `PageContent` header, `PageContent` removes
 * the 16px and sets the gap to the content itself, so a `pb-*` className has no effect there.
 */
export const PageHeaderGroup = ({ children, className }: { children?: ReactNode; className?: string }) => {
  return (
    <hgroup data-slot='page-header-group' className={cn('flex flex-col gap-tight pb-4', className)}>
      {children}
    </hgroup>
  );
};

export const PageHeader = ({ children, className }: HeaderProps) => {
  return <h1 className={cn('text-title text-balance', className)}>{children}</h1>;
};

interface PageDescriptionProps {
  children?: ReactNode;
  className?: string;
}

export const PageDescription = ({ children, className }: PageDescriptionProps) => (
  <p className={cn('max-w-prose text-body text-pretty text-muted-foreground', className)}>{children}</p>
);

/** Indented to the text of the `InsetCard` headers below it, so title and card text share one edge. */
export const SectionHeaderGroup = ({ children, className }: HeaderProps) => {
  return <hgroup className={cn('space-y-tight', alignToInsetCardText, className)}>{children}</hgroup>;
};

export const SectionTitle = ({ children, className }: HeaderProps) => {
  return <h2 className={cn('text-heading text-balance', className)}>{children}</h2>;
};

export const SectionDescription = ({ children, className }: HeaderProps) => {
  return <p className={cn('text-body text-pretty text-muted-foreground', className)}>{children}</p>;
};

interface PageSectionProps extends Omit<ComponentProps<'section'>, 'title'> {
  title: ReactNode;
  description?: ReactNode;
}

/**
 * A titled group of blocks on a page: the section header, then the blocks, `group` apart. Inside a `PageContent` it
 * sits `section` from its neighbours. The header is indented to the card header text (`SectionHeaderGroup`).
 */
export const PageSection = ({ title, description, children, className, ...props }: PageSectionProps) => {
  return (
    <section data-slot='page-section' className={cn('flex flex-col gap-group', className)} {...props}>
      <SectionHeaderGroup>
        <SectionTitle>{title}</SectionTitle>
        {description !== undefined && <SectionDescription>{description}</SectionDescription>}
      </SectionHeaderGroup>
      {children}
    </section>
  );
};
