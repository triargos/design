import { Badge } from '~/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

/** Peer cards sit one group step apart, in a stack or in columns. */
export function CardStacked() {
  return (
    <div className='flex w-full max-w-xl flex-col gap-group'>
      <div className='grid gap-group sm:grid-cols-2'>
        {['Website redesign', 'Mobile app'].map((title) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className='flex flex-col items-start gap-2 p-group'>
              <Badge intent='success'>Active</Badge>
              <p className='text-body text-muted-foreground'>Two cards side by side.</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent className='p-group'>
          <p className='text-body text-muted-foreground'>One card across the full width.</p>
        </CardContent>
      </Card>
    </div>
  );
}
