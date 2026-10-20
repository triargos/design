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
    <PageSection title='Billing' description='How the workspace pays.' className='w-full max-w-2xl'>
      <Callout intent='warning'>
        <CalloutContent>
          <p className='font-medium'>Your trial ends on March 31</p>
          <p>Add a payment method to keep your projects.</p>
        </CalloutContent>
      </Callout>
      <InsetCard>
        <InsetCardHeader>
          <InsetCardTitle>Payment method</InsetCardTitle>
          <InsetCardDescription>Invoices are charged to this card.</InsetCardDescription>
        </InsetCardHeader>
        <InsetCardContent className='p-group'>
          <p className='text-body text-muted-foreground'>No card on file.</p>
        </InsetCardContent>
      </InsetCard>
    </PageSection>
  );
}
