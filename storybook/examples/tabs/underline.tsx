import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';

/** Sections inside a card or a popup. */
export function TabsUnderline() {
  return (
    <Tabs defaultValue='all'>
      <TabsList variant='underline'>
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
