import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';

/** Filters and single choices, in the brand fill. */
export function TabsPill() {
  return (
    <Tabs defaultValue='all'>
      <TabsList variant='pill'>
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
