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
        <InsetCardTitle>Notifications</InsetCardTitle>
        <InsetCardDescription>When we send you an email.</InsetCardDescription>
      </InsetCardHeader>
      <InsetCardContent className='p-group'>
        <p className='text-body text-muted-foreground'>Card content.</p>
      </InsetCardContent>
    </InsetCard>
  );
}
