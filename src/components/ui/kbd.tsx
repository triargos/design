import { cn } from '~/lib/utils';

function Kbd({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot='kbd'
      className={cn(
        "pointer-events-none inline-flex h-control-2xs w-fit min-w-control-2xs items-center justify-center gap-control-gap-sm rounded-control-xs bg-muted px-(--kbd-pad-x) font-sans text-caption font-medium text-muted-foreground select-none [&_svg:not([class*='size-'])]:size-icon-xs",
        className,
      )}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<'kbd'>) {
  return (
    <kbd data-slot='kbd-group' className={cn('inline-flex items-center gap-control-gap-sm', className)} {...props} />
  );
}

export { Kbd, KbdGroup };
