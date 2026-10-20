import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';

/** Filters and single choices, in the brand fill. */
export function TabsPill() {
  return (
    <Tabs defaultValue='all'>
      <TabsList variant='pill'>
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
