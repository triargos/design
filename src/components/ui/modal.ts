import { cardSurface } from '~/components/ui/inset-card';

/**
 * The one modal shape, shared by `Dialog`, `AlertDialog` and `Sheet`: a shell (`--shell`, the page's, as in `InsetCard`)
 * with the header and footer on it, and the body as a card. Parts mark themselves `data-modal='body' | 'footer'` so the
 * shell can see whether the body ends the modal.
 */

/**
 * Dims and blurs the page behind every modal. The exit holds its last frame (`fill-mode-forwards`): a popup that leaves
 * slower than the backdrop fades (Sheet: `duration-move`) keeps the portal mounted, and without the hold the backdrop
 * would snap back to full blur until it unmounts.
 */
export const modalBackdrop =
  'fixed inset-0 isolate z-50 bg-black/10 duration-enter ease-enter data-closed:animate-out data-closed:fade-out-0 data-closed:fill-mode-forwards data-open:animate-in data-open:fade-in-0 supports-backdrop-filter:backdrop-blur-xs';

/**
 * The shell. Opaque: it sits over a blurred backdrop. The tint is a sized background image: when the body ends the
 * modal (no footer), it stops 2rem (more than the corner radius) above the bottom, so the shell cannot show through
 * the body's anti-aliased bottom corners. A shell that must look different sets `--modal-shell`.
 */
export const modalShell = [
  'flex flex-col text-body text-popover-foreground shadow-modal outline-none [--outer-radius:var(--radius-dialog)]',
  'bg-[linear-gradient(var(--modal-shell),var(--modal-shell))] bg-no-repeat [--modal-shell:var(--shell)]',
  'has-[[data-modal=body]:not(:has(~[data-modal=footer]))]:bg-size-[100%_calc(100%-2rem)]',
].join(' ');

/**
 * Title and description on the shell, `group` + 1px in to share the body text's edge (inside its border). The right padding clears the 36px close button (`icon-sm`, 12px in). Inside the
 * body (a confirmation: no other content), the body's padding takes over.
 */
export const modalHeader =
  'flex flex-col gap-tight pt-4 pr-12 pb-3 pl-[calc(var(--spacing-group)+1px)] in-data-[modal=body]:p-0 in-data-[modal=body]:pr-8';

/** The card. Spans the modal's width; its corners are the modal's. */
export const modalBody = `flex flex-col gap-group rounded-dialog p-group text-card-foreground ${cardSurface}`;

/** Actions on the shell, end-aligned; stacked full width below `sm`, the main action on top. */
export const modalFooter =
  'flex flex-col-reverse gap-related px-[calc(var(--spacing-group)+1px)] pt-3 pb-4 sm:flex-row sm:justify-end';

/** The close button's place: 12px from the top and right, concentric with the modal's corner. */
export const modalClose = 'absolute top-3 right-3 rounded-inner [--outer-inset:--spacing(3)]';
