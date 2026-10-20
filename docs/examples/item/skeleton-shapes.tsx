import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { ItemListSkeleton } from '~/components/ui/item';

/** Match the real rows: a title alone, an icon tile, an avatar. */
export function ItemSkeletonShapes() {
  return (
    <div className='grid w-full max-w-3xl items-start gap-group md:grid-cols-3'>
      <Card>
        <CardHeader>
          <CardTitle>Projects</CardTitle>
        </CardHeader>
        <CardContent className='overflow-hidden'>
          <ItemListSkeleton rows={3} description={false} />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent className='overflow-hidden'>
          <ItemListSkeleton rows={3} media='icon' />
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent className='overflow-hidden'>
          <ItemListSkeleton rows={3} media='avatar' />
        </CardContent>
      </Card>
    </div>
  );
}
