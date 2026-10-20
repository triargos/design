import { Alert, AlertContent } from '~/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';

/** Between cards, one group step apart; its text starts on the edge of the section title and the card headers. */
export function AlertInASection() {
  return (
    <section className='flex w-full max-w-2xl flex-col gap-group'>
      <hgroup className='flex flex-col gap-tight px-[calc(--spacing(1)+1px+var(--spacing-group))]'>
        <h2 className='text-heading text-balance'>Billing</h2>
        <p className='text-body text-pretty text-muted-foreground'>How the workspace pays.</p>
      </hgroup>
      <Alert intent='warning'>
        <AlertContent>
          <p className='font-medium'>Your trial ends on March 31</p>
          <p>Add a payment method to keep your projects.</p>
        </AlertContent>
      </Alert>
      <Card>
        <CardHeader>
          <CardTitle>Payment method</CardTitle>
          <CardDescription>Invoices are charged to this card.</CardDescription>
        </CardHeader>
        <CardContent className='p-card'>
          <p className='text-body text-muted-foreground'>No card on file.</p>
        </CardContent>
      </Card>
    </section>
  );
}
