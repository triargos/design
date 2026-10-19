import type { ReactNode } from 'react';

import { type ToastManager, toastManager } from '~/components/ui/toast';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

export interface ToastOptions {
  /** Upserts the toast with this id. Defaults to the type, title and description, so a repeat replaces the toast. */
  readonly id?: string | undefined;
  readonly description?: ReactNode;
  /** Milliseconds until it closes; `0` keeps it open until dismissed. Defaults to the provider's 5000. */
  readonly timeout?: number | undefined;
  readonly action?: { readonly label: ReactNode; readonly onClick: () => void } | undefined;
}

export interface ToastPromiseOptions<A> {
  readonly loading: ReactNode;
  /** No message closes the loading toast. */
  readonly success?: ReactNode | ((value: A) => ReactNode);
  readonly error?: ReactNode | ((error: unknown) => ReactNode);
}

/** Dedupe key: the same type, title and description show one toast. Rich titles get a fresh id. */
const dedupeId = (type: ToastType | undefined, title: ReactNode, description: ReactNode): string | undefined => {
  if (typeof title !== 'string') return undefined;
  if (description !== undefined && typeof description !== 'string') return undefined;
  return JSON.stringify([type ?? 'default', title, description ?? '']);
};

const resolve = <A>(message: ReactNode | ((value: A) => ReactNode), value: A): ReactNode =>
  typeof message === 'function' ? message(value) : message;

/** `toast` on a given manager; stories pass their own so each stage renders its own stack. */
export function makeToast(manager: ToastManager) {
  const show = (type: ToastType | undefined, title: ReactNode, options: ToastOptions = {}): string => {
    const { action, description, timeout } = options;
    // Every key is set, so an upsert (loading → success) does not keep the previous description or action.
    return manager.add({
      id: options.id ?? dedupeId(type, title, description),
      type,
      title,
      description,
      timeout,
      actionProps: action ? { children: action.label, onClick: action.onClick } : undefined,
    });
  };

  return Object.assign((title: ReactNode, options?: ToastOptions) => show(undefined, title, options), {
    success: (title: ReactNode, options?: ToastOptions) => show('success', title, options),
    error: (title: ReactNode, options?: ToastOptions) => show('error', title, options),
    info: (title: ReactNode, options?: ToastOptions) => show('info', title, options),
    warning: (title: ReactNode, options?: ToastOptions) => show('warning', title, options),
    /** Stays open until updated through its id or dismissed. */
    loading: (title: ReactNode, options?: ToastOptions) => show('loading', title, options),
    /** A loading toast that turns into success or error when the promise settles. Returns the promise. */
    promise: <A>(promise: Promise<A>, { loading, success, error }: ToastPromiseOptions<A>): Promise<A> => {
      const id = show('loading', loading);
      const settle = (type: 'success' | 'error', message: ReactNode) =>
        message === undefined || message === null ? manager.close(id) : show(type, message, { id });
      promise.then(
        (value) => settle('success', resolve(success, value)),
        (cause: unknown) => settle('error', resolve(error, cause)),
      );
      return promise;
    },
    /** Closes the toast with this id, or every toast. */
    dismiss: (id?: string) => manager.close(id),
  });
}

/**
 * Shows a toast and returns its id. Pass the id back (`{ id }`) to update the toast in place, e.g. loading → success.
 */
export const toast = makeToast(toastManager);
