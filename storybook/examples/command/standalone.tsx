import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '~/components/ui/command';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';

const WORKSPACES = ['Acme', 'Globex', 'Initech', 'Umbrella'];

/** Inline in a card: a filterable list without a popup. */
export function CommandStandalone() {
  return (
    <InsetCard className='w-full max-w-md'>
      <InsetCardHeader>
        <InsetCardTitle>Switch workspace</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='overflow-hidden'>
        <Command>
          <CommandInput placeholder='Search workspaces' />
          <CommandList>
            <CommandEmpty>No workspace found</CommandEmpty>
            {WORKSPACES.map((workspace) => (
              <CommandItem key={workspace}>{workspace}</CommandItem>
            ))}
          </CommandList>
        </Command>
      </InsetCardContent>
    </InsetCard>
  );
}
