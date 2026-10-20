import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { PageContent } from '~/components/ui/page-content';
import { PageHeaderGroup, PageSection, PageTitle } from '~/components/ui/page-header';

/** A `PageSection` that is a direct child sits 48px from its neighbours. */
export function PageContentWithSections() {
  return (
    <PageContent
      className='w-full max-w-2xl'
      header={
        <PageHeaderGroup>
          <PageTitle>Settings</PageTitle>
        </PageHeaderGroup>
      }>
      <PageSection title='Workspace' description='Name, logo and billing address.'>
        <InsetCard>
          <InsetCardHeader>
            <InsetCardTitle>General</InsetCardTitle>
          </InsetCardHeader>
          <InsetCardContent className='h-16' />
        </InsetCard>
      </PageSection>
      <PageSection title='Notifications' description='When we let your team know.'>
        <InsetCard>
          <InsetCardHeader>
            <InsetCardTitle>Email</InsetCardTitle>
          </InsetCardHeader>
          <InsetCardContent className='h-16' />
        </InsetCard>
      </PageSection>
    </PageContent>
  );
}
