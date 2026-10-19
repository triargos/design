import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

export function TabsInACard() {
  return (
    <InsetCard className='w-full max-w-md'>
      <InsetCardHeader>
        <InsetCardTitle>Anmeldung Mia Schmidt</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='p-group'>
        <Tabs defaultValue='details'>
          <TabsList variant='underline'>
            <TabsTrigger value='details'>Angaben</TabsTrigger>
            <TabsTrigger value='files'>Dateien</TabsTrigger>
            <TabsTrigger value='history'>Verlauf</TabsTrigger>
          </TabsList>
          <TabsContent value='details' className='text-body text-muted-foreground'>
            Angaben zum Kind.
          </TabsContent>
          <TabsContent value='files' className='text-body text-muted-foreground'>
            2 Dateien.
          </TabsContent>
          <TabsContent value='history' className='text-body text-muted-foreground'>
            Eingereicht am 12. März.
          </TabsContent>
        </Tabs>
      </InsetCardContent>
    </InsetCard>
  );
}
