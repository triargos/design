import {
  InsetCard,
  InsetCardContent,
  InsetCardDescription,
  InsetCardHeader,
  InsetCardTitle,
} from '~/components/ui/inset-card';

/** One sentence; long copy makes the shell read as a gray block. */
export function InsetCardWithDescription() {
  return (
    <InsetCard className='w-full max-w-xl'>
      <InsetCardHeader>
        <InsetCardTitle>Benachrichtigungen</InsetCardTitle>
        <InsetCardDescription>Wann wir dir eine E-Mail schicken.</InsetCardDescription>
      </InsetCardHeader>
      <InsetCardContent className='p-group'>
        <p className='text-body text-muted-foreground'>Inhalt der Karte.</p>
      </InsetCardContent>
    </InsetCard>
  );
}
