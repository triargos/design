import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

/** `intent='destructive'` marks only the title. Below sm the row stacks, the button full width. */
export function CardDestructive() {
  return (
    <Card intent='destructive' className='w-full max-w-xl'>
      <CardHeader>
        <CardTitle>Delete workspace</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-between gap-group max-sm:flex-col max-sm:items-stretch'>
          <p className='min-w-0 text-body text-pretty text-muted-foreground'>
            Removes every project, task and document for good.
          </p>
          <Button intent='destructive'>Delete workspace</Button>
        </div>
      </CardContent>
    </Card>
  );
}
