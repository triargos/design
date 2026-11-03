import { Tabs as TabsPrimitive } from '@foldkit/ui';
import { Array, Option, pipe } from 'effect';
import { cva } from 'class-variance-authority';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import type { Child } from './part.ts';

export const { Model, Message, OutMessage, init } = TabsPrimitive;
export type Model = TabsPrimitive.Model;
export type Message = TabsPrimitive.Message;
export type OutMessage = TabsPrimitive.OutMessage;

const Bundle = TabsPrimitive.create<string>();
export const { update } = Bundle;

export type TabsVariant = 'segmented' | 'underline' | 'pill' | 'inline';

const DEFAULT_NAV_LABEL = 'Page tabs';

const segmentedTrack =
  'flex-wrap rounded-[calc(var(--tabs-radius)+min(var(--tabs-inset),var(--tabs-radius)))] p-(--tabs-inset)';

const tabsListVariants = cva('relative isolate flex w-fit max-w-full items-center [anchor-scope:--tabs-active-tab]', {
  variants: {
    variant: {
      segmented: cn(segmentedTrack, 'bg-shell'),
      underline: 'gap-group border-b border-border',
      pill: 'flex-wrap gap-control-gap',
      inline: cn(segmentedTrack, 'bg-foreground/6 [--tabs-inset:2px] [--tabs-radius:var(--radius-track)]'),
    },
  },
});

const segmentedTab =
  'rounded-(--tabs-radius) px-control-pad-sm has-[>svg:only-child]:px-control-pad-xs aria-[current=page]:text-foreground data-selected:text-foreground aria-checked:text-foreground';

const tabsTriggerVariants = cva(
  [
    'hit-area relative inline-flex h-control-sm shrink-0 items-center justify-center gap-control-gap text-control font-medium whitespace-nowrap text-muted-foreground select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*="size-"])]:size-icon',
    'transition-[color,background-color,scale] duration-feedback outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/24',
    'disabled:pointer-events-none disabled:text-disabled-foreground data-disabled:pointer-events-none data-disabled:text-disabled-foreground',
  ],
  {
    variants: {
      variant: {
        segmented: segmentedTab,
        inline: segmentedTab,
        underline: 'h-control rounded-control-xs px-0.5 data-selected:text-foreground',
        pill: 'rounded-full bg-neutral-subtle px-[calc(var(--spacing-control-pad-sm)+2px)] font-normal hover:bg-foreground/8 active:scale-[0.96] motion-reduce:active:scale-100 aria-checked:bg-transparent aria-checked:text-primary-solid-foreground aria-checked:hover:bg-transparent aria-checked:hover:text-primary-solid-foreground data-selected:bg-transparent data-selected:text-primary-solid-foreground data-selected:hover:bg-transparent',
      },
    },
  },
);

const indicatorVariants = cva(
  'pointer-events-none absolute -z-10 [position-anchor:--tabs-active-tab] top-[anchor(top)] left-[anchor(left)] h-[anchor-size(height)] w-[anchor-size(width)] transition-[top,left,width,height] duration-move ease-move motion-reduce:transition-none',
  {
    variants: {
      variant: {
        segmented: 'rounded-(--tabs-radius) bg-card shadow-raised dark:bg-foreground/10',
        inline: 'rounded-(--tabs-radius) bg-card shadow-raised dark:bg-foreground/10',
        underline: 'after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-foreground',
        pill: 'rounded-full bg-primary-solid',
      },
    },
  },
);

const ACTIVE_TAB_ANCHOR = '[anchor-name:--tabs-active-tab]';

const indicator = <Message>(variant: TabsVariant, h: HtmlBuilder<Message>): Html =>
  h.span([h.AriaHidden(true), h.DataAttribute('slot', 'tabs-indicator'), h.Class(indicatorVariants({ variant }))]);

const triggerClassName = (variant: TabsVariant, isActive: boolean, className?: string): string =>
  cn(tabsTriggerVariants({ variant }), isActive && ACTIVE_TAB_ANCHOR, className);

export type Tab = Readonly<{
  value: string;
  children: ReadonlyArray<Child>;
  isDisabled?: boolean | undefined;
  className?: string | undefined;
}>;

export type ViewConfig<ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => ParentMessage;
  tabs: ReadonlyArray<Tab>;
  selectedValue: string;
  ariaLabel: string;
  variant?: TabsVariant | undefined;
  panel?: ((value: string) => ReadonlyArray<Child>) | undefined;
  panelClassName?: string | undefined;
  listClassName?: string | undefined;
  className?: string | undefined;
}>;

export const view = <ParentMessage>(config: ViewConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const {
    model,
    toParentMessage,
    tabs,
    selectedValue,
    ariaLabel,
    variant = 'segmented',
    panel,
    panelClassName,
    listClassName,
    className,
  } = config;

  const isTabDisabled = (value: string): boolean =>
    pipe(
      tabs,
      Array.findFirst((tab) => tab.value === value),
      Option.exists((tab) => tab.isDisabled === true),
    );

  const toView = (render: TabsPrimitive.RenderInfo<string>): Html =>
    h.div(
      [h.DataAttribute('slot', 'tabs'), h.Class(cn('group/tabs', className))],
      [
        h.div(
          [
            ...render.tablist,
            h.DataAttribute('slot', 'tabs-list'),
            h.DataAttribute('variant', variant),
            h.Class(cn(tabsListVariants({ variant }), listClassName)),
          ],
          [
            indicator(variant, h),
            ...Array.zipWith(render.tabs, tabs, (info, tab) =>
              h.button(
                [
                  ...info.tab,
                  h.DataAttribute('slot', 'tabs-trigger'),
                  h.Class(triggerClassName(variant, info.isActive, tab.className)),
                ],
                tab.children,
              ),
            ),
          ],
        ),
        ...(panel === undefined
          ? []
          : pipe(
              render.tabs,
              Array.get(render.activeIndex),
              Option.map((info) =>
                h.div(
                  [
                    ...info.panel,
                    h.DataAttribute('slot', 'tabs-content'),
                    h.Class(
                      cn(
                        'mt-group rounded-control-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/24',
                        panelClassName,
                      ),
                    ),
                  ],
                  panel(info.value),
                ),
              ),
              Option.toArray,
            )),
      ],
    );

  return h.submodel({
    slotId: model.id,
    model,
    view: Bundle.view,
    viewInputs: {
      tabs: Array.map(tabs, ({ value }) => value),
      selectedValue,
      ariaLabel,
      isTabDisabled,
      toView,
    },
    toParentMessage,
  });
};

export type Link = Readonly<{
  href: string;
  isCurrent?: boolean | undefined;
  className?: string | undefined;
  children: ReadonlyArray<Child>;
}>;

export type NavConfig = Readonly<{
  links: ReadonlyArray<Link>;
  variant?: TabsVariant | undefined;
  ariaLabel?: string | undefined;
  className?: string | undefined;
}>;

export const nav = <Message>(config: NavConfig, h: HtmlBuilder<Message>): Html => {
  const { links, variant = 'segmented', ariaLabel = DEFAULT_NAV_LABEL, className } = config;
  const hasCurrent = Array.some(links, (link) => link.isCurrent === true);

  return h.nav(
    [
      h.DataAttribute('slot', 'tabs-list'),
      h.DataAttribute('variant', variant),
      h.AriaLabel(ariaLabel),
      h.Class(cn(tabsListVariants({ variant }), className)),
    ],
    [
      ...(hasCurrent ? [indicator(variant, h)] : []),
      ...Array.map(links, ({ href, isCurrent = false, className: linkClassName, children }) =>
        h.a(
          [
            h.Href(href),
            h.DataAttribute('slot', 'tabs-trigger'),
            ...(isCurrent ? [h.AriaCurrent('page')] : []),
            h.Class(triggerClassName(variant, isCurrent, linkClassName)),
          ],
          children,
        ),
      ),
    ],
  );
};

export type Radio = Readonly<{
  value: string;
  ariaLabel?: string | undefined;
  isInvalid?: boolean | undefined;
  className?: string | undefined;
  children: ReadonlyArray<Child>;
}>;

export type RadioGroupConfig<Message> = Readonly<{
  radios: ReadonlyArray<Radio>;
  value: string;
  onValueChange: (value: string) => Message;
  variant?: TabsVariant | undefined;
  ariaLabel?: string | undefined;
  ariaLabelledBy?: string | undefined;
  className?: string | undefined;
}>;

export const radioGroup = <Message>(config: RadioGroupConfig<Message>, h: HtmlBuilder<Message>): Html => {
  const { radios, value, onValueChange, variant = 'pill', ariaLabel, ariaLabelledBy, className } = config;
  const hasChecked = Array.some(radios, (radio) => radio.value === value);

  return h.div(
    [
      h.Role('radiogroup'),
      h.DataAttribute('slot', 'tabs-list'),
      h.DataAttribute('variant', variant),
      ...(ariaLabel === undefined ? [] : [h.AriaLabel(ariaLabel)]),
      ...(ariaLabelledBy === undefined ? [] : [h.AriaLabelledBy(ariaLabelledBy)]),
      h.Class(cn(tabsListVariants({ variant }), 'w-auto', className)),
    ],
    [
      ...(hasChecked ? [indicator(variant, h)] : []),
      ...Array.map(radios, (radio) => {
        const isChecked = radio.value === value;
        return h.button(
          [
            h.Type('button'),
            h.Role('radio'),
            h.AriaChecked(isChecked),
            h.Tabindex(0),
            h.DataAttribute('slot', 'tabs-trigger'),
            h.DataAttribute('state', isChecked ? 'checked' : 'unchecked'),
            ...(radio.ariaLabel === undefined ? [] : [h.AriaLabel(radio.ariaLabel)]),
            ...(radio.isInvalid === true ? [h.AriaInvalid(true)] : []),
            ...(isChecked ? [] : [h.OnClick(onValueChange(radio.value))]),
            h.Class(
              cn(
                triggerClassName(variant, isChecked),
                'aria-invalid:ring-3 aria-invalid:ring-destructive/20',
                radio.className,
              ),
            ),
          ],
          radio.children,
        );
      }),
    ],
  );
};
