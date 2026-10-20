import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

export function TabsInACard() {
  return (
    <InsetCard className='w-full max-w-md'>
      <InsetCardHeader>
        <InsetCardTitle>Website redesign</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='p-group'>
        <Tabs defaultValue='details'>
          <TabsList variant='underline'>
            <TabsTrigger value='details'>Details</TabsTrigger>
            <TabsTrigger value='files'>Files</TabsTrigger>
            <TabsTrigger value='activity'>Activity</TabsTrigger>
          </TabsList>
          <TabsContent value='details' className='text-body text-muted-foreground'>
            Due June 30, owned by Jordan Lee.
          </TabsContent>
          <TabsContent value='files' className='text-body text-muted-foreground'>
            2 files.
          </TabsContent>
          <TabsContent value='activity' className='text-body text-muted-foreground'>
            Created on March 12.
          </TabsContent>
        </Tabs>
      </InsetCardContent>
    </InsetCard>
  );
}
