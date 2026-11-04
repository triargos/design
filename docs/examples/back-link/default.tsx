import { BackLink } from '~/components/ui/back-link';

export function BackLinkDefault() {
  return (
    <div className='flex flex-col gap-group'>
      <BackLink href='#projects'>Projects</BackLink>
      <hgroup className='flex flex-col gap-tight'>
        <h1 className='text-title text-balance'>Website redesign</h1>
        <p className='text-body text-pretty text-muted-foreground'>
          Everything the team ships for the new site this quarter.
        </p>
      </hgroup>
    </div>
  );
}
