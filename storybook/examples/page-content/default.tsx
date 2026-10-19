import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { PageContent } from '~/components/ui/page-content';
import { PageDescription, PageHeader, PageHeaderGroup } from '~/components/ui/page-header';

/** The header, then the content 32px below it; blocks 16px apart. */
export function PageContentDefault() {
  return (
    <PageContent
      className='w-full max-w-2xl'
      header={
        <PageHeaderGroup>
          <PageHeader>Abwesenheiten</PageHeader>
          <PageDescription>Krankmeldungen und Termine der Kinder dieser Woche.</PageDescription>
        </PageHeaderGroup>
      }>
      <InsetCard>
        <InsetCardHeader>
          <InsetCardTitle>Heute</InsetCardTitle>
        </InsetCardHeader>
        <InsetCardContent className='h-16' />
      </InsetCard>
      <InsetCard>
        <InsetCardHeader>
          <InsetCardTitle>Diese Woche</InsetCardTitle>
        </InsetCardHeader>
        <InsetCardContent className='h-16' />
      </InsetCard>
    </PageContent>
  );
}
