import { Schema } from 'effect';
import { Submodel, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Stepper from '../pavo/stepper.ts';

export const title = 'Stepper';
export const description = 'A fixed sequence and where someone is in it.';

export const Model = Schema.Struct({});
export type Model = typeof Model.Type;

export const Message = Schema.Never;
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({ model: {} });

export const update = (model: Model, _message: Message): Update.Return<Model, Message> => ({ model });

const STEPS = ['Create project', 'Invite members', 'Add tasks'] as const;

const EXPORT = [
  { title: 'Export requested', description: 'March 3, 2025' },
  { title: 'Confirmed', description: 'By email link' },
  { title: 'Archive ready', description: 'April 2, 2025 at 10:00 AM' },
] as const;

const setup = (isLoading: boolean, h: HtmlBuilder<Message>): Html =>
  Stepper.view(
    {
      value: 2,
      isLoading,
      ariaLabel: 'Project setup',
      className: 'w-full max-w-xl',
      items: STEPS.map((stepTitle) => ({ children: [Stepper.title({ children: [stepTitle] }, h)] })),
    },
    h,
  );

const workspaceExport = (value: number, h: HtmlBuilder<Message>): Html =>
  Stepper.view(
    {
      value,
      orientation: 'vertical',
      ariaLabel: 'Workspace export',
      items: EXPORT.map((step) => ({
        children: [
          Stepper.title({ children: [step.title] }, h),
          Stepper.description({ children: [step.description] }, h),
        ],
      })),
    },
    h,
  );

export const view = Submodel.defineView<Model, Message>((_model, h): Html =>
  page(
    {
      title,
      description,
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: ['Horizontal, ', code('value: 2', h), ': done, active, todo.'],
            children: [setup(false, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Vertical',
            description: [
              code("orientation: 'vertical'", h),
              ', with a ',
              code('Stepper.description', h),
              ' under each title.',
            ],
            children: [workspaceExport(2, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Loading',
            description: [code('isLoading', h), ": the active step's indicator spins."],
            children: [setup(true, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Done',
            description: [code('value', h), ' past the last step.'],
            children: [workspaceExport(4, h)],
          },
          h,
        ),
      ],
    },
    h,
  ),
);
