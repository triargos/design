import { CopyButton } from '~/components/ui/copy-button';

/** Icon-only and ghost: the icon springs into a check, then back after two seconds. */
export function CopyButtonDefault() {
  return <CopyButton value='https://acme.example/invite/k3f9' label='Copy invite link' />;
}
