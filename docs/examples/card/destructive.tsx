import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

/**
 * `intent='destructive'` marks only the title. The button sits 4px in the content, 8px from the shell’s edge:
 * `rounded-inner` with `--outer-inset` 8px. Below sm the row stacks, the button full width.
 */
export function CardDestructive() {
  return (
    <Card intent='destructive' className='w-full max-w-xl'>
      <CardHeader>
        <CardTitle>Delete workspace</CardTitle>
      </CardHeader>
      <CardContent className='flex items-center justify-between gap-group p-1 max-sm:flex-col max-sm:items-stretch max-sm:gap-2.5 max-sm:pt-2.5'>
        <p className='min-w-0 px-[calc(var(--spacing-card)-var(--spacing-tight))] text-body text-muted-foreground'>
          Removes every project, task and document for good.
        </p>
        <Button intent='destructive' className='rounded-inner [--outer-inset:--spacing(2)]'>
          Delete workspace
        </Button>
      </CardContent>
    </Card>
  );
}
