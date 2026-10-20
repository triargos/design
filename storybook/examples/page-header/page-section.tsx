import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { PageSection } from '~/components/ui/page-header';

/** `PageSection`: a titled group of cards inside a page. */
export function PageHeaderPageSection() {
  return (
    <PageSection title='Notifications' description='When we let you and your team know.' className='w-full max-w-2xl'>
      <InsetCard>
        <InsetCardHeader>
          <InsetCardTitle>Email</InsetCardTitle>
        </InsetCardHeader>
        <InsetCardContent className='h-16' />
      </InsetCard>
      <InsetCard>
        <InsetCardHeader>
          <InsetCardTitle>Push</InsetCardTitle>
        </InsetCardHeader>
        <InsetCardContent className='h-16' />
      </InsetCard>
    </PageSection>
  );
}
