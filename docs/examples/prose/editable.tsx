import { inputSurfaceVariants } from '~/components/ui/input';
import { proseVariants } from '~/components/ui/prose';

import { cn } from '~/lib/utils';

/**
 * `proseVariants()` on an editor's editable element, so the draft reads like the result. With TipTap, pass the same
 * classes as `editorProps.attributes.class`.
 */
export function ProseEditable() {
  return (
    <div
      contentEditable
      suppressContentEditableWarning
      role='textbox'
      aria-multiline='true'
      aria-label='Announcement'
      className={cn(inputSurfaceVariants({ scope: 'self' }), proseVariants(), 'min-h-32 w-full max-w-md px-3 py-2')}>
      <h2>Office closed on Friday</h2>
      <p>
        The office is closed on <strong>Friday, May 9</strong>. Tasks due that day move to Monday.
      </p>
    </div>
  );
}
