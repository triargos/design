import { InsetCard, InsetCardContent } from '~/components/ui/inset-card';

/** Content alone; the shell shows as a 4px rim. */
export function InsetCardNoHeader() {
  return (
    <InsetCard className='w-full max-w-xl'>
      <InsetCardContent className='p-group'>
        <p className='text-body text-muted-foreground'>Eine Karte ohne Kopfzeile.</p>
      </InsetCardContent>
    </InsetCard>
  );
}
