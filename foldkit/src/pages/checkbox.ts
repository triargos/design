import { Array, Schema } from 'effect';
import { Submodel, type Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Checkbox from '../pavo/checkbox.ts';
import * as Field from '../pavo/field.ts';

export const title = 'Checkbox';
export const description = 'One of many on or off, or an agreement.';

const TASKS = ['Write the brief', 'Review the design', 'Book the launch'];
const EVENTS = ['Comments', 'Assigned tasks', 'Due dates'];

export const Model = Schema.Struct({
  isTaskSelected: Schema.Boolean,
  selectedTasks: Schema.Array(Schema.String),
  isArchiveChecked: Schema.Boolean,
  isGuestsChecked: Schema.Boolean,
  notifyEvents: Schema.Array(Schema.String),
  isTermsAccepted: Schema.Boolean,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  ToggledSelectTask: { isChecked: Schema.Boolean },
  ToggledAllTasks: { isChecked: Schema.Boolean },
  ToggledTask: { task: Schema.String, isChecked: Schema.Boolean },
  ToggledArchive: { isChecked: Schema.Boolean },
  ToggledGuests: { isChecked: Schema.Boolean },
  ToggledNotifyEvent: { event: Schema.String, isChecked: Schema.Boolean },
  ToggledTerms: { isChecked: Schema.Boolean },
  ToggledLocked: { isChecked: Schema.Boolean },
});
export type Message = typeof Message.Type;

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    isTaskSelected: true,
    selectedTasks: Array.take(TASKS, 1),
    isArchiveChecked: false,
    isGuestsChecked: true,
    notifyEvents: Array.take(EVENTS, 2),
    isTermsAccepted: false,
  },
});

const toggleMember =
  (member: string, isChecked: boolean) =>
  (members: ReadonlyArray<string>): ReadonlyArray<string> =>
    isChecked ? Array.union(members, [member]) : Array.filter(members, (current) => current !== member);

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    ToggledSelectTask: ({ isChecked }) => ({ model: modifyFields(model, { isTaskSelected: () => isChecked }) }),
    ToggledAllTasks: ({ isChecked }) => ({
      model: modifyFields(model, { selectedTasks: () => (isChecked ? TASKS : []) }),
    }),
    ToggledTask: ({ task, isChecked }) => ({
      model: modifyFields(model, { selectedTasks: toggleMember(task, isChecked) }),
    }),
    ToggledArchive: ({ isChecked }) => ({ model: modifyFields(model, { isArchiveChecked: () => isChecked }) }),
    ToggledGuests: ({ isChecked }) => ({ model: modifyFields(model, { isGuestsChecked: () => isChecked }) }),
    ToggledNotifyEvent: ({ event, isChecked }) => ({
      model: modifyFields(model, { notifyEvents: toggleMember(event, isChecked) }),
    }),
    ToggledTerms: ({ isChecked }) => ({ model: modifyFields(model, { isTermsAccepted: () => isChecked }) }),
    ToggledLocked: () => ({ model }),
  });

const indeterminate = (model: Model, h: HtmlBuilder<Message>): Html => {
  const isAllSelected = model.selectedTasks.length === TASKS.length;
  return Field.group(
    {
      className: 'w-64 gap-2',
      children: [
        Checkbox.view(
          {
            id: 'tasks-all',
            isChecked: isAllSelected,
            isIndeterminate: Array.isReadonlyArrayNonEmpty(model.selectedTasks) && !isAllSelected,
            onToggle: (isChecked) => Message.ToggledAllTasks({ isChecked }),
            toView: ({ checkbox, label }) =>
              Field.view(
                {
                  orientation: 'horizontal',
                  children: [checkbox, Field.label({ attributes: label, children: ['All tasks'] }, h)],
                },
                h,
              ),
          },
          h,
        ),
        ...Array.map(TASKS, (task, index) =>
          Checkbox.view(
            {
              id: `task-${index}`,
              isChecked: Array.contains(model.selectedTasks, task),
              onToggle: (isChecked) => Message.ToggledTask({ task, isChecked }),
              toView: ({ checkbox, label }) =>
                Field.view(
                  {
                    orientation: 'horizontal',
                    className: 'pl-6',
                    attributes: [h.Key(task)],
                    children: [
                      checkbox,
                      Field.label({ attributes: label, className: 'font-normal', children: [task] }, h),
                    ],
                  },
                  h,
                ),
            },
            h,
          ),
        ),
      ],
    },
    h,
  );
};

const withLabel = (model: Model, h: HtmlBuilder<Message>): Html =>
  Checkbox.view(
    {
      id: 'checkbox-archive',
      isChecked: model.isArchiveChecked,
      onToggle: (isChecked) => Message.ToggledArchive({ isChecked }),
      toView: ({ checkbox, label }) =>
        Field.view(
          {
            orientation: 'horizontal',
            children: [checkbox, Field.label({ attributes: label, children: ['Archive completed tasks'] }, h)],
          },
          h,
        ),
    },
    h,
  );

const withDescription = (model: Model, h: HtmlBuilder<Message>): Html =>
  Checkbox.view(
    {
      id: 'checkbox-guests',
      isChecked: model.isGuestsChecked,
      hasDescription: true,
      onToggle: (isChecked) => Message.ToggledGuests({ isChecked }),
      toView: ({ checkbox, label, description }) =>
        Field.view(
          {
            orientation: 'horizontal',
            className: 'max-w-md',
            children: [
              checkbox,
              Field.content(
                {
                  children: [
                    Field.label({ attributes: label, children: ['Allow guests'] }, h),
                    Field.description(
                      {
                        attributes: description,
                        children: ['People outside the workspace can view shared documents.'],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
    },
    h,
  );

const checkboxGroup = (model: Model, h: HtmlBuilder<Message>): Html =>
  Field.fieldSet(
    {
      className: 'max-w-md',
      children: [
        Field.legend({ children: ['Notify me about'] }, h),
        Field.group(
          {
            className: 'gap-related',
            children: Array.map(EVENTS, (event, index) =>
              Checkbox.view(
                {
                  id: `notify-${index}`,
                  isChecked: Array.contains(model.notifyEvents, event),
                  onToggle: (isChecked) => Message.ToggledNotifyEvent({ event, isChecked }),
                  toView: ({ checkbox, label }) =>
                    Field.view(
                      {
                        orientation: 'horizontal',
                        attributes: [h.Key(event)],
                        children: [
                          checkbox,
                          Field.label({ attributes: label, className: 'font-normal', children: [event] }, h),
                        ],
                      },
                      h,
                    ),
                },
                h,
              ),
            ),
          },
          h,
        ),
      ],
    },
    h,
  );

const disabled = (h: HtmlBuilder<Message>): Html =>
  Checkbox.view(
    {
      id: 'checkbox-locked',
      isChecked: true,
      isDisabled: true,
      onToggle: (isChecked) => Message.ToggledLocked({ isChecked }),
      toView: ({ checkbox, label }) =>
        Field.view(
          {
            orientation: 'horizontal',
            isDisabled: true,
            children: [checkbox, Field.label({ attributes: label, children: ['Set by the workspace owner'] }, h)],
          },
          h,
        ),
    },
    h,
  );

const invalid = (model: Model, h: HtmlBuilder<Message>): Html =>
  Checkbox.view(
    {
      id: 'checkbox-terms',
      isChecked: model.isTermsAccepted,
      isInvalid: !model.isTermsAccepted,
      onToggle: (isChecked) => Message.ToggledTerms({ isChecked }),
      toView: ({ checkbox, label }) =>
        Field.view(
          {
            orientation: 'horizontal',
            isInvalid: !model.isTermsAccepted,
            className: 'max-w-md',
            children: [
              checkbox,
              Field.content(
                {
                  children: [
                    Field.label({ attributes: label, children: ['I accept the terms of service'] }, h),
                    ...(model.isTermsAccepted
                      ? []
                      : [Field.error({ children: ['Accept the terms to create the workspace.'] }, h)]),
                  ],
                },
                h,
              ),
            ],
          },
          h,
        ),
    },
    h,
  );

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description:
        'One of many on or off, or an agreement. Flat: a 1px rim at rest, the brand fill when checked; indeterminate stands for a partial selection.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            children: [
              Checkbox.view(
                {
                  id: 'checkbox-default',
                  ariaLabel: 'Select task',
                  isChecked: model.isTaskSelected,
                  onToggle: (isChecked) => Message.ToggledSelectTask({ isChecked }),
                },
                h,
              ),
            ],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Indeterminate',
            description: 'A parent that stands for a partial selection.',
            children: [indeterminate(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'With label',
            description: [code("Field.view({ orientation: 'horizontal' })", h)],
            children: [withLabel(model, h)],
          },
          h,
        ),
        exampleSection({ title: 'With description', children: [withDescription(model, h)] }, h),
        exampleSection(
          {
            title: 'Group',
            description: [code('Field.fieldSet · Field.legend', h)],
            children: [checkboxGroup(model, h)],
          },
          h,
        ),
        exampleSection({ title: 'Disabled', children: [disabled(h)] }, h),
        exampleSection(
          {
            title: 'Invalid',
            description: 'The rim turns destructive, as on a text field.',
            children: [invalid(model, h)],
          },
          h,
        ),
      ],
    },
    h,
  ),
);
