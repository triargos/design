import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { PageContent } from '~/components/ui/page-content';
import { PageDescription, PageHeader, PageHeaderGroup, PageHeaderSection } from '~/components/ui/page-header';
import { TabsList, TabsTrigger } from '~/components/ui/tabs';

/** View tabs below the title: `TabsList as='nav'`. */
export function PageHeaderWithTabs() {
  return (
    <PageContent
      header={
        <PageHeaderSection>
          <PageHeaderGroup>
            <PageHeader>Nachmittagsbetreuung</PageHeader>
            <PageDescription>Anmeldungen für das Schuljahr 2025/26.</PageDescription>
          </PageHeaderGroup>
          <TabsList as='nav'>
            <TabsTrigger href='/' current>
              Übersicht
            </TabsTrigger>
            <TabsTrigger href='/forms'>Formulare</TabsTrigger>
            <TabsTrigger href='/settings'>Einstellungen</TabsTrigger>
          </TabsList>
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
