import { Button } from '~/components/ui/button';
import { ShortcutTooltip } from '~/components/ui/shortcut-tooltip';

/** The control's name and its key. */
export function ShortcutTooltipDefault() {
  return (
    <ShortcutTooltip label='New task' shortcut={['C']}>
      <Button intent='primary'>New task</Button>
    </ShortcutTooltip>
  );
}
