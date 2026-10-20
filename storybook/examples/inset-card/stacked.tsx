import { Badge } from '~/components/ui/badge';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';

/** Peer cards sit one group step apart, in a stack or in columns. */
export function InsetCardStacked() {
  return (
    <div className='flex w-full max-w-xl flex-col gap-group'>
      <div className='grid gap-group sm:grid-cols-2'>
        {['Website redesign', 'Mobile app'].map((title) => (
          <InsetCard key={title}>
            <InsetCardHeader>
              <InsetCardTitle>{title}</InsetCardTitle>
            </InsetCardHeader>
            <InsetCardContent className='flex flex-col items-start gap-2 p-group'>
              <Badge intent='success'>Active</Badge>
              <p className='text-body text-muted-foreground'>Two cards side by side.</p>
            </InsetCardContent>
          </InsetCard>
        ))}
      </div>
      <InsetCard>
        <InsetCardHeader>
          <InsetCardTitle>Documents</InsetCardTitle>
        </InsetCardHeader>
        <InsetCardContent className='p-group'>
          <p className='text-body text-muted-foreground'>One card across the full width.</p>
        </InsetCardContent>
      </InsetCard>
    </div>
  );
}
