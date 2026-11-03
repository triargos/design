import { Array, Duration, Effect, Schema } from 'effect';
import { Command, Submodel, type Update } from 'foldkit';
import * as FieldValidation from 'foldkit/fieldValidation';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Button from '../pavo/button.ts';
import * as Card from '../pavo/card.ts';
import * as Checkbox from '../pavo/checkbox.ts';
import { cn } from '../pavo/cn.ts';
import * as Field from '../pavo/field.ts';
import { icon } from '../pavo/icon.ts';
import * as Input from '../pavo/input.ts';
import * as InputGroup from '../pavo/input-group.ts';
import * as Switch from '../pavo/switch.ts';
import * as Tabs from '../pavo/tabs.ts';
import * as Textarea from '../pavo/textarea.ts';

export const title = 'Field';
export const description = 'A label, a control, a description and an error, in that order.';

const EVENTS = ['Comments', 'Assigned tasks', 'Due dates'];

const COLORS = [
  { value: '#64c989', name: 'Green' },
  { value: '#5b8def', name: 'Blue' },
  { value: '#e5a54b', name: 'Amber' },
  { value: '#e0686b', name: 'Red' },
  { value: '#a77de8', name: 'Violet' },
];

const DUE_RADIOS = [
  { value: 'day', children: ['Today'] },
  { value: 'week', children: ['This week'] },
  { value: 'month', children: ['This month'] },
];

const INVITE_LATENCY = Duration.millis(800);

const emailRules = FieldValidation.makeRules({
  rules: [FieldValidation.Rule.email('Enter a valid email address.')],
});

export const Model = Schema.Struct({
  color: Schema.String,
  due: Schema.String,
  isMentionsOnly: Schema.Boolean,
  notifyEvents: Schema.Array(Schema.String),
  isProfileDirty: Schema.Boolean,
  inviteEmail: FieldValidation.Field(Schema.String),
  hasSubmittedInvite: Schema.Boolean,
  isInvitePending: Schema.Boolean,
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  ClickedColor: { color: Schema.String },
  SelectedDue: { due: Schema.String },
  ToggledMentionsOnly: { isChecked: Schema.Boolean },
  ToggledNotifyEvent: { event: Schema.String, isChecked: Schema.Boolean },
  ChangedProfile: {},
  ClickedSaveProfile: {},
  UpdatedInviteEmail: { value: Schema.String },
  SubmittedInviteForm: {},
  CompletedSendInvite: {},
});
export type Message = typeof Message.Type;

const SendInvite = Command.define('SendInvite', {
  messages: [Message.CompletedSendInvite],
  execute: Effect.sleep(INVITE_LATENCY).pipe(Effect.as(Message.CompletedSendInvite())),
});

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    color: '#64c989',
    due: 'week',
    isMentionsOnly: true,
    notifyEvents: Array.take(EVENTS, 2),
    isProfileDirty: true,
    inviteEmail: FieldValidation.NotValidated({ value: 'maya@' }),
    hasSubmittedInvite: false,
    isInvitePending: false,
  },
});

const toggleMember =
  (member: string, isChecked: boolean) =>
  (members: ReadonlyArray<string>): ReadonlyArray<string> =>
    isChecked ? Array.union(members, [member]) : Array.filter(members, (current) => current !== member);

const submitInviteForm = (model: Model): Update.Return<Model, Message> => {
  const nextInviteEmail = FieldValidation.validate(emailRules)(model.inviteEmail.value);
  const isValid = FieldValidation.isValid(emailRules)(nextInviteEmail);
  const nextModel = modifyFields(model, {
    inviteEmail: () => nextInviteEmail,
    hasSubmittedInvite: () => true,
    isInvitePending: () => isValid,
  });
  if (isValid) {
    return { model: nextModel, commands: [SendInvite()] };
  } else {
    return { model: nextModel };
  }
};

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    ClickedColor: ({ color }) => ({ model: modifyFields(model, { color: () => color }) }),
    SelectedDue: ({ due }) => ({ model: modifyFields(model, { due: () => due }) }),
    ToggledMentionsOnly: ({ isChecked }) => ({ model: modifyFields(model, { isMentionsOnly: () => isChecked }) }),
    ToggledNotifyEvent: ({ event, isChecked }) => ({
      model: modifyFields(model, { notifyEvents: toggleMember(event, isChecked) }),
    }),
    ChangedProfile: () => ({ model: modifyFields(model, { isProfileDirty: () => true }) }),
    ClickedSaveProfile: () => ({ model: modifyFields(model, { isProfileDirty: () => false }) }),
    UpdatedInviteEmail: ({ value }) => ({
      model: modifyFields(model, {
        inviteEmail: () =>
          model.hasSubmittedInvite
            ? FieldValidation.validate(emailRules)(value)
            : FieldValidation.NotValidated({ value }),
      }),
    }),
    SubmittedInviteForm: () => submitInviteForm(model),
    CompletedSendInvite: () => ({ model: modifyFields(model, { isInvitePending: () => false }) }),
  });

const fieldDefault = (h: HtmlBuilder<Message>): Html =>
  Field.view(
    {
      className: 'w-80',
      children: [
        Field.label({ forId: 'field-name', isRequired: true, children: ['Project name'] }, h),
        Input.view({ id: 'field-name', placeholder: 'Website redesign', isRequired: true }, h),
      ],
    },
    h,
  );

const withDescription = (h: HtmlBuilder<Message>): Html =>
  Field.view(
    {
      className: 'w-80',
      children: [
        Field.label({ forId: 'field-display-name', children: ['Display name'] }, h),
        Input.view({ id: 'field-display-name', defaultValue: 'Maya Chen', hasDescription: true }, h),
        Field.description(
          {
            attributes: [h.Id(Input.descriptionId('field-display-name'))],
            children: ['Shown on your comments and tasks.'],
          },
          h,
        ),
      ],
    },
    h,
  );

const withError = (h: HtmlBuilder<Message>): Html =>
  Field.view(
    {
      isInvalid: true,
      className: 'w-80',
      children: [
        Field.label({ forId: 'field-required-name', isRequired: true, children: ['Project name'] }, h),
        Input.view(
          {
            id: 'field-required-name',
            placeholder: 'Website redesign',
            isRequired: true,
            isInvalid: true,
            hasDescription: true,
          },
          h,
        ),
        Field.description(
          {
            attributes: [h.Id(Input.descriptionId('field-required-name'))],
            children: ['Members see it in the sidebar.'],
          },
          h,
        ),
        Field.error({ children: ['Enter a project name.'] }, h),
      ],
    },
    h,
  );

const severalErrors = (h: HtmlBuilder<Message>): Html =>
  Field.view(
    {
      isInvalid: true,
      className: 'w-80',
      children: [
        Field.label({ forId: 'field-password', children: ['Password'] }, h),
        Input.view({ id: 'field-password', type: 'password', defaultValue: 'abc', isInvalid: true }, h),
        Field.error({ errors: ['Use at least 12 characters.', 'Add a number.'] }, h),
      ],
    },
    h,
  );

const colorSwatches = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Role('radiogroup'), h.AriaLabelledBy('field-color-title'), h.Class('flex items-center gap-related')],
    Array.map(COLORS, ({ value, name }) =>
      h.keyed('button')(value, [
        h.Type('button'),
        h.Role('radio'),
        h.AriaChecked(model.color === value),
        h.AriaLabel(name),
        h.Style({ backgroundColor: value }),
        h.OnClick(Message.ClickedColor({ color: value })),
        h.Class(
          cn(
            'size-6 rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/24',
            model.color === value && 'ring-2 ring-foreground ring-offset-2 ring-offset-background',
          ),
        ),
      ]),
    ),
  );

const withTitle = (model: Model, h: HtmlBuilder<Message>): Html =>
  Field.view(
    {
      className: 'w-80',
      attributes: [h.AriaLabelledBy('field-color-title')],
      children: [
        Field.title({ attributes: [h.Id('field-color-title')], children: ['Color'] }, h),
        colorSwatches(model, h),
        Field.description({ children: ['Shown as a dot next to the project name.'] }, h),
      ],
    },
    h,
  );

const pills = (model: Model, h: HtmlBuilder<Message>): Html =>
  Field.view(
    {
      className: 'w-96',
      children: [
        Field.label({ children: ['Due'] }, h),
        Tabs.radioGroup(
          {
            radios: DUE_RADIOS,
            value: model.due,
            onValueChange: (due) => Message.SelectedDue({ due }),
            ariaLabel: 'Due',
          },
          h,
        ),
      ],
    },
    h,
  );

const columns = (h: HtmlBuilder<Message>): Html =>
  Field.group(
    {
      columns: 2,
      className: 'w-full max-w-md',
      children: [
        Field.view(
          {
            children: [
              Field.label({ forId: 'field-first', children: ['First name'] }, h),
              Input.view({ id: 'field-first', defaultValue: 'Maya' }, h),
            ],
          },
          h,
        ),
        Field.view(
          {
            children: [
              Field.label({ forId: 'field-last', children: ['Last name'] }, h),
              Input.view({ id: 'field-last', defaultValue: 'Chen' }, h),
            ],
          },
          h,
        ),
      ],
    },
    h,
  );

const horizontal = (model: Model, h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      className: 'w-full max-w-xl',
      children: [
        Card.header(
          {
            children: [
              Card.title({ children: ['Notifications'] }, h),
              Card.description({ children: ['How you hear about changes to your tasks.'] }, h),
            ],
          },
          h,
        ),
        Card.content(
          {
            className: 'p-card',
            children: [
              Field.group(
                {
                  children: [
                    Field.view(
                      {
                        orientation: 'horizontal',
                        children: [
                          Field.content(
                            { children: [Field.label({ forId: 'field-reply-to', children: ['Reply-to address'] }, h)] },
                            h,
                          ),
                          Input.view(
                            {
                              id: 'field-reply-to',
                              type: 'email',
                              defaultValue: 'team@acme.com',
                              className: 'w-full max-w-48',
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                    Field.separator({}, h),
                    Switch.view(
                      {
                        id: 'field-mentions',
                        isChecked: model.isMentionsOnly,
                        hasDescription: true,
                        onToggle: (isChecked) => Message.ToggledMentionsOnly({ isChecked }),
                        toView: (render) =>
                          Field.view(
                            {
                              orientation: 'horizontal',
                              children: [
                                Field.content(
                                  {
                                    children: [
                                      Field.label({ attributes: render.label, children: ['Mentions only'] }, h),
                                      Field.description(
                                        {
                                          attributes: render.description,
                                          children: ['Skip updates unless someone mentions you.'],
                                        },
                                        h,
                                      ),
                                    ],
                                  },
                                  h,
                                ),
                                render.switch,
                              ],
                            },
                            h,
                          ),
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
      ],
    },
    h,
  );

const legend = (model: Model, h: HtmlBuilder<Message>): Html =>
  Field.fieldSet(
    {
      className: 'w-full max-w-md',
      children: [
        Field.legend({ variant: 'legend', children: ['Notifications'] }, h),
        Field.group(
          {
            children: [
              Field.view(
                {
                  children: [
                    Field.label({ forId: 'legend-email', children: ['Email address'] }, h),
                    Input.view({ id: 'legend-email', type: 'email', defaultValue: 'maya@acme.com' }, h),
                  ],
                },
                h,
              ),
              Field.fieldSet(
                {
                  children: [
                    Field.legend({ children: ['Notify me about'] }, h),
                    Field.group(
                      {
                        className: 'gap-related',
                        children: Array.map(EVENTS, (event, index) =>
                          Checkbox.view(
                            {
                              id: `legend-notify-${index}`,
                              isChecked: Array.contains(model.notifyEvents, event),
                              onToggle: (isChecked) => Message.ToggledNotifyEvent({ event, isChecked }),
                              toView: ({ checkbox, label }) =>
                                Field.view(
                                  {
                                    orientation: 'horizontal',
                                    attributes: [h.Key(event)],
                                    children: [
                                      checkbox,
                                      Field.label(
                                        { attributes: label, className: 'font-normal', children: [event] },
                                        h,
                                      ),
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
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  );

const markProfileChanged = () => Message.ChangedProfile();

const inACard = (model: Model, h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      className: 'w-full max-w-xl',
      children: [
        Card.header(
          {
            children: [
              Card.title({ children: ['Profile'] }, h),
              Card.description({ children: ['What other members of the workspace see.'] }, h),
            ],
          },
          h,
        ),
        Card.content(
          {
            className: 'p-card',
            children: [
              Field.group(
                {
                  children: [
                    Field.group(
                      {
                        columns: 2,
                        children: [
                          Field.view(
                            {
                              children: [
                                Field.label({ forId: 'profile-first', children: ['First name'] }, h),
                                Input.view(
                                  { id: 'profile-first', defaultValue: 'Maya', onInput: markProfileChanged },
                                  h,
                                ),
                              ],
                            },
                            h,
                          ),
                          Field.view(
                            {
                              children: [
                                Field.label({ forId: 'profile-last', children: ['Last name'] }, h),
                                Input.view(
                                  { id: 'profile-last', defaultValue: 'Chen', onInput: markProfileChanged },
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
                    Field.view(
                      {
                        children: [
                          Field.label({ forId: 'profile-email', children: ['Email'] }, h),
                          InputGroup.view(
                            {
                              children: [
                                InputGroup.addon({ children: [icon('at')] }, h),
                                InputGroup.input(
                                  {
                                    id: 'profile-email',
                                    type: 'email',
                                    defaultValue: 'maya@example.com',
                                    hasDescription: true,
                                    onInput: markProfileChanged,
                                  },
                                  h,
                                ),
                              ],
                            },
                            h,
                          ),
                          Field.description(
                            {
                              attributes: [h.Id(Input.descriptionId('profile-email'))],
                              children: ['Task updates and invoices go to this address.'],
                            },
                            h,
                          ),
                        ],
                      },
                      h,
                    ),
                    Field.view(
                      {
                        children: [
                          Field.label({ forId: 'profile-bio', children: ['Bio'] }, h),
                          Textarea.view(
                            { id: 'profile-bio', placeholder: 'Optional', rows: 3, onInput: markProfileChanged },
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
            ],
          },
          h,
        ),
        Card.footer(
          {
            isShown: model.isProfileDirty,
            className: 'flex items-center justify-end gap-related',
            children: [
              h.span([h.Class('text-body text-muted-foreground')], ['Unsaved changes']),
              Button.view({ intent: 'primary', onClick: Message.ClickedSaveProfile(), children: ['Save'] }, h),
            ],
          },
          h,
        ),
      ],
    },
    h,
  );

const inAForm = (model: Model, h: HtmlBuilder<Message>): Html => {
  const isEmailInvalid = FieldValidation.isInvalid(model.inviteEmail);
  const emailErrors = FieldValidation.match(model.inviteEmail, {
    onNotValidated: (): ReadonlyArray<string> => [],
    onValidating: () => [],
    onValid: () => [],
    onInvalid: ({ errors }) => errors,
  });
  return h.form(
    [h.Novalidate(true), h.OnSubmit(Message.SubmittedInviteForm()), h.Class('w-80')],
    [
      Field.group(
        {
          children: [
            Field.view(
              {
                isInvalid: isEmailInvalid,
                children: [
                  Field.label({ forId: 'email', children: ['Email'] }, h),
                  Input.view(
                    {
                      id: 'email',
                      name: 'email',
                      type: 'email',
                      value: model.inviteEmail.value,
                      onInput: (value) => Message.UpdatedInviteEmail({ value }),
                      isInvalid: isEmailInvalid,
                      hasDescription: true,
                    },
                    h,
                  ),
                  Field.description(
                    {
                      attributes: [h.Id(Input.descriptionId('email'))],
                      children: ['We send the invitation to this address.'],
                    },
                    h,
                  ),
                  Field.error({ errors: emailErrors }, h),
                ],
              },
              h,
            ),
            Button.view(
              {
                type: 'submit',
                intent: 'primary',
                isPending: model.isInvitePending,
                className: 'self-start',
                children: ['Invite'],
              },
              h,
            ),
          ],
        },
        h,
      ),
    ],
  );
};

const disabled = (h: HtmlBuilder<Message>): Html =>
  Field.view(
    {
      isDisabled: true,
      className: 'w-80',
      children: [
        Field.label({ forId: 'field-slug', children: ['Workspace URL'] }, h),
        Input.view({ id: 'field-slug', defaultValue: 'acme.example.com', isDisabled: true, hasDescription: true }, h),
        Field.description(
          { attributes: [h.Id(Input.descriptionId('field-slug'))], children: ['Only owners can change it.'] },
          h,
        ),
      ],
    },
    h,
  );

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description: 'A label, a control, a description and an error, in that order. Forms are fields in a card.',
      sections: [
        exampleSection({ title: 'Default', description: 'Label to control: related.', children: [fieldDefault(h)] }, h),
        exampleSection(
          { title: 'With description', description: 'Tight under the control.', children: [withDescription(h)] },
          h,
        ),
        exampleSection(
          {
            title: 'With error',
            description: [
              code('isInvalid', h),
              ' on the field, ',
              code('isInvalid', h),
              ' on the control, ',
              code('Field.error', h),
              ' last.',
            ],
            children: [withError(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Several errors',
            description: [code('Field.error({ errors })', h), ' lists them.'],
            children: [severalErrors(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'With title',
            description: [
              'A control that is not an input is named by ',
              code('Field.title', h),
              ' through aria-labelledby.',
            ],
            children: [withTitle(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Pills',
            description: ['Pills sit under their label: ', code('Tabs.radioGroup', h), '.'],
            children: [pills(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Columns',
            description: [code('Field.group({ columns: 2 })', h), ' for short peers.'],
            children: [columns(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Horizontal',
            description: [
              'Settings: ',
              code("orientation: 'horizontal'", h),
              ' puts the label and description beside the control. Beside an input or a select they center on it; beside a checkbox or radio they start on its line.',
            ],
            isBare: true,
            children: [horizontal(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Legend',
            description: [
              code('Field.fieldSet · Field.legend', h),
              ': ',
              code("variant: 'legend'", h),
              ' heads a section of fields; the default ',
              code('label', h),
              ' names one question.',
            ],
            children: [legend(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'In a card',
            description: 'A form is fields in a card; the footer shows while there are changes.',
            isBare: true,
            children: [inACard(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'In a form',
            description: 'Validation lives in update, with foldkit/fieldValidation. Submit to see the error.',
            children: [inAForm(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Disabled',
            description: [code('isDisabled', h), ' on the field mutes the label; the control takes its own.'],
            children: [disabled(h)],
          },
          h,
        ),
      ],
    },
    h,
  ),
);
