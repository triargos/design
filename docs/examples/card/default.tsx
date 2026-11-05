import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

/** The shell: the header a title band on the tint, the content a panel inside it. Every block on a page is one. */
export function CardDefault() {
  return (
    <Card className='w-full max-w-xl'>
      <CardHeader>
        <CardTitle>Files</CardTitle>
      </CardHeader>
      <CardContent className='p-card'>
        <p className='text-body text-muted-foreground'>Card content.</p>
      </CardContent>
    </Card>
  );
}
