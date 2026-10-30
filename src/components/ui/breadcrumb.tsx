import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { IconChevronRight, IconDots } from '@tabler/icons-react';
import * as React from 'react';

import { useLocale } from '~/components/ui/locale';
import { useLinkRender } from '~/components/ui/link';
import { cn } from '~/lib/utils';

function Breadcrumb({ 'aria-label': ariaLabel, ...props }: React.ComponentProps<'nav'>) {
  const { labels } = useLocale();
  return <nav aria-label={ariaLabel ?? labels.breadcrumb} data-slot='breadcrumb' {...props} />;
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<'ol'>) {
  return (
    <ol
      data-slot='breadcrumb-list'
      className={cn(
        'flex flex-wrap items-center gap-control-gap text-body wrap-break-word text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot='breadcrumb-item'
      className={cn('inline-flex items-center gap-control-gap-sm', className)}
      {...props}
    />
  );
}

function BreadcrumbLink({ className, render, ...props }: useRender.ComponentProps<'a'>) {
  const linkRender = useLinkRender(render);
  return useRender({
    defaultTagName: 'a',
    render: linkRender,
    state: { slot: 'breadcrumb-link' },
    props: mergeProps<'a'>({ className: cn('transition-colors hover:text-foreground', className) }, props),
  });
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='breadcrumb-page'
      aria-current='page'
      className={cn('font-normal text-foreground', className)}
      {...props}
    />
  );
}

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot='breadcrumb-separator'
      role='presentation'
      aria-hidden='true'
      className={cn('[&>svg]:size-icon-sm', className)}
      {...props}>
      {children ?? <IconChevronRight />}
    </li>
  );
}

/** Decorative: screen readers skip it, so collapsed items need another way in (a menu) to stay reachable. */
function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot='breadcrumb-ellipsis'
      role='presentation'
      aria-hidden='true'
      className={cn('flex size-control-2xs items-center justify-center [&>svg]:size-icon', className)}
      {...props}>
      <IconDots />
    </span>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
