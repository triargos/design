import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { PageContent } from '~/components/ui/page-content';
import { PageDescription, PageHeader, PageHeaderGroup } from '~/components/ui/page-header';

/** Title and description; `PageContent` sets the 32px to the content, whatever the header holds. */
export function PageHeaderDefault() {
  return (
    <PageContent
      header={
        <PageHeaderGroup>
          <PageHeader>Nachmittagsbetreuung</PageHeader>
          <PageDescription>Anmeldungen für das Schuljahr 2025/26.</PageDescription>
        </PageHeaderGroup>
      }>
      <InsetCard>
        <InsetCardHeader>
          <InsetCardTitle>Anmeldungen</InsetCardTitle>
        </InsetCardHeader>
        <InsetCardContent className='h-16' />
      </InsetCard>
    </PageContent>
  );
}
