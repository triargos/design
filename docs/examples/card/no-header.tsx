import { Card, CardContent } from '~/components/ui/card';

/** Content alone; the shell shows as a 4px rim. */
export function CardNoHeader() {
  return (
    <Card className='w-full max-w-xl'>
      <CardContent className='p-group'>
        <p className='text-body text-muted-foreground'>A card without a header.</p>
      </CardContent>
    </Card>
  );
}
