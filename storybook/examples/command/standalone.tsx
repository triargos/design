import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '~/components/ui/command';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';

const SCHOOLS = ['Grundschule am See', 'Gymnasium Nord', 'Realschule Mitte', 'Förderschule Süd'];

/** Inline in a card: a filterable list without a popup. */
export function CommandStandalone() {
  return (
    <InsetCard className='w-full max-w-md'>
      <InsetCardHeader>
        <InsetCardTitle>Schule wechseln</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='overflow-hidden'>
        <Command>
          <CommandInput placeholder='Schule suchen' />
          <CommandList>
            <CommandEmpty>Keine Schule gefunden</CommandEmpty>
            {SCHOOLS.map((school) => (
              <CommandItem key={school}>{school}</CommandItem>
            ))}
          </CommandList>
        </Command>
      </InsetCardContent>
    </InsetCard>
  );
}
