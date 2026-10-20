import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';

/** Segmented: views of one page. The raised chip slides to the active tab. */
export function TabsDefault() {
  return (
    <Tabs defaultValue='all'>
      <TabsList>
        <TabsTrigger value='all'>All</TabsTrigger>
        <TabsTrigger value='open'>Open</TabsTrigger>
        <TabsTrigger value='done'>Done</TabsTrigger>
        <TabsTrigger value='archived' disabled>
          Archived
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
