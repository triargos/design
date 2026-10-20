import { ChevronRightIcon } from 'lucide-react';
import { useId, useState, useSyncExternalStore } from 'react';

import { Button } from '~/components/ui/button';
import { CardFooter } from '~/components/ui/card';
import { CopyButton } from '~/components/ui/copy-button';
import { TabsRadio, TabsRadioGroup } from '~/components/ui/tabs';

import { cn } from '~/lib/utils';

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

/** A shell command after a `$` prompt; wraps at spaces, and a long URL breaks anywhere, so nothing scrolls sideways. */
function Command({ command, label, className }: { command: string; label: string; className?: string }) {
  return (
    <pre
      aria-label={label}
      className={cn(
        // Hanging indent: wrapped lines start under the command, not under the prompt.
        'min-w-0 flex-1 pl-[2ch] -indent-[2ch] font-mono text-caption whitespace-pre-wrap [overflow-wrap:anywhere]',
        className,
      )}>
      <span aria-hidden className='text-muted-foreground select-none'>
        ${' '}
      </span>
      <code>{command}</code>
    </pre>
  );
}

/**
 * The `shadcn` command that adds the item `name`, framed like an example: the package manager tabs and the command on
 * the stage, the one-time registry setup folded into the strip below.
 */
export function Install({ name, title }: { name: string; title: string }) {
  const packageManager = usePackageManager();
  const runner = RUNNERS[packageManager];
  const origin = useOrigin();
  const [setupOpen, setSetupOpen] = useState(false);
  const setupId = useId();
  const add = `${runner} add @triargos/${name}`;
  const setup = `${runner} registry add @triargos=${origin}/r/{name}.json`;
  return (
    <Section title='Installation'>
      {/* The setup card sits 4px inside the 1px border: `rounded-inner` keeps its corners concentric. */}
      <div className='min-w-0 overflow-hidden rounded-card border border-border [--outer-inset:calc(--spacing(1)+1px)] [--outer-radius:var(--radius-card)]'>
        <div className='bg-background'>
          <TabsRadioGroup
            variant='underline'
            value={packageManager}
            onValueChange={setPackageManager}
            aria-label='Package manager'
            className='border-border-subtle px-group'>
            {PACKAGE_MANAGERS.map((name) => (
              <TabsRadio key={name} value={name}>
                {name}
              </TabsRadio>
            ))}
          </TabsRadioGroup>
          <div className='flex items-center gap-related py-related pr-related pl-group'>
            <Command command={add} label={`Add ${title}`} />
            <CopyButton value={add} label='Copy command' size='icon' />
          </div>
        </div>
        <div className='border-t border-border bg-shell px-1 pb-1'>
          <div className='px-1 pt-1'>
            <Button
              emphasis='ghost'
              size='xs'
              aria-expanded={setupOpen}
              aria-controls={setupId}
              onClick={() => setSetupOpen((open) => !open)}
              className='text-muted-foreground'>
              <ChevronRightIcon
                data-icon='inline-start'
                aria-hidden
                className={cn('transition-transform duration-150', setupOpen && 'rotate-90')}
              />
              First time? Add the registry
            </Button>
          </div>
          <CardFooter show={setupOpen} className='px-0 pt-1'>
            <div
              id={setupId}
              className='flex flex-col gap-related rounded-inner border border-(--edge) bg-card py-related pr-related pl-group'>
              <p className='text-caption text-muted-foreground'>
                Once per project: puts <span className='font-mono'>@triargos</span> in components.json.
              </p>
              <div className='flex items-start gap-related'>
                <Command command={setup} label='Add the registry' className='py-1' />
                <CopyButton value={setup} label='Copy registry command' size='icon-xs' />
              </div>
            </div>
          </CardFooter>
        </div>
      </div>
    </Section>
  );
}
