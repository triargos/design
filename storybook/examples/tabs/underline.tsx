import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';

/** Sections inside a card or a popup. */
export function TabsUnderline() {
  return (
    <Tabs defaultValue='all'>
      <TabsList variant='underline'>
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
