import { Array, DateTime, Duration, Effect, Number, Option, Order, Schema } from 'effect';
import { Command, Submodel, Update } from 'foldkit';
import type { Html, HtmlBuilder } from 'foldkit/html';
import { defineMessageUnion } from 'foldkit/message';
import { modifyFields } from 'foldkit/struct';

import { code, exampleSection, page } from '../kit.ts';
import type { PageContext } from '../pageContext.ts';
import * as Badge from '../pavo/badge.ts';
import * as Button from '../pavo/button.ts';
import * as Card from '../pavo/card.ts';
import * as Checkbox from '../pavo/checkbox.ts';
import * as DropdownMenu from '../pavo/dropdown-menu.ts';
import * as Empty from '../pavo/empty.ts';
import { icon } from '../pavo/icon.ts';
import type { Intent } from '../pavo/intent.ts';
import * as Table from '../pavo/table.ts';

export const title = 'Table';
export const description = 'Rows of records with shared columns.';

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

type StatusLabel = Readonly<{ label: string; intent: Intent }>;

type PaymentStatus = 'paid' | 'open' | 'pending';

type Payment = Readonly<{ id: string; item: string; status: PaymentStatus; group: string; amount: number }>;

const PAYMENTS: ReadonlyArray<Payment> = [
  { id: '1', item: 'INV-2041', status: 'paid', group: 'Website redesign', amount: 12500 },
  { id: '2', item: 'INV-2042', status: 'open', group: 'Mobile app', amount: 8750 },
  { id: '3', item: 'INV-2043', status: 'pending', group: 'Brand refresh', amount: 5200 },
];

const SELECTABLE_PAYMENTS: ReadonlyArray<Payment> = [
  ...PAYMENTS,
  { id: '4', item: 'INV-2044', status: 'paid', group: 'Website redesign', amount: 3800 },
];

const PAYMENT_STATUS: Record<PaymentStatus, StatusLabel> = {
  paid: { label: 'Paid', intent: 'success' },
  open: { label: 'Open', intent: 'neutral' },
  pending: { label: 'In review', intent: 'warning' },
};

const PAYMENTS_TOTAL = usd.format(Number.sumAll(Array.map(PAYMENTS, ({ amount }) => amount)));

type GroupTask = Readonly<{ id: string; title: string; assignee: string; status: StatusLabel }>;

type Project = Readonly<{ id: string; name: string; tasks: ReadonlyArray<GroupTask> }>;

const PROJECTS: ReadonlyArray<Project> = [
  {
    id: 'website',
    name: 'Website redesign',
    tasks: [
      {
        id: '1',
        title: 'Update pricing page',
        assignee: 'Maya Chen',
        status: { label: 'In review', intent: 'warning' },
      },
      { id: '2', title: 'Write launch post', assignee: 'Jonas Weber', status: { label: 'New', intent: 'info' } },
      { id: '3', title: 'Swap hero images', assignee: 'Priya Patel', status: { label: 'Done', intent: 'success' } },
    ],
  },
  {
    id: 'mobile',
    name: 'Mobile app',
    tasks: [
      { id: '4', title: 'Fix login redirect', assignee: 'Leo Martin', status: { label: 'New', intent: 'info' } },
      {
        id: '5',
        title: 'Push notifications',
        assignee: 'Sofia Rossi',
        status: { label: 'In review', intent: 'warning' },
      },
    ],
  },
];

const GROUP_COLUMNS = 3;

const LinkedProjectId = Schema.Literals(['website', 'mobile', 'brand']);
type LinkedProjectId = typeof LinkedProjectId.Type;

type LinkedProject = Readonly<{ id: LinkedProjectId; name: string; lead: string; status: StatusLabel }>;

const LINKED_PROJECTS: ReadonlyArray<LinkedProject> = [
  { id: 'website', name: 'Website redesign', lead: 'Maya Chen', status: { label: 'On track', intent: 'success' } },
  { id: 'mobile', name: 'Mobile app', lead: 'Leo Martin', status: { label: 'At risk', intent: 'warning' } },
  { id: 'brand', name: 'Brand refresh', lead: 'Sofia Rossi', status: { label: 'Paused', intent: 'neutral' } },
];

type Member = Readonly<{ id: string; name: string; role: string; tasks: number; joined: string }>;

const MEMBERS: ReadonlyArray<Member> = [
  { id: '1', name: 'Maya Chen', role: 'Admin', tasks: 14, joined: '2024-02-12' },
  { id: '2', name: 'Jonas Weber', role: 'Member', tasks: 9, joined: '2023-11-03' },
  { id: '3', name: 'Priya Patel', role: 'Member', tasks: 21, joined: '2024-06-27' },
  { id: '4', name: 'Leo Martin', role: 'Guest', tasks: 2, joined: '2025-01-15' },
  { id: '5', name: 'Sofia Rossi', role: 'Admin', tasks: 17, joined: '2022-09-30' },
];

const SortKey = Schema.Literals(['name', 'tasks', 'joined']);
type SortKey = typeof SortKey.Type;

const SortDirection = Schema.Literals(['asc', 'desc']);

const MemberSort = Schema.Struct({ key: SortKey, direction: SortDirection });
type MemberSort = typeof MemberSort.Type;

const MEMBER_ORDER: Record<SortKey, Order.Order<Member>> = {
  name: Order.mapInput(Order.String, (member: Member) => member.name),
  tasks: Order.mapInput(Order.Number, (member: Member) => member.tasks),
  joined: Order.mapInput(Order.String, (member: Member) => member.joined),
};

const formatJoined = (joined: string): string =>
  DateTime.formatUtc(DateTime.makeUnsafe(joined), { dateStyle: 'medium', locale: 'en-US' });

const INVOICE_PAGE_SIZE = 100;
const INVOICE_TOTAL = 1000;
const INVOICE_ROW_HEIGHT = 45;
const INVOICE_PROJECTS = ['Website redesign', 'Mobile app', 'Brand refresh', 'Onboarding'];
const INVOICE_STATUSES: ReadonlyArray<StatusLabel> = [
  { label: 'Paid', intent: 'success' },
  { label: 'Open', intent: 'neutral' },
  { label: 'In review', intent: 'warning' },
];
const LOAD_INVOICES_LATENCY = Duration.millis(800);

const Invoice = Schema.Struct({
  id: Schema.String,
  invoice: Schema.String,
  project: Schema.String,
  statusIndex: Schema.Number,
  amount: Schema.Number,
});
type Invoice = typeof Invoice.Type;

const invoicePage = (from: number): ReadonlyArray<Invoice> =>
  Array.makeBy(INVOICE_PAGE_SIZE, (offset) => {
    const index = from + offset;
    return {
      id: String(index),
      invoice: `INV-${String(index + 1).padStart(4, '0')}`,
      project: INVOICE_PROJECTS[index % INVOICE_PROJECTS.length] ?? '',
      statusIndex: index % INVOICE_STATUSES.length,
      amount: 400 + ((index * 937) % 12000),
    };
  });

const ROLES: ReadonlyArray<StatusLabel> = [
  { label: 'Admin', intent: 'primary' },
  { label: 'Member', intent: 'neutral' },
  { label: 'Guest', intent: 'neutral' },
];
const FIRST_NAMES = ['Maya', 'Jonas', 'Priya', 'Leo', 'Sofia', 'Amir', 'Hana', 'Lukas'];
const LAST_NAMES = ['Chen', 'Weber', 'Patel', 'Martin', 'Rossi', 'Khan', 'Sato', 'Novak'];
const MEMBER_COUNT = 500;
const MEMBER_ROW_HEIGHT = 65;

type DirectoryMember = Readonly<{ id: string; name: string; email: string; roleIndex: number }>;

const roleIndexOf = (index: number): number => {
  if (index % 7 === 0) {
    return 0;
  } else if (index % 3 === 0) {
    return 2;
  } else {
    return 1;
  }
};

const DIRECTORY: ReadonlyArray<DirectoryMember> = Array.makeBy(MEMBER_COUNT, (index) => {
  const first = FIRST_NAMES[index % FIRST_NAMES.length] ?? '';
  const last = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length] ?? '';
  return {
    id: String(index),
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}${index}@acme.com`,
    roleIndex: roleIndexOf(index),
  };
});

const UNKNOWN_STATUS: StatusLabel = { label: '', intent: 'neutral' };

const statusOf = (statuses: ReadonlyArray<StatusLabel>, index: number): StatusLabel =>
  Option.getOrElse(Array.get(statuses, index), () => UNKNOWN_STATUS);

export const Model = Schema.Struct({
  selectedPaymentIds: Schema.Array(Schema.String),
  memberSort: MemberSort,
  closedProjectIds: Schema.Array(Schema.String),
  invoices: Schema.Array(Invoice),
  isLoadingInvoices: Schema.Boolean,
  invoiceTable: Table.VirtualTableModel,
  directoryTable: Table.VirtualTableModel,
  projectMenus: Schema.Record(LinkedProjectId, DropdownMenu.Model),
});
export type Model = typeof Model.Type;

export const Message = defineMessageUnion({
  ToggledPayment: { paymentId: Schema.String, isChecked: Schema.Boolean },
  ToggledAllPayments: { isChecked: Schema.Boolean },
  ClickedSortColumn: { key: SortKey },
  ToggledProjectGroup: { projectId: Schema.String },
  GotInvoiceTableMessage: { message: Table.VirtualTableMessage },
  CompletedLoadInvoices: {},
  GotDirectoryTableMessage: { message: Table.VirtualTableMessage },
  GotProjectMenuMessage: { projectId: LinkedProjectId, message: DropdownMenu.Message },
});
export type Message = typeof Message.Type;

const LoadInvoices = Command.define('LoadInvoices', {
  messages: [Message.CompletedLoadInvoices],
  execute: Effect.sleep(LOAD_INVOICES_LATENCY).pipe(Effect.as(Message.CompletedLoadInvoices())),
});

const initProjectMenu = (projectId: LinkedProjectId): DropdownMenu.Model =>
  DropdownMenu.init({ id: `table-project-menu-${projectId}`, isAnimated: true, isModal: true });

export const init = (_context: PageContext): Update.Return<Model, Message> => ({
  model: {
    selectedPaymentIds: ['2'],
    memberSort: { key: 'name', direction: 'asc' },
    closedProjectIds: [],
    invoices: invoicePage(0),
    isLoadingInvoices: false,
    invoiceTable: Table.initVirtualTable({ id: 'table-invoices' }),
    directoryTable: Table.initVirtualTable({ id: 'table-directory' }),
    projectMenus: {
      website: initProjectMenu('website'),
      mobile: initProjectMenu('mobile'),
      brand: initProjectMenu('brand'),
    },
  },
});

const ProjectMenu = DropdownMenu.create<ProjectAction>();

const toProjectMenuMessage = (projectId: LinkedProjectId, message: DropdownMenu.Message): Message =>
  Message.GotProjectMenuMessage({ projectId, message });

const foldProjectMenu = Update.foldChildAt({
  update: ProjectMenu.update,
  readAt: (model: Model, projectId: LinkedProjectId) => Option.some(model.projectMenus[projectId]),
  writeAt: (model: Model, projectId: LinkedProjectId, nextMenu: DropdownMenu.Model) =>
    modifyFields(model, { projectMenus: (menus) => ({ ...menus, [projectId]: nextMenu }) }),
  toParentMessage: toProjectMenuMessage,
  foldOutMessage: () => () => (stepModel) => ({ model: stepModel }),
});

const toInvoiceTableMessage = (message: Table.VirtualTableMessage): Message =>
  Message.GotInvoiceTableMessage({ message });
const toDirectoryTableMessage = (message: Table.VirtualTableMessage): Message =>
  Message.GotDirectoryTableMessage({ message });

const foldInvoiceTable = Update.foldChild({
  update: Table.updateVirtualTable,
  read: (model: Model) => Option.some(model.invoiceTable),
  write: (model: Model, nextInvoiceTable: Table.VirtualTableModel) =>
    modifyFields(model, { invoiceTable: () => nextInvoiceTable }),
  toParentMessage: toInvoiceTableMessage,
});

const foldDirectoryTable = Update.foldChild({
  update: Table.updateVirtualTable,
  read: (model: Model) => Option.some(model.directoryTable),
  write: (model: Model, nextDirectoryTable: Table.VirtualTableModel) =>
    modifyFields(model, { directoryTable: () => nextDirectoryTable }),
  toParentMessage: toDirectoryTableMessage,
});

const hasMoreInvoices = (model: Model): boolean => model.invoices.length < INVOICE_TOTAL;

const loadInvoicesNearEnd = (model: Model): Update.Return<Model, Message> =>
  hasMoreInvoices(model) &&
  !model.isLoadingInvoices &&
  Table.isNearEnd(model.invoiceTable, model.invoices.length, INVOICE_ROW_HEIGHT)
    ? { model: modifyFields(model, { isLoadingInvoices: () => true }), commands: [LoadInvoices()] }
    : { model };

const toggleId =
  (id: string, isIncluded: boolean) =>
  (ids: ReadonlyArray<string>): ReadonlyArray<string> =>
    isIncluded ? Array.dedupe(Array.append(ids, id)) : Array.filter(ids, (otherId) => otherId !== id);

const nextMemberSort = (memberSort: MemberSort, key: SortKey): MemberSort => ({
  key,
  direction: memberSort.key === key && memberSort.direction === 'asc' ? 'desc' : 'asc',
});

export const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    ToggledPayment: ({ paymentId, isChecked }) => ({
      model: modifyFields(model, { selectedPaymentIds: toggleId(paymentId, isChecked) }),
    }),
    ToggledAllPayments: ({ isChecked }) => ({
      model: modifyFields(model, {
        selectedPaymentIds: () => (isChecked ? Array.map(SELECTABLE_PAYMENTS, ({ id }) => id) : []),
      }),
    }),
    ClickedSortColumn: ({ key }) => ({
      model: modifyFields(model, { memberSort: (memberSort) => nextMemberSort(memberSort, key) }),
    }),
    ToggledProjectGroup: ({ projectId }) => ({
      model: modifyFields(model, {
        closedProjectIds: (ids) => toggleId(projectId, !Array.contains(ids, projectId))(ids),
      }),
    }),
    GotInvoiceTableMessage: ({ message }) => Update.combine(model, [foldInvoiceTable(message), loadInvoicesNearEnd]),
    CompletedLoadInvoices: () => ({
      model: modifyFields(model, {
        invoices: (invoices) => Array.appendAll(invoices, invoicePage(invoices.length)),
        isLoadingInvoices: () => false,
      }),
    }),
    GotDirectoryTableMessage: ({ message }) => foldDirectoryTable(model, message),
    GotProjectMenuMessage: ({ projectId, message }) => foldProjectMenu(model, projectId, message),
  });

const paymentHeaderRow = (variant: Table.TableVariant, h: HtmlBuilder<Message>): Html =>
  Table.row(
    {
      variant,
      section: 'head',
      children: [
        Table.head({ variant, children: ['Invoice'] }, h),
        Table.head({ variant, children: ['Status'] }, h),
        Table.head({ variant, children: ['Project'] }, h),
        Table.head({ variant, className: 'text-right', children: ['Amount'] }, h),
      ],
    },
    h,
  );

const paymentRow = (variant: Table.TableVariant, payment: Payment, h: HtmlBuilder<Message>): Html =>
  Table.row(
    {
      variant,
      attributes: [h.Key(payment.id)],
      children: [
        Table.cell({ variant, className: 'font-medium', children: [payment.item] }, h),
        Table.cell(
          {
            variant,
            children: [
              Badge.view(
                { intent: PAYMENT_STATUS[payment.status].intent, children: [PAYMENT_STATUS[payment.status].label] },
                h,
              ),
            ],
          },
          h,
        ),
        Table.cell({ variant, children: [payment.group] }, h),
        Table.cell({ variant, className: 'text-right tabular-nums', children: [usd.format(payment.amount)] }, h),
      ],
    },
    h,
  );

const paymentTable = (variant: Table.TableVariant, footer: ReadonlyArray<Html>, h: HtmlBuilder<Message>): Html =>
  Table.view(
    {
      variant,
      className: variant === 'default' ? 'w-full max-w-2xl' : undefined,
      children: [
        Table.header({ variant, children: [paymentHeaderRow(variant, h)] }, h),
        Table.body({ variant, children: Array.map(PAYMENTS, (payment) => paymentRow(variant, payment, h)) }, h),
        ...footer,
      ],
    },
    h,
  );

const inACard = (h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      className: 'w-full max-w-2xl',
      children: [
        paymentTable(
          'card',
          [
            Table.footer(
              {
                variant: 'card',
                children: [
                  Table.row(
                    {
                      variant: 'card',
                      section: 'foot',
                      children: [
                        Table.cell({ variant: 'card', section: 'foot', colSpan: 3, children: ['Total'] }, h),
                        Table.cell(
                          {
                            variant: 'card',
                            section: 'foot',
                            className: 'text-right tabular-nums',
                            children: [PAYMENTS_TOTAL],
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
          h,
        ),
      ],
    },
    h,
  );

const withHeader = (h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      className: 'w-full max-w-2xl',
      children: [
        Card.header(
          {
            actions: [Button.view({ size: 'icon-sm', ariaLabel: 'More', children: [icon('dots')] }, h)],
            children: [Card.title({ children: ['Invoices'] }, h)],
          },
          h,
        ),
        paymentTable('card', [], h),
      ],
    },
    h,
  );

const flush = (h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      className: 'w-full max-w-2xl',
      children: [
        Card.header({ children: [Card.title({ children: ['Invoices'] }, h)] }, h),
        Card.content({ className: 'overflow-hidden', children: [paymentTable('flush', [], h)] }, h),
      ],
    },
    h,
  );

const withSelection = (model: Model, h: HtmlBuilder<Message>): Html => {
  const selectedCount = model.selectedPaymentIds.length;
  const isAllSelected = selectedCount === SELECTABLE_PAYMENTS.length;
  const isPaymentSelected = (payment: Payment): boolean => Array.contains(model.selectedPaymentIds, payment.id);

  return Card.view(
    {
      className: 'w-full max-w-2xl',
      children: [
        Table.view(
          {
            variant: 'card',
            children: [
              Table.header(
                {
                  variant: 'card',
                  children: [
                    Table.row(
                      {
                        variant: 'card',
                        section: 'head',
                        children: [
                          Table.head(
                            {
                              variant: 'card',
                              children: [
                                Checkbox.view(
                                  {
                                    id: 'table-select-all',
                                    ariaLabel: 'Select all',
                                    isChecked: isAllSelected,
                                    isIndeterminate: selectedCount > 0 && !isAllSelected,
                                    onToggle: (isChecked) => Message.ToggledAllPayments({ isChecked }),
                                  },
                                  h,
                                ),
                              ],
                            },
                            h,
                          ),
                          Table.head({ variant: 'card', children: ['Invoice'] }, h),
                          Table.head({ variant: 'card', children: ['Status'] }, h),
                          Table.head({ variant: 'card', children: ['Project'] }, h),
                          Table.head({ variant: 'card', children: [h.div([h.Class('text-right')], ['Amount'])] }, h),
                        ],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
              Table.body(
                {
                  variant: 'card',
                  children: Array.map(SELECTABLE_PAYMENTS, (payment) =>
                    Table.row(
                      {
                        variant: 'card',
                        isSelected: isPaymentSelected(payment),
                        attributes: [h.Key(payment.id)],
                        children: [
                          Table.cell(
                            {
                              variant: 'card',
                              children: [
                                Checkbox.view(
                                  {
                                    id: `table-select-${payment.id}`,
                                    ariaLabel: 'Select row',
                                    isChecked: isPaymentSelected(payment),
                                    onToggle: (isChecked) =>
                                      Message.ToggledPayment({ paymentId: payment.id, isChecked }),
                                  },
                                  h,
                                ),
                              ],
                            },
                            h,
                          ),
                          Table.cell(
                            { variant: 'card', children: [h.span([h.Class('font-medium')], [payment.item])] },
                            h,
                          ),
                          Table.cell(
                            {
                              variant: 'card',
                              children: [
                                Badge.view(
                                  {
                                    intent: PAYMENT_STATUS[payment.status].intent,
                                    children: [PAYMENT_STATUS[payment.status].label],
                                  },
                                  h,
                                ),
                              ],
                            },
                            h,
                          ),
                          Table.cell({ variant: 'card', children: [payment.group] }, h),
                          Table.cell(
                            {
                              variant: 'card',
                              children: [h.div([h.Class('text-right tabular-nums')], [usd.format(payment.amount)])],
                            },
                            h,
                          ),
                        ],
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
  );
};

const sortOf = (memberSort: MemberSort, key: SortKey): Table.TableSort =>
  memberSort.key === key ? memberSort.direction : 'none';

const sortedMembers = (memberSort: MemberSort): ReadonlyArray<Member> => {
  const order = MEMBER_ORDER[memberSort.key];
  return Array.sort(MEMBERS, memberSort.direction === 'asc' ? order : Order.flip(order));
};

const sortable = (model: Model, h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      className: 'w-full max-w-2xl',
      children: [
        Table.view(
          {
            variant: 'card',
            children: [
              Table.header(
                {
                  variant: 'card',
                  children: [
                    Table.row(
                      {
                        variant: 'card',
                        section: 'head',
                        children: [
                          Table.head(
                            {
                              variant: 'card',
                              sort: sortOf(model.memberSort, 'name'),
                              onSort: Message.ClickedSortColumn({ key: 'name' }),
                              children: ['Member'],
                            },
                            h,
                          ),
                          Table.head({ variant: 'card', children: ['Role'] }, h),
                          Table.head(
                            {
                              variant: 'card',
                              className: 'text-right',
                              sort: sortOf(model.memberSort, 'tasks'),
                              onSort: Message.ClickedSortColumn({ key: 'tasks' }),
                              children: ['Open tasks'],
                            },
                            h,
                          ),
                          Table.head(
                            {
                              variant: 'card',
                              className: 'text-right',
                              sort: sortOf(model.memberSort, 'joined'),
                              onSort: Message.ClickedSortColumn({ key: 'joined' }),
                              children: ['Joined'],
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
              Table.body(
                {
                  variant: 'card',
                  children: Array.map(sortedMembers(model.memberSort), (member) =>
                    Table.row(
                      {
                        variant: 'card',
                        attributes: [h.Key(member.id)],
                        children: [
                          Table.cell({ variant: 'card', className: 'font-medium', children: [member.name] }, h),
                          Table.cell({ variant: 'card', children: [Badge.view({ children: [member.role] }, h)] }, h),
                          Table.cell(
                            { variant: 'card', className: 'text-right tabular-nums', children: [String(member.tasks)] },
                            h,
                          ),
                          Table.cell(
                            {
                              variant: 'card',
                              className: 'text-right text-muted-foreground tabular-nums',
                              children: [formatJoined(member.joined)],
                            },
                            h,
                          ),
                        ],
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
  );

const projectRows = (model: Model, project: Project, h: HtmlBuilder<Message>): ReadonlyArray<Html> => {
  const isOpen = !Array.contains(model.closedProjectIds, project.id);
  return [
    Table.groupRow(
      {
        variant: 'card',
        colSpan: GROUP_COLUMNS,
        count: project.tasks.length,
        isOpen,
        onToggle: Message.ToggledProjectGroup({ projectId: project.id }),
        attributes: [h.Key(`project-${project.id}`)],
        children: [icon('folder', { className: 'size-icon-sm shrink-0 text-muted-foreground' }), project.name],
      },
      h,
    ),
    ...(isOpen
      ? Array.map(project.tasks, (task) =>
          Table.row(
            {
              variant: 'card',
              attributes: [h.Key(`task-${task.id}`)],
              children: [
                Table.cell({ variant: 'card', className: 'font-medium', children: [task.title] }, h),
                Table.cell({ variant: 'card', children: [task.assignee] }, h),
                Table.cell(
                  {
                    variant: 'card',
                    children: [Badge.view({ intent: task.status.intent, children: [task.status.label] }, h)],
                  },
                  h,
                ),
              ],
            },
            h,
          ),
        )
      : []),
  ];
};

const groupedRows = (model: Model, h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      className: 'w-full max-w-2xl',
      children: [
        Table.view(
          {
            variant: 'card',
            children: [
              Table.header(
                {
                  variant: 'card',
                  children: [
                    Table.row(
                      {
                        variant: 'card',
                        section: 'head',
                        children: [
                          Table.head({ variant: 'card', children: ['Task'] }, h),
                          Table.head({ variant: 'card', children: ['Assignee'] }, h),
                          Table.head({ variant: 'card', children: ['Status'] }, h),
                        ],
                      },
                      h,
                    ),
                  ],
                },
                h,
              ),
              Table.body(
                { variant: 'card', children: Array.flatMap(PROJECTS, (project) => projectRows(model, project, h)) },
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

const PROJECT_ACTIONS = ['Rename…', 'Archive', 'Delete…'] as const;
type ProjectAction = (typeof PROJECT_ACTIONS)[number];

const projectMenu = (model: Model, project: LinkedProject, h: HtmlBuilder<Message>): Html =>
  ProjectMenu.view(
    {
      model: model.projectMenus[project.id],
      toParentMessage: (message) => toProjectMenuMessage(project.id, message),
      trigger: {
        emphasis: 'ghost',
        size: 'icon-sm',
        ariaLabel: `Actions for ${project.name}`,
        children: [icon('dots')],
      },
      align: 'end',
      items: PROJECT_ACTIONS,
      itemGroupKey: (action) => (action === 'Delete…' ? 'Danger' : 'Actions'),
      itemToConfig: (action) => ({
        intent: action === 'Delete…' ? 'destructive' : 'neutral',
        children: [action],
      }),
    },
    h,
  );

const rowLinks = (model: Model, h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      className: 'w-full max-w-2xl',
      children: [
        Table.view(
          {
            variant: 'card',
            children: [
              Table.header(
                {
                  variant: 'card',
                  children: [
                    Table.row(
                      {
                        variant: 'card',
                        section: 'head',
                        children: [
                          Table.head({ variant: 'card', children: ['Project'] }, h),
                          Table.head({ variant: 'card', children: ['Lead'] }, h),
                          Table.head({ variant: 'card', children: ['Status'] }, h),
                          Table.head(
                            {
                              variant: 'card',
                              className: 'w-px',
                              children: [h.span([h.Class('sr-only')], ['Actions'])],
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
              Table.body(
                {
                  variant: 'card',
                  children: Array.map(LINKED_PROJECTS, (project) =>
                    Table.row(
                      {
                        variant: 'card',
                        attributes: [h.Key(project.id)],
                        children: [
                          Table.cell(
                            {
                              variant: 'card',
                              className: 'font-medium',
                              children: [
                                Table.rowLink({ href: `#project-${project.id}`, children: [project.name] }, h),
                              ],
                            },
                            h,
                          ),
                          Table.cell({ variant: 'card', children: [project.lead] }, h),
                          Table.cell(
                            {
                              variant: 'card',
                              children: [
                                Badge.view({ intent: project.status.intent, children: [project.status.label] }, h),
                              ],
                            },
                            h,
                          ),
                          Table.cell(
                            {
                              variant: 'card',
                              className: 'py-1',
                              children: [projectMenu(model, project, h)],
                            },
                            h,
                          ),
                        ],
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
  );

const invoiceRow = (invoice: Invoice, row: Table.VirtualRow<Message>, h: HtmlBuilder<Message>): Html => {
  const status = statusOf(INVOICE_STATUSES, invoice.statusIndex);
  return Table.row(
    {
      variant: 'card',
      attributes: row.attributes,
      children: [
        Table.cell({ variant: 'card', className: 'font-medium tabular-nums', children: [invoice.invoice] }, h),
        Table.cell({ variant: 'card', className: 'truncate', children: [invoice.project] }, h),
        Table.cell(
          { variant: 'card', children: [Badge.view({ intent: status.intent, children: [status.label] }, h)] },
          h,
        ),
        Table.cell(
          { variant: 'card', className: 'text-right tabular-nums', children: [usd.format(invoice.amount)] },
          h,
        ),
      ],
    },
    h,
  );
};

const virtualizedExample = (model: Model, h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      className: 'w-full max-w-2xl',
      children: [
        Card.header(
          {
            children: [
              Card.title(
                { children: [`${model.invoices.length} of ${INVOICE_TOTAL.toLocaleString('en-US')} invoices`] },
                h,
              ),
            ],
          },
          h,
        ),
        Table.virtualized(
          {
            model: model.invoiceTable,
            toParentMessage: toInvoiceTableMessage,
            variant: 'card',
            className: 'h-96',
            ariaLabel: 'Invoices',
            ariaRowCount: INVOICE_TOTAL + 1,
            items: model.invoices,
            itemKey: (invoice) => invoice.id,
            itemToRow: (invoice, row) => invoiceRow(invoice, row, h),
            rowHeightPx: INVOICE_ROW_HEIGHT,
            columnCount: 4,
            hasMore: hasMoreInvoices(model),
            isLoadingMore: model.isLoadingInvoices,
            header: Table.header(
              {
                variant: 'card',
                isVirtualized: true,
                children: [
                  Table.row(
                    {
                      variant: 'card',
                      section: 'head',
                      ariaRowIndex: 1,
                      children: [
                        Table.head(
                          { variant: 'card', isVirtualized: true, className: 'w-32', children: ['Invoice'] },
                          h,
                        ),
                        Table.head({ variant: 'card', isVirtualized: true, children: ['Project'] }, h),
                        Table.head(
                          { variant: 'card', isVirtualized: true, className: 'w-32', children: ['Status'] },
                          h,
                        ),
                        Table.head(
                          { variant: 'card', isVirtualized: true, className: 'w-28 text-right', children: ['Amount'] },
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
        ),
      ],
    },
    h,
  );

const directoryRow = (member: DirectoryMember, row: Table.VirtualRow<Message>, h: HtmlBuilder<Message>): Html => {
  const role = statusOf(ROLES, member.roleIndex);
  return Table.row(
    {
      variant: 'card',
      attributes: row.attributes,
      children: [
        Table.cell(
          {
            variant: 'card',
            children: [
              h.div(
                [h.Class('flex min-w-0 flex-col gap-tight')],
                [
                  h.span([h.Class('truncate font-medium')], [member.name]),
                  h.span([h.Class('truncate text-muted-foreground')], [member.email]),
                ],
              ),
            ],
          },
          h,
        ),
        Table.cell({ variant: 'card', children: [Badge.view({ intent: role.intent, children: [role.label] }, h)] }, h),
      ],
    },
    h,
  );
};

const scrollElementExample = (model: Model, h: HtmlBuilder<Message>): Html =>
  h.div(
    [
      ...Table.scrollElementAttributes(model.directoryTable, toDirectoryTableMessage, h),
      h.Class('h-[28rem] w-full max-w-2xl overflow-y-auto rounded-card border border-border bg-background'),
    ],
    [
      h.div(
        [h.Class('flex flex-col gap-group p-group pt-0')],
        [
          h.div(
            [h.Class('flex flex-col gap-tight pt-group')],
            [
              h.h2([h.Class('text-heading')], ['Members']),
              h.p(
                [h.Class('text-body text-muted-foreground')],
                [`${DIRECTORY.length} people in Acme. The list scrolls with the page.`],
              ),
            ],
          ),
          Card.view(
            {
              children: [
                Table.virtualized(
                  {
                    model: model.directoryTable,
                    toParentMessage: toDirectoryTableMessage,
                    variant: 'card',
                    hasScrollElement: true,
                    ariaLabel: 'Members',
                    items: DIRECTORY,
                    itemKey: (member) => member.id,
                    itemToRow: (member, row) => directoryRow(member, row, h),
                    rowHeightPx: MEMBER_ROW_HEIGHT,
                    columnCount: 2,
                    header: Table.header(
                      {
                        variant: 'card',
                        isVirtualized: true,
                        children: [
                          Table.row(
                            {
                              variant: 'card',
                              section: 'head',
                              ariaRowIndex: 1,
                              children: [
                                Table.head({ variant: 'card', isVirtualized: true, children: ['Member'] }, h),
                                Table.head(
                                  { variant: 'card', isVirtualized: true, className: 'w-28', children: ['Role'] },
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
                ),
              ],
            },
            h,
          ),
        ],
      ),
    ],
  );

const emptyExample = (h: HtmlBuilder<Message>): Html =>
  Card.view(
    {
      className: 'w-full max-w-2xl',
      children: [
        Table.view(
          {
            variant: 'card',
            children: [
              Table.header({ variant: 'card', children: [paymentHeaderRow('card', h)] }, h),
              Table.body(
                {
                  variant: 'card',
                  children: [
                    Table.row(
                      {
                        variant: 'card',
                        children: [
                          Table.cell(
                            {
                              variant: 'card',
                              colSpan: 4,
                              children: [
                                Empty.view(
                                  {
                                    size: 'sm',
                                    children: [
                                      Empty.media({}, h),
                                      Empty.title({ children: ['No invoices'] }, h),
                                      Empty.description({ children: ['Invoices show up here once you send one.'] }, h),
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

export const view = Submodel.defineView<Model, Message>((model, h): Html =>
  page(
    {
      title,
      description: 'Rows of records with shared columns.',
      sections: [
        exampleSection(
          {
            title: 'Default',
            description: 'A plain table, rows separated by hairlines.',
            children: [paymentTable('default', [], h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'In a card',
            description: [
              code("variant: 'card'", h),
              ' straight in an Card, in place of CardContent: header and footer rows sit on the shell, the body is the card.',
            ],
            isBare: true,
            children: [inACard(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'With header',
            description: 'CardHeader above the table; no footer, so the shell shows as a 4px rim below the body.',
            isBare: true,
            children: [withHeader(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Flush',
            description: [
              code("variant: 'flush'", h),
              ' inside CardContent with overflow-hidden: the header row sits in the card; first and last column on the card title’s edge.',
            ],
            isBare: true,
            children: [flush(h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'With selection',
            description: ['Selected ids live in the Model; a selected row is ', code('isSelected', h), '.'],
            isBare: true,
            children: [withSelection(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Sortable columns',
            description: [
              code('Table.head({ sort, onSort })', h),
              ': a button in the header, ',
              code('aria-sort', h),
              ' on the cell. The call site sorts.',
            ],
            isBare: true,
            children: [sortable(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Grouped rows',
            description: [
              code('Table.groupRow({ colSpan })', h),
              ' names the rows after it; ',
              code('isOpen', h),
              ' + ',
              code('onToggle', h),
              ' fold them.',
            ],
            isBare: true,
            children: [groupedRows(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Row links',
            description: [
              code('Table.rowLink', h),
              ' in one cell: its click area covers the row; the row’s other controls sit above it.',
            ],
            isBare: true,
            children: [rowLinks(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Virtualized',
            description: [
              code('Table.virtualized({ items, itemKey, header })', h),
              ': 1,000 rows in pages of 100 (',
              code('hasMore', h),
              ' + ',
              code('Table.isNearEnd', h),
              '), only those in view render. Give it a height.',
            ],
            isBare: true,
            children: [virtualizedExample(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Scrolls with the page',
            description: [
              code('hasScrollElement', h),
              ' + ',
              code('Table.scrollElementAttributes', h),
              ': the rows scroll with the element around the table; the header sticks to its top.',
            ],
            isBare: true,
            children: [scrollElementExample(model, h)],
          },
          h,
        ),
        exampleSection(
          {
            title: 'Empty',
            description: 'One cell over every column holds an Empty.',
            isBare: true,
            children: [emptyExample(h)],
          },
          h,
        ),
      ],
    },
    h,
  ),
);
