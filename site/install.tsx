import { useSyncExternalStore } from 'react';

import { CopyButton } from '~/components/ui/copy-button';
import { TabsRadio, TabsRadioGroup } from '~/components/ui/tabs';

import { homepage } from '../registry.json';
import { Section } from '../docs/kit/blocks';

const RUNNERS = {
  pnpm: 'pnpm dlx shadcn@latest',
  npm: 'npx shadcn@latest',
  yarn: 'yarn dlx shadcn@latest',
  bun: 'bunx --bun shadcn@latest',
} as const;

type PackageManager = keyof typeof RUNNERS;

const PACKAGE_MANAGERS = Object.keys(RUNNERS) as ReadonlyArray<PackageManager>;
const KEY = 'packageManager';
const CHANGE = 'packagemanagerchange';

const subscribe = (onChange: () => void) => {
  window.addEventListener(CHANGE, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE, onChange);
    window.removeEventListener('storage', onChange);
  };
};

const readPackageManager = (): PackageManager =>
  PACKAGE_MANAGERS.find((name) => name === window.localStorage.getItem(KEY)) ?? 'pnpm';

const setPackageManager = (next: string) => {
  window.localStorage.setItem(KEY, next);
  window.dispatchEvent(new Event(CHANGE));
};

/** The package manager the commands use, shared by every page. Prerendered as pnpm. */
const usePackageManager = () => useSyncExternalStore(subscribe, readPackageManager, () => 'pnpm' as const);

/** The registry this site serves: its own origin, so a preview stage installs from itself. Prerendered as `homepage`. */
const useOrigin = () =>
  useSyncExternalStore(
    () => () => undefined,
    () => window.location.origin,
    () => homepage,
  );

function Command({ label, command }: { label: string; command: string }) {
  return (
    <div className='flex flex-col gap-tight'>
      <span className='px-1 text-caption text-muted-foreground'>{label}</span>
      <div className='flex items-center gap-related rounded-inner border border-(--edge) bg-card py-1 pr-1 pl-group'>
        <pre tabIndex={0} aria-label={label} className='min-w-0 flex-1 overflow-x-auto py-1 font-mono text-caption'>
          <code>{command}</code>
        </pre>
        <CopyButton value={command} label={`Copy: ${label}`} size='icon-xs' />
      </div>
    </div>
  );
}

/** The `shadcn` commands that add the component: the registry once per project, then the item `name`. */
export function Install({ name, title }: { name: string; title: string }) {
  const packageManager = usePackageManager();
  const runner = RUNNERS[packageManager];
  const origin = useOrigin();
  return (
    <Section title='Installation'>
      <div className='overflow-hidden rounded-card border border-border bg-shell'>
        <TabsRadioGroup
          variant='underline'
          value={packageManager}
          onValueChange={setPackageManager}
          aria-label='Package manager'
          className='px-group'>
          {PACKAGE_MANAGERS.map((name) => (
            <TabsRadio key={name} value={name}>
              {name}
            </TabsRadio>
          ))}
        </TabsRadioGroup>
        <div className='flex flex-col gap-group p-group'>
          <Command
            label='Add the registry, once per project'
            command={`${runner} registry add @triargos=${origin}/r/{name}.json`}
          />
          <Command label={`Add ${title}`} command={`${runner} add @triargos/${name}`} />
        </div>
      </div>
    </Section>
  );
}
