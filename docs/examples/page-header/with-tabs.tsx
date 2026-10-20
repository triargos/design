import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { PageContent } from '~/components/ui/page-content';
import { PageDescription, PageHeaderGroup, PageTitle } from '~/components/ui/page-header';
import { TabsLink, TabsNav } from '~/components/ui/tabs';

/** View tabs below the title: a `TabsNav`. */
export function PageHeaderWithTabs() {
  return (
    <PageContent
      header={
        <>
          <PageHeaderGroup>
            <PageTitle>Website redesign</PageTitle>
            <PageDescription>The new marketing site, due June 30.</PageDescription>
          </PageHeaderGroup>
          <TabsNav>
            <TabsLink href='#overview' current>
              Overview
            </TabsLink>
            <TabsLink href='#tasks'>Tasks</TabsLink>
            <TabsLink href='#settings'>Settings</TabsLink>
          </TabsNav>
        </>
      }>
      <InsetCard>
        <InsetCardHeader>
          <InsetCardTitle>Milestones</InsetCardTitle>
        </InsetCardHeader>
        <InsetCardContent className='h-16' />
      </InsetCard>
    </PageContent>
  );
}
