import { Slider as SliderPrimitive } from '@foldkit/ui';
import { String } from 'effect';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { cn } from './cn.ts';

export const { Model, Message, OutMessage, init, update, subscriptions, snapAndClamp } = SliderPrimitive;
export type Model = SliderPrimitive.Model;
export type Message = SliderPrimitive.Message;
export type OutMessage = SliderPrimitive.OutMessage;
export type Orientation = SliderPrimitive.Orientation;

const THUMB_SIZE = 'var(--slider-thumb)';

export type ViewConfig<ParentMessage> = Readonly<{
  model: Model;
  toParentMessage: (message: Message) => ParentMessage;
  value: number;
  slotId?: string;
  orientation?: Orientation;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  formatValue?: (value: number) => string;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  name?: string;
  className?: string;
}>;

export const view = <ParentMessage>(config: ViewConfig<ParentMessage>, h: HtmlBuilder<ParentMessage>): Html => {
  const { model, toParentMessage, slotId = model.id, orientation = 'Horizontal', className, ...viewInputs } = config;
  const orientationValue = String.toLowerCase(orientation);

  const toView = (render: SliderPrimitive.SliderAttributes): Html =>
    h.div(
      [
        h.DataAttribute('slot', 'slider'),
        h.DataAttribute('orientation', orientationValue),
        h.Class(cn('data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full', className)),
      ],
      [
        h.div(
          [
            ...render.root,
            h.Class(
              'relative flex w-full touch-none items-center select-none data-disabled:opacity-50 data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col',
            ),
          ],
          [
            h.div(
              [
                ...render.track,
                h.DataAttribute('slot', 'slider-track'),
                h.Class(
                  'relative grow overflow-hidden rounded-track bg-muted data-[orientation=horizontal]:h-track data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-track',
                ),
              ],
              [
                h.div([
                  ...render.filledTrack,
                  h.DataAttribute('slot', 'slider-range'),
                  h.DataAttribute('orientation', orientationValue),
                  h.Class('bg-primary-solid data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full'),
                ]),
              ],
            ),
            h.div([
              ...render.thumb,
              h.DataAttribute('slot', 'slider-thumb'),
              h.Class(
                'relative block size-(--slider-thumb) shrink-0 rounded-track border border-ring bg-thumb ring-ring/24 transition-[color,box-shadow] after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3',
              ),
            ]),
            ...(viewInputs.name === undefined ? [] : [h.input(render.hiddenInput)]),
          ],
        ),
      ],
    );

  return h.submodel({
    slotId,
    model,
    view: SliderPrimitive.view,
    viewInputs: { ...viewInputs, orientation, thumbAlignment: 'Edge', thumbSize: THUMB_SIZE, toView },
    toParentMessage,
  });
};
