import { Separator } from '~/components/ui/separator';

export function SeparatorVertical() {
  return (
    <div className='flex h-6 items-center gap-2 text-body text-muted-foreground'>
      <span>Entwurf</span>
      <Separator orientation='vertical' />
      <span>Zuletzt gespeichert 09:30</span>
    </div>
  );
}
