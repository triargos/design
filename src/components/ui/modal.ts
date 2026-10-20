import { cardSurface } from '~/components/ui/inset-card';

/**
 * The one modal shape, shared by `Dialog`, `AlertDialog` and `Sheet`: a shell (`--shell`, as in `InsetCard`) with the
 * header and footer on it, and the body as a card. The body marks itself `data-modal='body'`, so a header inside it (a
 * confirmation) drops the shell padding.
 */

/**
 * Dims and blurs the page behind every modal. The exit holds its last frame (`fill-mode-forwards`): a popup that leaves
 * slower than the backdrop fades (Sheet: `duration-move`) keeps the portal mounted, and without the hold the backdrop
 * would snap back to full blur until it unmounts.
 */
export const modalBackdrop =
  'fixed inset-0 isolate z-50 bg-black/10 duration-enter ease-enter data-closed:animate-out data-closed:fade-out-0 data-closed:fill-mode-forwards data-open:animate-in data-open:fade-in-0 supports-backdrop-filter:backdrop-blur-xs';

/**
 * The shell. Opaque: it sits over a blurred backdrop. Like `InsetCard`, it frames the body 4px in on every side, its
 * corners concentric (`rounded-inner` = dialog radius − 4px). A shell that must look different sets `--modal-shell`.
 */
export const modalShell = [
  'flex flex-col p-1 text-body text-popover-foreground shadow-modal outline-none',
  '[--outer-inset:--spacing(1)] [--outer-radius:var(--radius-dialog)]',
  'bg-(--modal-shell) [--modal-shell:var(--shell)]',
].join(' ');

/**
 * Title and description on the shell, `group` + 1px in to share the body text's edge (inside its border). The right
 * padding clears the 36px close button (`icon-sm`, 12px in). Inside the body (a confirmation), the body's padding
 * takes over.
 */
export const modalHeader =
  'flex flex-col gap-tight pt-3 pr-11 pb-3 pl-[calc(var(--spacing-group)+1px)] in-data-[modal=body]:p-0 in-data-[modal=body]:pr-8';

/** The card, inset 4px in the shell like `InsetCardContent`. */
export const modalBody = `flex flex-col gap-group rounded-inner p-group text-card-foreground ${cardSurface}`;

/** Actions on the shell, end-aligned; stacked full width below `sm`, the main action on top. */
export const modalFooter =
  'flex flex-col-reverse gap-related px-[calc(var(--spacing-group)+1px)] pt-3 pb-3 sm:flex-row sm:justify-end';

/** The close button's place: 12px from the top and right, concentric with the modal's corner. */
export const modalClose = 'absolute top-3 right-3 rounded-inner [--outer-inset:--spacing(3)]';
