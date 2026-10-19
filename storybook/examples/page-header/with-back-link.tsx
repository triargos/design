import { Badge } from '~/components/ui/badge';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { PageContent } from '~/components/ui/page-content';
import {
  PageHeader,
  PageHeaderBackLink,
  PageHeaderGroup,
  PageHeaderMeta,
  PageHeaderSection,
} from '~/components/ui/page-header';

/** Navigation above the title; `PageHeaderMeta` for a status and facts under it. */
export function PageHeaderWithBackLink() {
  return (
    <PageContent
      header={
        <PageHeaderSection>
          <PageHeaderBackLink to='/'>Anmeldungen</PageHeaderBackLink>
          <PageHeaderGroup>
            <PageHeader>Anmeldung von Mia Schmidt</PageHeader>
            <PageHeaderMeta>
              <Badge intent='warning'>In Prüfung</Badge>
              <span>Eingegangen am 12. März</span>
            </PageHeaderMeta>
          </PageHeaderGroup>
        </PageHeaderSection>
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
