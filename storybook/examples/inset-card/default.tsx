import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';

/** A shell (the label strip) around a card (the content). Every block on a page is one. */
export function InsetCardDefault() {
  return (
    <InsetCard className='w-full max-w-xl'>
      <InsetCardHeader>
        <InsetCardTitle>Files</InsetCardTitle>
      </InsetCardHeader>
      <InsetCardContent className='p-group'>
        <p className='text-body text-muted-foreground'>Card content.</p>
      </InsetCardContent>
    </InsetCard>
  );
}
