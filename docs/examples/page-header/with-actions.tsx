import { PlusIcon } from 'lucide-react';

import { Button } from '~/components/ui/button';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { PageContent } from '~/components/ui/page-content';
import {
  PageDescription,
  PageHeaderActions,
  PageHeaderGroup,
  PageHeaderRow,
  PageTitle,
} from '~/components/ui/page-header';

/** Actions on the right: the main action last. */
export function PageHeaderWithActions() {
  return (
    <PageContent
      header={
        <PageHeaderRow>
          <PageHeaderGroup>
            <PageTitle>Projects</PageTitle>
            <PageDescription>Everything your team is working on this quarter.</PageDescription>
          </PageHeaderGroup>
          <PageHeaderActions>
            <Button>Export</Button>
            <Button intent='primary'>
              <PlusIcon data-icon='inline-start' />
              New project
            </Button>
          </PageHeaderActions>
        </PageHeaderRow>
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
