import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { IconChevronLeft } from '@tabler/icons-react';

import { useLinkRender } from '~/components/ui/link';
import { cn } from '~/lib/utils';

function BackLink({ className, render, children, ...props }: useRender.ComponentProps<'a'>) {
  const linkRender = useLinkRender(render);
  return useRender({
    defaultTagName: 'a',
    render: linkRender,
    state: { slot: 'back-link' },
    props: mergeProps<'a'>(
      {
        className: cn(
          'hit-area relative -ms-(--spacing-icon) inline-flex min-h-control-xs items-center self-start rounded-control-xs pe-1 text-body text-muted-foreground outline-none transition-colors duration-feedback hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/24',
          className,
        ),
      },
      props,
      {
        children: (
          <>
            <IconChevronLeft aria-hidden className='size-icon shrink-0 rtl:-scale-x-100' />
            {children}
          </>
        ),
      },
    ),
  });
}

export { BackLink };
