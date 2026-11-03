import { Button as ButtonPrimitive } from '@foldkit/ui';
import { cva } from 'class-variance-authority';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import type { Child, PartAttribute } from './part.ts';
import { type Emphasis, type Intent, intentVariants } from './intent.ts';
import * as Spinner from './spinner.ts';

const buttonShape = cva(
  [
    'hit-area relative inline-flex shrink-0 cursor-default items-center justify-center border border-transparent bg-clip-border text-control font-medium whitespace-nowrap outline-none select-none',
    'transition-[background-color,border-color,color,box-shadow,opacity,transform,scale,--tw-gradient-from]',
    'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/24',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-icon",
    'data-disabled:pointer-events-none data-disabled:text-disabled-foreground',
  ],
  {
    variants: {
      emphasis: {
        solid: [
          'border-[color-mix(in_oklch,var(--intent-solid),black_10%)] bg-clip-padding bg-linear-to-b from-[color-mix(in_oklch,var(--intent-solid),white_15%)] to-(--intent-solid) shadow-[inset_0_1px_0_0_color-mix(in_oklch,var(--intent-solid),white_30%)] hover:from-[color-mix(in_oklch,var(--intent-solid),white_30%)]',
          'data-disabled:border-transparent data-disabled:bg-disabled data-disabled:bg-clip-border data-disabled:bg-none data-disabled:shadow-none',
        ],
        subtle: 'data-disabled:bg-disabled',
        outline: 'border-(--intent-border) inset-ring-0 data-disabled:border-border',
        ghost: '',
        raised: [
          'border-(--edge) bg-clip-border shadow-raised-drop',
          'hover:border-(--edge-hover) hover:shadow-raised-drop-hover aria-expanded:border-(--edge-hover) aria-expanded:shadow-raised-drop-hover',
          'data-disabled:border-border data-disabled:bg-transparent data-disabled:shadow-none',
        ],
      },
      size: {
        default:
          'h-control gap-control-gap rounded-control px-control-pad has-data-[icon=inline-end]:pr-[calc(var(--spacing-control-pad)-2px)] has-data-[icon=inline-start]:pl-[calc(var(--spacing-control-pad)-2px)]',
        xs: "h-control-xs gap-control-gap-sm rounded-control-sm px-control-pad-xs text-caption has-data-[icon=inline-end]:pr-[calc(var(--spacing-control-pad-xs)-2px)] has-data-[icon=inline-start]:pl-[calc(var(--spacing-control-pad-xs)-2px)] [&_svg:not([class*='size-'])]:size-icon-xs",
        sm: "h-control-sm gap-control-gap-sm rounded-control px-control-pad-sm text-caption has-data-[icon=inline-end]:pr-[calc(var(--spacing-control-pad-sm)-2px)] has-data-[icon=inline-start]:pl-[calc(var(--spacing-control-pad-sm)-2px)] [&_svg:not([class*='size-'])]:size-icon-sm",
        lg: 'h-control-lg gap-control-gap rounded-control-lg px-control-pad has-data-[icon=inline-end]:pr-[calc(var(--spacing-control-pad)-2px)] has-data-[icon=inline-start]:pl-[calc(var(--spacing-control-pad)-2px)]',
        'icon-sm': 'size-control-sm rounded-control',
        icon: 'size-control rounded-control',
        'icon-lg': 'size-control-lg rounded-control-lg',
      },
      isStatic: {
        false: 'active:not-aria-[haspopup]:scale-[0.96] motion-reduce:active:not-aria-[haspopup]:scale-100',
        true: '',
      },
    },
    defaultVariants: { size: 'default', isStatic: false },
  },
);

export type ButtonSize = 'default' | 'xs' | 'sm' | 'lg' | 'icon-sm' | 'icon' | 'icon-lg';

const SPINNER_SIZE: Record<ButtonSize, string> = {
  xs: 'size-icon-xs',
  sm: 'size-icon',
  'icon-sm': 'size-icon',
  default: 'size-icon',
  icon: 'size-icon',
  lg: 'size-icon-lg',
  'icon-lg': 'size-icon-lg',
};

export type ButtonStyle = Readonly<{
  intent?: Intent | undefined;
  emphasis?: Emphasis | undefined;
  size?: ButtonSize | undefined;
  isStatic?: boolean | undefined;
  className?: string | undefined;
}>;

export const buttonVariants = ({
  intent = 'neutral',
  emphasis,
  size,
  isStatic,
  className,
}: ButtonStyle = {}): string => {
  const resolvedEmphasis = emphasis ?? (intent === 'neutral' ? 'raised' : 'solid');
  return cn(
    intentVariants({ intent, emphasis: resolvedEmphasis, interactive: true }),
    buttonShape({ emphasis: resolvedEmphasis, size, isStatic }),
    intent === 'neutral' &&
      resolvedEmphasis === 'ghost' &&
      'text-current hover:text-foreground aria-expanded:text-foreground aria-pressed:text-foreground',
    className,
  );
};

export type ViewConfig<Message> = ButtonStyle &
  Readonly<{
    onClick?: Message;
    isDisabled?: boolean;
    isPending?: boolean;
    type?: 'button' | 'submit' | 'reset';
    href?: string;
    ariaLabel?: string;
    attributes?: ReadonlyArray<PartAttribute<Message>>;
    children: ReadonlyArray<Child>;
  }>;

const pendingSwap = <Message>(
  isPending: boolean,
  size: ButtonSize,
  children: ReadonlyArray<Child>,
  h: HtmlBuilder<Message>,
): ReadonlyArray<Child> => [
  h.span(
    [h.Class('inline-flex gap-[inherit] self-stretch overflow-y-clip')],
    [
      h.span(
        [
          h.DataAttribute('slot', 'button-label'),
          h.Class(
            cn(
              'inline-flex items-center justify-center gap-[inherit] transition-[translate,opacity] duration-move ease-enter',
              isPending && '-translate-y-full opacity-0 motion-reduce:translate-y-0',
            ),
          ),
        ],
        children,
      ),
    ],
  ),
  h.span(
    [h.Class('pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]')],
    [
      h.span(
        [
          h.Class(
            cn(
              'absolute inset-0 flex items-center justify-center transition-[translate,opacity,visibility] duration-move ease-enter',
              !isPending && 'invisible translate-y-full opacity-0 motion-reduce:translate-y-0',
            ),
          ),
        ],
        [Spinner.view({ className: SPINNER_SIZE[size] })],
      ),
    ],
  ),
];

export const view = <Message>(config: ViewConfig<Message>, h: HtmlBuilder<Message>): Html => {
  const {
    intent,
    emphasis,
    size = 'default',
    isStatic,
    className,
    onClick,
    isDisabled = false,
    isPending,
    type,
    href,
    ariaLabel,
    attributes = [],
    children,
  } = config;

  const isBusy = isPending === true;
  const content = isPending === undefined ? children : pendingSwap(isBusy, size, children, h);
  const sharedAttributes = [
    h.DataAttribute('slot', 'button'),
    h.DataAttribute('size', size),
    h.Class(buttonVariants({ intent, emphasis, size, isStatic, className })),
    ...(ariaLabel === undefined ? [] : [h.AriaLabel(ariaLabel)]),
    ...(isBusy ? [h.AriaBusy(true), h.AriaDisabled(true)] : []),
    ...attributes,
  ];

  if (href !== undefined) {
    return h.a([h.Href(href), ...sharedAttributes], content);
  }

  return ButtonPrimitive.view(
    {
      isDisabled,
      ...(onClick === undefined || isBusy ? {} : { onClick }),
      ...(type === undefined ? {} : { type }),
      toView: (primitive) => h.button([...primitive.button, ...sharedAttributes], content),
    },
    h,
  );
};
