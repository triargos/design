import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

/** A shell (the label strip) around a card (the content). Every block on a page is one. */
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
