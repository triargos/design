import { Button } from '~/components/ui/button';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';

/**
 * `tone='destructive'` marks only the title. The button sits 4px in the content, 8px from the shell’s edge:
 * `rounded-inner` with `--outer-inset` 8px. Below sm the row stacks, the button full width.
 */
export function InsetCardDestructive() {
  return (
    <InsetCard tone='destructive' className='w-full max-w-xl'>
      <InsetCardHeader>
        <InsetCardTitle>Konto löschen</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='flex items-center justify-between gap-group p-1 max-sm:flex-col max-sm:items-stretch max-sm:gap-2.5 max-sm:pt-2.5'>
        <p className='min-w-0 px-3 text-body text-muted-foreground'>Alle Daten werden endgültig entfernt.</p>
        <Button
          type='button'
          intent='destructive'
          emphasis='solid'
          size='sm'
          className='rounded-inner [--outer-inset:--spacing(2)]'>
          Konto löschen
        </Button>
      </InsetCardContent>
    </InsetCard>
  );
}
