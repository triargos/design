import { Card, CardContent } from '~/components/ui/card';

/** Content alone. */
export function CardNoHeader() {
  return (
    <Card className='w-full max-w-xl'>
      <CardContent>
        <p className='text-body text-muted-foreground'>A card without a header.</p>
      </CardContent>
    </Card>
  );
}
