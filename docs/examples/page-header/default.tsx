import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { PageContent } from '~/components/ui/page-content';
import { PageDescription, PageHeaderGroup, PageTitle } from '~/components/ui/page-header';

/** Title and description; `PageContent` sets the 32px to the content, whatever the header holds. */
export function PageHeaderDefault() {
  return (
    <PageContent
      header={
        <PageHeaderGroup>
          <PageTitle>Projects</PageTitle>
          <PageDescription>Everything your team is working on this quarter.</PageDescription>
        </PageHeaderGroup>
      }>
      <InsetCard>
        <InsetCardHeader>
          <InsetCardTitle>Active</InsetCardTitle>
        </InsetCardHeader>
        <InsetCardContent className='h-16' />
      </InsetCard>
    </PageContent>
  );
}
