import { IconArrowRight } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import pages from 'virtual:docs-index';

import { Item, ItemContent, ItemMedia, ItemTitle } from '~/components/ui/item';

import { cn } from '~/lib/utils';

import { AvatarGroupExample } from '../docs/examples/avatar/group';
import { BadgeStatus } from '../docs/examples/badge/status';
import { ButtonVariants } from '../docs/examples/button/intent-and-emphasis';
import { CalendarDefault } from '../docs/examples/calendar/default';
import { ComboboxAllowCustom } from '../docs/examples/combobox/allow-custom';
import { SelectAllowCustom } from '../docs/examples/select/allow-custom';
import { InputOTPFourDigits } from '../docs/examples/input-otp/four-digits';
import { SliderWithLabelAndValue } from '../docs/examples/slider/with-label-and-value';
import { SwitchWithLabel } from '../docs/examples/switch/with-label';
import { TabsDefault } from '../docs/examples/tabs/default';
import { ProschuleLogo } from './logo';
import { pathOf, prefetchPage } from './page';
import { Link } from './router';

const pageBySlug = (slug: string) => {
  const page = pages.find((entry) => entry.slug === slug);
  if (page === undefined) throw new Error(`No docs page ${slug}`);
  return page;
};

/** A live example in a card, with a link to its page on the shell below. */
function Tile({ slug, className, children }: { slug: string; className?: string; children: ReactNode }) {
  const page = pageBySlug(slug);
  return (
    <div className={cn('flex min-w-0 flex-col overflow-hidden rounded-card border border-border', className)}>
      <div className='flex min-h-40 flex-1 items-center justify-center bg-background p-group'>{children}</div>
      <Item
        render={<Link href={pathOf(page)} prefetch={prefetchPage(page)} />}
        className='rounded-none border-0 border-t border-border bg-shell py-1.5'>
        <ItemContent>
          <ItemTitle className='text-caption font-normal text-muted-foreground'>{page.name}</ItemTitle>
        </ItemContent>
        <ItemMedia>
          <IconArrowRight aria-hidden className='size-3.5 text-muted-foreground rtl:-scale-x-100' />
        </ItemMedia>
      </Item>
    </div>
  );
}

/** The home page: the components, live. */
export function Home() {
  return (
    <div className='mx-auto flex w-full max-w-5xl flex-col gap-section'>
      <header className='flex flex-col gap-group'>
        <ProschuleLogo className='h-10 self-start' />
        <div className='flex flex-col gap-tight'>
          <h1 className='text-title text-balance'>Pavo</h1>
          <p className='max-w-prose text-body text-pretty text-muted-foreground'>
            The design system behind ProSchule products: every component live, with its code.
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
        <Tile slug='select' className='md:col-span-3'>
          <SelectAllowCustom />
        </Tile>
        <Tile slug='combobox' className='md:col-span-3'>
          <ComboboxAllowCustom />
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
    </div>
  );
}
