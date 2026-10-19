import { ArrowRightIcon } from 'lucide-react';
import { useSyncExternalStore, type ReactNode } from 'react';
import pages from 'virtual:docs-index';

import { CopyButton } from '~/components/ui/copy-button';
import { InsetCard, InsetCardContent, InsetCardHeader, InsetCardTitle } from '~/components/ui/inset-card';
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '~/components/ui/item';
import { Separator } from '~/components/ui/separator';

import { cn } from '~/lib/utils';

import { AvatarGroupExample } from '../storybook/examples/avatar/group';
import { BadgeStatus } from '../storybook/examples/badge/status';
import { ButtonVariants } from '../storybook/examples/button/variants';
import { CalendarDefault } from '../storybook/examples/calendar/default';
import { InputOTPFourDigits } from '../storybook/examples/input-otp/four-digits';
import { SliderWithLabelAndValue } from '../storybook/examples/slider/with-label-and-value';
import { SwitchWithLabel } from '../storybook/examples/switch/with-label';
import { TabsDefault } from '../storybook/examples/tabs/default';
import { TriargosLogo } from './logo';
import { pathOf, prefetchPage } from './page';
import { Link } from './router';

/** Prerendered with the production host; the browser swaps in its own after hydration. */
const useOrigin = () =>
  useSyncExternalStore(
    () => () => undefined,
    () => window.location.origin,
    () => 'https://design.triargos.de',
  );

const pageBySlug = (slug: string) => {
  const page = pages.find((entry) => entry.slug === slug);
  if (page === undefined) throw new Error(`No docs page ${slug}`);
  return page;
};

/** A live example in a card, with a link to its page on the shell below. */
function Tile({ slug, className, children }: { slug: string; className?: string; children: ReactNode }) {
  const page = pageBySlug(slug);
  return (
    <InsetCard className={cn('flex min-w-0 flex-col', className)}>
      <InsetCardContent lang='de' className='flex min-h-40 flex-1 items-center justify-center p-group'>
        {children}
      </InsetCardContent>
      <Item render={<Link href={pathOf(page)} prefetch={prefetchPage(page)} />} className='mt-1 py-1.5'>
        <ItemContent>
          <ItemTitle className='text-caption font-normal text-muted-foreground'>{page.name}</ItemTitle>
        </ItemContent>
        <ItemMedia>
          <ArrowRightIcon aria-hidden className='size-3.5 text-muted-foreground rtl:-scale-x-100' />
        </ItemMedia>
      </Item>
    </InsetCard>
  );
}

function InstallCommand({ label, copyLabel, command }: { label: string; copyLabel: string; command: string }) {
  return (
    <Item>
      <ItemContent className='min-w-0 gap-0.5'>
        <ItemDescription className='text-caption'>{label}</ItemDescription>
        <code className='font-mono text-caption break-all text-foreground'>{command}</code>
      </ItemContent>
      <ItemActions>
        <CopyButton value={command} label={copyLabel} />
      </ItemActions>
    </Item>
  );
}

/** The home page: what this is, a few components live, and how to install them. */
export function Home() {
  const origin = useOrigin();
  return (
    <div className='mx-auto flex w-full max-w-5xl flex-col gap-section'>
      <header className='flex flex-col gap-group'>
        <TriargosLogo className='h-10 self-start' />
        <div className='flex flex-col gap-tight'>
          <h1 className='text-title text-balance'>Triargos Design</h1>
          <p className='max-w-prose text-body text-pretty text-muted-foreground'>
            Components, foundations and patterns for Triargos products. Every page shows the components live, with the
            code that renders them.
          </p>
        </div>
      </header>

      <section aria-label='Components' className='grid gap-related md:grid-cols-6'>
        <Tile slug='button' className='md:col-span-4'>
          <ButtonVariants />
        </Tile>
        <Tile slug='avatar' className='md:col-span-2'>
          <AvatarGroupExample />
        </Tile>
        <Tile slug='calendar' className='md:col-span-2 md:row-span-2'>
          <CalendarDefault />
        </Tile>
        <Tile slug='tabs' className='md:col-span-4'>
          <TabsDefault />
        </Tile>
        <Tile slug='badge' className='md:col-span-4'>
          <BadgeStatus />
        </Tile>
        <Tile slug='switch' className='md:col-span-2'>
          <SwitchWithLabel />
        </Tile>
        <Tile slug='slider' className='md:col-span-2'>
          <div className='w-full'>
            <SliderWithLabelAndValue />
          </div>
        </Tile>
        <Tile slug='input-otp' className='md:col-span-2'>
          <InputOTPFourDigits />
        </Tile>
      </section>

      <InsetCard aria-labelledby='install'>
        <InsetCardHeader>
          <InsetCardTitle id='install'>Install from the registry</InsetCardTitle>
        </InsetCardHeader>
        <InsetCardContent className='flex flex-col p-1'>
          <InstallCommand
            label='Add the registry to a project, once'
            copyLabel='Copy registry command'
            command={`pnpm dlx shadcn@latest registry add @triargos=${origin}/r/{name}.json`}
          />
          <Separator className='mx-3 w-auto bg-border-subtle' />
          <InstallCommand
            label='Add a component by name'
            copyLabel='Copy add command'
            command='pnpm dlx shadcn@latest add @triargos/button'
          />
        </InsetCardContent>
      </InsetCard>
    </div>
  );
}
