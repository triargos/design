import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

/** One sentence; long copy makes the shell read as a gray block. */
export function CardWithDescription() {
  return (
    <Card className='w-full max-w-xl'>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>When we send you an email.</CardDescription>
      </CardHeader>
      <CardContent className='p-card'>
        <p className='text-body text-muted-foreground'>Card content.</p>
      </CardContent>
    </Card>
  );
}
