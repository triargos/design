import { PlusIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { PageContent } from '~/components/ui/page-content';
import {
  PageDescription,
  PageHeader,
  PageHeaderGroup,
  PageHeaderRow,
  PageHeaderTools,
} from '~/components/ui/page-header';

/** Tools on the right: the main action last. */
export function PageHeaderWithTools() {
  return (
    <PageContent
      header={
        <PageHeaderRow>
          <PageHeaderGroup>
            <PageHeader>Nachmittagsbetreuung</PageHeader>
            <PageDescription>Anmeldungen für das Schuljahr 2025/26.</PageDescription>
          </PageHeaderGroup>
          <PageHeaderTools>
            <Button type='button' intent='neutral' emphasis='raised'>
              Exportieren
            </Button>
            <Button type='button'>
              <PlusIcon data-icon='inline-start' />
              Neuer Antrag
            </Button>
          </PageHeaderTools>
        </PageHeaderRow>
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
