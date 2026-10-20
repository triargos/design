import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cva, type VariantProps } from 'class-variance-authority';
import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from '@tabler/icons-react';
import * as React from 'react';

import { Button } from '~/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '~/components/ui/sheet';

import { useIsMobile } from '~/hooks/use-mobile';
import { useLocale } from '~/components/ui/locale';
import { cn } from '~/lib/utils';

type SidebarContextValue = {
  /** Desktop: expanded or collapsed. */
  open: boolean;
  /** Mobile: the sheet. */
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

function useSidebar() {
  const context = React.use(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider.');
  }
  return context;
}

/**
 * Holds the open state. The outermost provider on the page binds ⌘[ / Ctrl+[ to toggle its sidebar; a provider nested
 * in another (an example inside the app frame) toggles only through its `SidebarTrigger`.
 */
function SidebarProvider({
  defaultOpen = true,
  className,
  ...props
}: React.ComponentProps<'div'> & { defaultOpen?: boolean }) {
  const isNested = React.use(SidebarContext) !== null;
  const isMobile = useIsMobile();
  const [open, setOpen] = React.useState(defaultOpen);
  const [openMobile, setOpenMobile] = React.useState(false);

  const toggleSidebar = () => (isMobile ? setOpenMobile(!openMobile) : setOpen(!open));

  const onKeyDown = React.useEffectEvent((event: KeyboardEvent) => {
    if (event.key === '[' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      toggleSidebar();
    }
  });

  React.useEffect(() => {
    if (isNested) return;
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isNested]);

  return (
    <SidebarContext value={{ open, openMobile, setOpenMobile, isMobile, toggleSidebar }}>
      <div className={cn('group/sidebar-wrapper flex w-full', className)} {...props} />
    </SidebarContext>
  );
}

/**
 * Desktop: a 16rem column that slides out (`offcanvas`) or narrows to its icons (`icon`) when collapsed. Mobile: a
 * sheet from the left, named by `label`.
 */
function Sidebar({
  collapsible = 'offcanvas',
  label: labelProp,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & { collapsible?: 'offcanvas' | 'icon'; label?: string }) {
  const label = labelProp ?? useLocale().labels.sidebar;
  const { isMobile, open, openMobile, setOpenMobile } = useSidebar();

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          data-mobile='true'
          side='left'
          showCloseButton={false}
          className='w-72 bg-sidebar bg-none p-0 text-sidebar-foreground'>
          <SheetTitle className='sr-only'>{label}</SheetTitle>
          <div data-slot='sidebar' className='flex size-full flex-col'>
            {children}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div
      className='group peer relative hidden text-sidebar-foreground md:block'
      data-state={open ? 'expanded' : 'collapsed'}
      data-collapsible={open ? '' : collapsible}>
      {/* Holds the column's width in the layout; the panel below is absolute so it can slide out. */}
      <div className='w-64 transition-[width] duration-move ease-move motion-reduce:transition-none group-data-[collapsible=icon]:w-12 group-data-[collapsible=offcanvas]:w-0' />
      <div
        className={cn(
          'absolute inset-y-0 left-0 z-10 flex w-64 transition-[left,width] duration-move ease-move motion-reduce:transition-none group-data-[collapsible=icon]:w-12 group-data-[collapsible=offcanvas]:-left-64',
          className,
        )}
        {...props}>
        <div data-slot='sidebar' className='flex size-full flex-col'>
          {children}
        </div>
      </div>
    </div>
  );
}

function SidebarTrigger({
  className,
  onClick,
  'aria-label': ariaLabelProp,
  ...props
}: React.ComponentProps<typeof Button>) {
  const ariaLabel = ariaLabelProp ?? useLocale().labels.toggleSidebar;
  const { toggleSidebar, open, openMobile, isMobile } = useSidebar();

  return (
    <Button
      emphasis='ghost'
      data-slot='sidebar-trigger'
      size='icon-xs'
      aria-label={ariaLabel}
      aria-expanded={isMobile ? openMobile : open}
      className={className}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}>
      {open ? <IconLayoutSidebarLeftCollapse className='size-5' /> : <IconLayoutSidebarLeftExpand className='size-4' />}
    </Button>
  );
}

function SidebarHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='sidebar-header' className={cn('flex flex-col gap-2 p-2', className)} {...props} />;
}

function SidebarFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='sidebar-footer' className={cn('flex flex-col gap-2 p-2', className)} {...props} />;
}

function SidebarContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='sidebar-content'
      className={cn(
        'no-scrollbar flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
        className,
      )}
      {...props}
    />
  );
}

function SidebarGroup({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div data-slot='sidebar-group' className={cn('relative flex w-full min-w-0 flex-col p-2', className)} {...props} />
  );
}

/** Folds away (margin and fade) when the sidebar collapses to its icons. */
function SidebarGroupLabel({ className, render, ...props }: useRender.ComponentProps<'div'>) {
  return useRender({
    defaultTagName: 'div',
    render,
    state: { slot: 'sidebar-group-label' },
    props: mergeProps<'div'>(
      {
        className: cn(
          'flex h-8 shrink-0 items-center rounded-control px-2 text-caption font-medium text-sidebar-foreground/70 outline-hidden transition-[margin,opacity] duration-move ease-move motion-reduce:transition-opacity focus-visible:ring-3 focus-visible:ring-ring/24 [&>svg]:size-4 [&>svg]:shrink-0',
          'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
          className,
        ),
      },
      props,
    ),
  });
}

function SidebarGroupContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot='sidebar-group-content' className={cn('w-full text-body', className)} {...props} />;
}

function SidebarMenu({ className, ...props }: React.ComponentProps<'ul'>) {
  return <ul data-slot='sidebar-menu' className={cn('flex w-full min-w-0 flex-col gap-1', className)} {...props} />;
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<'li'>) {
  return <li data-slot='sidebar-menu-item' className={cn('relative', className)} {...props} />;
}

/**
 * A menu row: its shape, its hover and press fills, and the raised current row. `level='sub'` is a nested link row,
 * 28px and hidden while the sidebar is collapsed to icons.
 */
const sidebarMenuButtonVariants = cva(
  [
    'flex items-center gap-2 overflow-hidden px-3 text-body outline-hidden focus-visible:ring-3 focus-visible:ring-ring/24 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
    'hover:bg-foreground/5 hover:text-sidebar-accent-foreground active:bg-foreground/10 active:text-sidebar-accent-foreground',
    'disabled:pointer-events-none disabled:text-disabled-foreground aria-disabled:pointer-events-none aria-disabled:text-disabled-foreground',
    // The current row is a raised chip, as `emphasis='raised'` paints one.
    'aria-[current=page]:bg-card aria-[current=page]:font-medium aria-[current=page]:text-sidebar-accent-foreground aria-[current=page]:shadow-raised aria-[current=page]:hover:bg-card dark:aria-[current=page]:bg-foreground/10 dark:aria-[current=page]:hover:bg-foreground/10',
  ],
  {
    variants: {
      level: {
        item: [
          'h-8 w-full rounded-control py-2 text-left transition-[width,height,padding] motion-reduce:transition-none group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2!',
          'data-popup-open:hover:bg-foreground/5 data-popup-open:hover:text-sidebar-accent-foreground',
        ],
        sub: 'h-7 min-w-0 rounded-control-sm text-sidebar-foreground group-data-[collapsible=icon]:hidden',
      },
      emphasis: {
        ghost: '',
        outline: 'bg-card shadow-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
      },
    },
    defaultVariants: { level: 'item', emphasis: 'ghost' },
  },
);

/**
 * A row in the menu: a button, or a link through `render`. `current` marks the page it links to (`aria-current`).
 * `emphasis='outline'` draws an edge, for a row that opens something (search). Closes the mobile sheet when clicked.
 */
function SidebarMenuButton({
  render,
  current = false,
  emphasis,
  className,
  ...props
}: useRender.ComponentProps<'button'> & { current?: boolean } & VariantProps<typeof sidebarMenuButtonVariants>) {
  const { setOpenMobile } = useSidebar();
  return useRender({
    defaultTagName: 'button',
    render,
    state: { slot: 'sidebar-menu-button' },
    props: mergeProps<'button'>(
      {
        'aria-current': current ? 'page' : undefined,
        className: cn(sidebarMenuButtonVariants({ emphasis }), className),
        onClick: () => setOpenMobile(false),
      },
      props,
    ),
  });
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<'ul'>) {
  return (
    <ul
      data-slot='sidebar-menu-sub'
      className={cn('flex min-w-0 flex-col gap-2 py-1.5 pl-7 group-data-[collapsible=icon]:hidden', className)}
      {...props}
    />
  );
}

/** Draws the tree line: a vertical stroke down the sub-menu and a rounded elbow into each item. */
function SidebarMenuSubItem({ className, ...props }: React.ComponentProps<'li'>) {
  return (
    <li
      data-slot='sidebar-menu-sub-item'
      className={cn(
        'relative',
        'before:absolute before:-top-2 before:bottom-0 before:left-[-8px] before:w-px before:bg-sidebar-border/60 first:before:-top-1.5 last:before:hidden',
        'after:absolute after:-top-2 after:left-[-8px] after:h-[22px] after:w-2 after:rounded-bl-control-sm after:border-b after:border-l after:border-sidebar-border/60 first:after:-top-1.5 first:after:h-[20px]',
        className,
      )}
      {...props}
    />
  );
}

/** A link in a sub-menu; `current` marks its page. Closes the mobile sheet when clicked. */
function SidebarMenuSubButton({
  render,
  current = false,
  className,
  ...props
}: useRender.ComponentProps<'a'> & { current?: boolean }) {
  const { setOpenMobile } = useSidebar();
  return useRender({
    defaultTagName: 'a',
    render,
    state: { slot: 'sidebar-menu-sub-button' },
    props: mergeProps<'a'>(
      {
        'aria-current': current ? 'page' : undefined,
        className: cn(sidebarMenuButtonVariants({ level: 'sub' }), className),
        onClick: () => setOpenMobile(false),
      },
      props,
    ),
  });
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
};
