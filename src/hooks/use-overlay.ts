import * as React from 'react';

interface OpenOverlay {
  readonly close: () => void;
  readonly sensitive: boolean;
}

const openOverlays = new Map<string, OpenOverlay>();

/** Closes every open dialog, alert dialog, sheet and drawer, except a `sensitive` one. Call it on a route change. */
function closeOverlays() {
  for (const overlay of openOverlays.values()) if (!overlay.sensitive) overlay.close();
}

/** Whether an open overlay holds input the user would lose (`sensitive`): ask before leaving the page. */
function hasSensitiveOverlay() {
  return [...openOverlays.values()].some((overlay) => overlay.sensitive);
}

const OverlayOpenContext = React.createContext(true);

interface OverlayRootOptions<Details, Actions extends { close: () => void }> {
  readonly open: boolean | undefined;
  readonly defaultOpen: boolean | undefined;
  readonly onOpenChange: ((open: boolean, details: Details) => void) | undefined;
  readonly actionsRef: React.RefObject<Actions | null> | undefined;
  readonly sensitive: boolean;
}

/**
 * An overlay root's open state, controlled or not, registered for `closeOverlays` while open. Pass the returned
 * `actionsRef` and `onOpenChange` to the Base UI root and wrap it in `OverlayOpenContext` with `open`.
 */
function useOverlayRoot<Details, Actions extends { close: () => void }>({
  open,
  defaultOpen,
  onOpenChange,
  actionsRef,
  sensitive,
}: OverlayRootOptions<Details, Actions>) {
  const ownActionsRef = React.useRef<Actions | null>(null);
  const actions = actionsRef ?? ownActionsRef;
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen ?? false);
  const isOpen = open ?? uncontrolledOpen;
  const id = React.useId();

  React.useEffect(() => {
    if (!isOpen) return;
    openOverlays.set(id, { close: () => actions.current?.close(), sensitive });
    return () => {
      openOverlays.delete(id);
    };
  }, [id, isOpen, sensitive, actions]);

  const handleOpenChange = (next: boolean, details: Details) => {
    setUncontrolledOpen(next);
    onOpenChange?.(next, details);
  };

  return { open: isOpen, actionsRef: actions, onOpenChange: handleOpenChange };
}

/**
 * The popup's children, held at what they were while it was open: a dialog closing because its data was cleared keeps
 * showing that data through its exit animation instead of an empty state.
 */
function usePreservedContent(children: React.ReactNode): React.ReactNode {
  const open = React.use(OverlayOpenContext);
  const [preserved, setPreserved] = React.useState(children);
  if (open && preserved !== children) setPreserved(children);
  return open ? children : preserved;
}

export { closeOverlays, hasSensitiveOverlay, OverlayOpenContext, useOverlayRoot, usePreservedContent };
