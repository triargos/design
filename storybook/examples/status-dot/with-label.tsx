import { Item, ItemContent, ItemDescription, ItemTitle } from '~/components/ui/item';
import { StatusDot } from '~/components/ui/status-dot';

/** The dot alone is decorative: the label names the state. */
export function StatusDotWithLabel() {
  return (
    <Item className='w-80'>
      <ItemContent>
        <ItemTitle>Lena Park</ItemTitle>
        <ItemDescription>Design</ItemDescription>
      </ItemContent>
      <span className='flex items-center gap-1.5 text-caption text-muted-foreground'>
        <StatusDot intent='success' />
        Online
      </span>
    </Item>
  );
}
