import { RadioGroup as RadioGroupPrimitive } from '@foldkit/ui';
import type { Option } from 'effect';
import type { ChildAttribute, Html, HtmlBuilder } from 'foldkit/html';

import { selectionControlVariants } from './checkbox.ts';
import { cn } from './cn.ts';
import { icon } from './icon.ts';
import type { Child, PartAttribute } from './part.ts';

export const { Model, Message, OutMessage, init } = RadioGroupPrimitive;
export type Model = RadioGroupPrimitive.Model;
export type Message = RadioGroupPrimitive.Message;
export type OutMessage = RadioGroupPrimitive.OutMessage;

const Bundle = RadioGroupPrimitive.create<string>();
export const { update } = Bundle;

export type OptionRender<ParentMessage> = Readonly<{
  value: string;
  index: number;
  isSelected: boolean;
  isDisabled: boolean;
  radio: Html;
  option: ReadonlyArray<ChildAttribute>;
  label: ReadonlyArray<PartAttribute<ParentMessage>>;
  inlineLabel: ReadonlyArray<ChildAttribute>;
  description: ReadonlyArray<ChildAttribute>;
}>;

export type ViewConfig<ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => ParentMessage;
  options: ReadonlyArray<string>;
  selectedValue: Option.Option<string>;
  ariaLabel: string;
  optionView: (render: OptionRender<ParentMessage>) => Html;
  slotId?: string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isInvalid?: boolean;
  hasOptionDescription?: boolean;
  name?: string;
  className?: string;
}>;

const radioItem = <ParentMessage>(
  option: ReadonlyArray<ChildAttribute>,
  isInvalid: boolean,
  h: HtmlBuilder<ParentMessage>,
): Html =>
  h.button(
    [
      ...option,
      h.DataAttribute('slot', 'radio-group-item'),
      ...(isInvalid ? [h.AriaInvalid(true)] : []),
      h.Class(selectionControlVariants({ shape: 'round' })),
    ],
    [
      h.span(
        [
          h.DataAttribute('slot', 'radio-group-indicator'),
          h.Class(
            cn(
              'flex size-(--checkbox-size) items-center justify-center',
              'transition-[scale,opacity] duration-feedback ease-enter motion-reduce:transition-opacity',
              'scale-0 opacity-0 in-data-checked:scale-100 in-data-checked:opacity-100 motion-reduce:scale-100',
            ),
          ),
        ],
        [h.span([h.Class('size-(--radio-dot-size) rounded-full bg-current')])],
      ),
    ],
  );

export const view = <ParentMessage>(config: ViewConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const {
    model,
    toParentMessage,
    options,
    selectedValue,
    ariaLabel,
    optionView,
    slotId = model.id,
    isDisabled = false,
    isReadOnly = false,
    isInvalid = false,
    hasOptionDescription = false,
    name,
    className,
  } = config;

  const toView = (render: RadioGroupPrimitive.RenderInfo): Html =>
    h.div(
      [
        ...render.group,
        h.DataAttribute('slot', 'radio-group'),
        ...(isDisabled ? [h.DataAttribute('disabled', '')] : []),
        h.Class(cn('grid w-full gap-related', className)),
      ],
      [
        ...render.options.map((option) =>
          optionView({
            value: option.value,
            index: option.index,
            isSelected: option.isSelected,
            isDisabled: option.isDisabled,
            radio: radioItem(option.option, isInvalid, h),
            option: option.option,
            label:
              option.isDisabled || option.isReadOnly
                ? option.label
                : [
                    ...option.label,
                    h.OnClick(toParentMessage(Message.SelectedOption({ index: option.index, value: option.value }))),
                  ],
            inlineLabel: option.label,
            description: option.description,
          }),
        ),
        ...(name === undefined ? [] : [h.input(render.hiddenInput)]),
      ],
    );

  return h.submodel({
    slotId,
    model,
    view: Bundle.view,
    viewInputs: {
      options,
      selectedValue,
      ariaLabel,
      toView,
      isDisabled,
      isReadOnly,
      hasOptionDescription: () => hasOptionDescription,
      ...(name === undefined ? {} : { name }),
    },
    toParentMessage,
  });
};

export type ChoiceCardConfig<ParentMessage> = Readonly<{
  option: OptionRender<ParentMessage>;
  isInvalid?: boolean;
  className?: string;
  attributes?: ReadonlyArray<PartAttribute<ParentMessage>>;
  children: ReadonlyArray<Child>;
}>;

export const choiceCard = <ParentMessage>(
  { option, isInvalid = false, className, attributes = [], children }: ChoiceCardConfig<ParentMessage>,
  h: HtmlBuilder<ParentMessage>,
): Html =>
  h.button(
    [
      ...option.option,
      h.DataAttribute('slot', 'choice-card'),
      ...(isInvalid ? [h.AriaInvalid(true)] : []),
      h.Class(
        cn(
          'group/choice-card flex min-h-(--choice-card-height) w-full items-center justify-between gap-part rounded-block bg-shell px-control-pad py-(--choice-card-pad-y) text-left text-body font-medium text-foreground outline-none',
          'transition-[background-color,box-shadow] duration-feedback hover:bg-muted',
          'focus-visible:ring-3 focus-visible:ring-ring/24',
          'data-checked:bg-card data-checked:shadow-raised',
          'aria-invalid:inset-ring aria-invalid:inset-ring-destructive-border',
          'data-disabled:cursor-not-allowed data-disabled:bg-disabled data-disabled:text-disabled-foreground data-disabled:shadow-none',
          className,
        ),
      ),
      ...attributes,
    ],
    [
      h.span([...option.inlineLabel, h.Class('min-w-0 truncate')], children),
      icon('check', {
        className:
          'size-icon shrink-0 text-primary opacity-0 transition-opacity duration-feedback group-data-checked/choice-card:opacity-100 group-data-disabled/choice-card:text-disabled-foreground',
      }),
    ],
  );
