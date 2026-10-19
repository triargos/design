import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { PageSection } from '~/components/ui/page-header';

/** `PageSection`: a titled group of cards inside a page. */
export function PageHeaderPageSection() {
  return (
    <PageSection
      title='Benachrichtigungen'
      description='Wann wir Eltern und Lehrkräfte informieren.'
      className='w-full max-w-2xl'>
      <InsetCard>
        <InsetCardHeader>
          <InsetCardTitle>E-Mail</InsetCardTitle>
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
