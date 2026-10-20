import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { SkeletonList } from '~/components/ui/skeleton';

/** `SkeletonList`: n full-width lines. */
export function SkeletonListExample() {
  return (
    <InsetCard className='w-full max-w-md'>
      <InsetCardHeader>
        <InsetCardTitle>Members</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='p-4'>
        <SkeletonList length={4} />
      </InsetCardContent>
    </InsetCard>
  );
}
