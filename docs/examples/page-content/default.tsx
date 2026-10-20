import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { PageContent } from '~/components/ui/page-content';
import { PageDescription, PageHeaderGroup, PageTitle } from '~/components/ui/page-header';

/** The header, then the content 32px below it; blocks 16px apart. */
export function PageContentDefault() {
  return (
    <PageContent
      className='w-full max-w-2xl'
      header={
        <PageHeaderGroup>
          <PageTitle>Tasks</PageTitle>
          <PageDescription>Everything assigned to you this week.</PageDescription>
        </PageHeaderGroup>
      }>
      <InsetCard>
        <InsetCardHeader>
          <InsetCardTitle>Due today</InsetCardTitle>
        </InsetCardHeader>
        <InsetCardContent className='h-16' />
      </InsetCard>
      <InsetCard>
        <InsetCardHeader>
          <InsetCardTitle>This week</InsetCardTitle>
        </InsetCardHeader>
        <InsetCardContent className='h-16' />
      </InsetCard>
    </PageContent>
  );
}
