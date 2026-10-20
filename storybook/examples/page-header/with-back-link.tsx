import { Badge } from '~/components/ui/badge';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { PageContent } from '~/components/ui/page-content';
import { PageHeaderBackLink, PageHeaderGroup, PageHeaderMeta, PageTitle } from '~/components/ui/page-header';

/** Navigation above the title; `PageHeaderMeta` for a status and facts under it. */
export function PageHeaderWithBackLink() {
  return (
    <PageContent
      header={
        <>
          <PageHeaderBackLink href='#invoices'>Invoices</PageHeaderBackLink>
          <PageHeaderGroup>
            <PageTitle>Invoice INV-2041</PageTitle>
            <PageHeaderMeta>
              <Badge intent='warning'>Due soon</Badge>
              <span>Sent on March 12</span>
            </PageHeaderMeta>
          </PageHeaderGroup>
        </>
      }>
      <InsetCard>
        <InsetCardHeader>
          <InsetCardTitle>Line items</InsetCardTitle>
        </InsetCardHeader>
        <InsetCardContent className='h-16' />
      </InsetCard>
    </PageContent>
  );
}
