import { FileDrop as FileDropPrimitive } from '@foldkit/ui';
import { cva } from 'class-variance-authority';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';
import type { Child } from './part.ts';

export const { Model, Message, OutMessage, init, update } = FileDropPrimitive;
export type Model = FileDropPrimitive.Model;
export type Message = FileDropPrimitive.Message;
export type OutMessage = FileDropPrimitive.OutMessage;

const fieldSurfaceWithin = [
  'hit-area relative rounded-(--field-radius) border border-(--edge-field) bg-surface bg-clip-padding shadow-field [--field-radius:var(--radius-control)] [--outer-radius:var(--field-radius)] dark:bg-[color-mix(in_oklab,var(--edge-field)_32%,transparent)]',
  'before:pointer-events-none before:absolute before:inset-0 before:rounded-[max(0px,calc(var(--field-radius)-1px))] before:shadow-field-edge',
  'transition-[background-color,border-color,box-shadow] duration-feedback outline-none',
  'focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/24 focus-within:shadow-none',
  'has-aria-invalid:[--edge-field:color-mix(in_oklch,var(--destructive)_40%,transparent)]',
  'focus-within:has-aria-invalid:border-destructive/64 focus-within:has-aria-invalid:ring-destructive/16 dark:focus-within:has-aria-invalid:ring-destructive/24',
  'aria-invalid:[--edge-field:color-mix(in_oklch,var(--destructive)_40%,transparent)]',
  'focus-within:aria-invalid:border-destructive/64 focus-within:aria-invalid:ring-destructive/16 dark:focus-within:aria-invalid:ring-destructive/24',
  'has-[[readonly],[data-readonly]]:text-muted-foreground has-[[readonly],[data-readonly]]:shadow-field-flat',
  'has-[[readonly],[data-readonly]]:focus-within:border-(--edge-field) has-[[readonly],[data-readonly]]:focus-within:shadow-field-flat has-[[readonly],[data-readonly]]:focus-within:ring-0',
  'has-disabled:opacity-64 has-disabled:shadow-field-flat has-disabled:before:shadow-none',
];

export type FileDropZoneSize = 'default' | 'sm';

const fileDropZoneVariants = cva(
  [
    fieldSurfaceWithin,
    'flex cursor-pointer items-center has-disabled:cursor-not-allowed',
    'data-drag-over:border-ring data-drag-over:bg-background data-drag-over:ring-3 data-drag-over:ring-ring/24',
  ],
  {
    variants: {
      size: {
        default:
          'flex-col justify-center gap-part px-(--file-drop-zone-pad-x) py-(--file-drop-zone-pad-y) text-center [--field-radius:var(--radius-area)]',
        sm: 'min-h-control-lg justify-center gap-related border-dashed border-border bg-transparent px-(--file-drop-zone-sm-pad-x) py-(--file-drop-zone-sm-pad-y) text-body font-medium text-primary shadow-none hover:bg-field has-disabled:border-transparent has-disabled:hover:bg-disabled has-aria-invalid:border-destructive-border',
      },
    },
    defaultVariants: { size: 'default' },
  },
);

export type ViewConfig<ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => ParentMessage;
  ariaLabel: string;
  size?: FileDropZoneSize | undefined;
  accept?: ReadonlyArray<string> | undefined;
  isMultiple?: boolean | undefined;
  isDisabled?: boolean | undefined;
  isInvalid?: boolean | undefined;
  className?: string | undefined;
  children: ReadonlyArray<Child>;
}>;

export const view = <ParentMessage>(config: ViewConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const {
    model,
    toParentMessage,
    ariaLabel,
    size = 'default',
    accept,
    isMultiple = true,
    isDisabled = false,
    isInvalid = false,
    className,
    children,
  } = config;

  const toView = ({ root, input }: FileDropPrimitive.FileDropAttributes): Html =>
    h.label(
      [
        ...root,
        h.DataAttribute('slot', 'file-drop-zone'),
        h.DataAttribute('size', size),
        h.Class(cn(fileDropZoneVariants({ size }), className)),
      ],
      [h.input([...input, h.AriaLabel(ariaLabel), ...(isInvalid ? [h.AriaInvalid(true)] : [])]), ...children],
    );

  return h.submodel({
    slotId: model.id,
    model,
    view: FileDropPrimitive.view,
    viewInputs: {
      toView,
      multiple: isMultiple,
      isDisabled,
      ...(accept === undefined ? {} : { accept }),
    },
    toParentMessage,
  });
};
