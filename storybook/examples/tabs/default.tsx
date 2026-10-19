import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';

/** Segmented: views of one page. The raised chip slides to the active tab. */
export function TabsDefault() {
  return (
    <Tabs defaultValue='all'>
      <TabsList>
        <TabsTrigger value='all'>Alle</TabsTrigger>
        <TabsTrigger value='open'>Offen</TabsTrigger>
        <TabsTrigger value='approved'>Genehmigt</TabsTrigger>
        <TabsTrigger value='archived' disabled>
          Archiviert
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
