import { Callout, CalloutContent } from '~/components/ui/callout';
import {
  InsetCard,
  InsetCardContent,
  InsetCardDescription,
  InsetCardHeader,
  InsetCardTitle,
} from '~/components/ui/inset-card';
import { PageSection } from '~/components/ui/page-header';

/** Between cards, one group step apart; its text starts on the edge of the section title and the card headers. */
export function CalloutInASection() {
  return (
    <PageSection title='Anmeldung' description='Einstellungen für das Anmeldeformular.' className='w-full max-w-2xl'>
      <Callout intent='warning'>
        <CalloutContent>
          <p className='font-medium'>Frist bis 31. März</p>
          <p>Danach können Eltern keine Anträge mehr stellen.</p>
        </CalloutContent>
      </Callout>
      <InsetCard>
        <InsetCardHeader>
          <InsetCardTitle>Formular</InsetCardTitle>
          <InsetCardDescription>Welche Angaben Eltern machen.</InsetCardDescription>
        </InsetCardHeader>
        <InsetCardContent className='p-group'>
          <p className='text-body text-muted-foreground'>Inhalt der Karte.</p>
        </InsetCardContent>
      </InsetCard>
    </PageSection>
  );
}
