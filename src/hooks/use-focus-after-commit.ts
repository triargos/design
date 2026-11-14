import * as React from 'react';

type FindFocusTarget = () => HTMLElement | null | undefined;

interface PendingFocus {
  readonly findTarget: FindFocusTarget;
  readonly options: FocusOptions | undefined;
}

export function useFocusAfterCommit() {
  const [pendingFocus, setPendingFocus] = React.useState<PendingFocus | null>(null);
  React.useLayoutEffect(() => {
    pendingFocus?.findTarget()?.focus(pendingFocus.options);
  }, [pendingFocus]);
  return React.useCallback(
    (findTarget: FindFocusTarget, options?: FocusOptions) => setPendingFocus({ findTarget, options }),
    [],
  );
}
