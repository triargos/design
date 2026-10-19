import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { PageContent } from '~/components/ui/page-content';
import { PageHeader, PageHeaderGroup, PageSection } from '~/components/ui/page-header';

/** A `PageSection` that is a direct child sits 48px from its neighbours. */
export function PageContentWithSections() {
  return (
    <PageContent
      className='w-full max-w-2xl'
      header={
        <PageHeaderGroup>
          <PageHeader>Einstellungen</PageHeader>
        </PageHeaderGroup>
      }>
      <PageSection title='Schule' description='Name, Logo und Adresse.'>
        <InsetCard>
          <InsetCardHeader>
            <InsetCardTitle>Allgemein</InsetCardTitle>
          </InsetCardHeader>
          <InsetCardContent className='h-16' />
        </InsetCard>
      </PageSection>
      <PageSection title='Benachrichtigungen' description='Wann wir Eltern informieren.'>
        <InsetCard>
          <InsetCardHeader>
            <InsetCardTitle>E-Mail</InsetCardTitle>
          </InsetCardHeader>
          <InsetCardContent className='h-16' />
        </InsetCard>
      </PageSection>
    </PageContent>
  );
}
