import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '~/components/ui/command';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';

const WORKSPACES = ['Acme', 'Globex', 'Initech', 'Umbrella'];

/** Inline in a card: a filterable list without a popup. */
export function CommandStandalone() {
  return (
    <Card className='w-full max-w-md'>
      <CardHeader>
        <CardTitle>Switch workspace</CardTitle>
      </CardHeader>
      <CardContent className='overflow-hidden'>
        <Command>
          <CommandInput placeholder='Search workspaces' />
          <CommandList>
            <CommandEmpty>No workspace found</CommandEmpty>
            {WORKSPACES.map((workspace) => (
              <CommandItem key={workspace}>{workspace}</CommandItem>
            ))}
          </CommandList>
        </Command>
      </CardContent>
    </Card>
  );
}
