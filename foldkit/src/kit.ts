import { Predicate } from 'effect';
import type { Html, HtmlBuilder } from 'foldkit/html';

import * as Card from './pavo/card.ts';
import { cn } from './pavo/cn.ts';
import type { Child } from './pavo/part.ts';

export type PageConfig = Readonly<{
  title: string;
  description: string;
  sections: ReadonlyArray<Html>;
}>;

export const page = <Message>({ title, description, sections }: PageConfig, h: HtmlBuilder<Message>): Html =>
  h.div(
    [h.Class('mx-auto flex w-full max-w-3xl flex-col gap-page')],
    [
      h.header(
        [h.Class('flex flex-col gap-tight')],
        [
          h.h1([h.Class('text-heading')], [title]),
          h.p([h.Class('max-w-prose text-body text-pretty text-muted-foreground')], [description]),
        ],
      ),
      h.div([h.AriaHidden(true), h.Class('h-px shrink-0 bg-border')]),
      h.div([h.Class('flex flex-col gap-section')], sections),
    ],
  );

export type SectionConfig = Readonly<{
  title: string;
  description?: ReadonlyArray<Child> | string;
  className?: string;
  isBare?: boolean;
  children: ReadonlyArray<Child>;
}>;

const sectionHeader = <Message>(
  title: string,
  description: SectionConfig['description'],
  h: HtmlBuilder<Message>,
): Html =>
  h.div(
    [h.Class('flex flex-col gap-tight')],
    [
      h.h2([h.Class('text-body font-medium')], [title]),
      ...(description === undefined
        ? []
        : [
            h.p(
              [h.Class('max-w-prose text-body text-pretty text-muted-foreground')],
              Predicate.isString(description) ? [description] : description,
            ),
          ]),
    ],
  );

export const exampleSection = <Message>(
  { title, description, className, isBare = false, children }: SectionConfig,
  h: HtmlBuilder<Message>,
): Html =>
  h.section(
    [h.DataAttribute('slot', 'example-section'), h.Class('flex flex-col gap-group')],
    [
      sectionHeader(title, description, h),
      h.div(
        [
          h.DataAttribute('slot', 'preview'),
          h.Class(
            'min-w-0 overflow-hidden rounded-card border border-border [--outer-inset:calc(--spacing(1)+1px)] [--outer-radius:var(--radius-card)]',
          ),
        ],
        [
          h.div(
            [
              h.Class(
                cn(
                  'flex min-h-36 flex-wrap items-center gap-related p-card md:p-page',
                  isBare ? 'block *:mx-auto' : 'justify-center',
                  className,
                ),
              ),
            ],
            children,
          ),
        ],
      ),
    ],
  );

export const foundationSection = <Message>(
  { title, description, children }: SectionConfig,
  h: HtmlBuilder<Message>,
): Html =>
  h.section(
    [h.DataAttribute('slot', 'foundation-section'), h.Class('flex flex-col gap-group')],
    [sectionHeader(title, description, h), ...children],
  );

export const code = <Message>(text: string, h: HtmlBuilder<Message>): Html =>
  h.code([h.Class('font-mono text-caption text-muted-foreground')], [text]);

export const row = <Message>(children: ReadonlyArray<Child>, h: HtmlBuilder<Message>, className?: string): Html =>
  h.div([h.Class(cn('flex flex-wrap items-center gap-2', className))], children);

export type MatrixRow = Readonly<{ name: string; meta?: Html; cells: ReadonlyArray<Html> }>;

export const matrix = <Message>(
  columns: ReadonlyArray<string>,
  rows: ReadonlyArray<MatrixRow>,
  h: HtmlBuilder<Message>,
): Html =>
  Card.view(
    {
      children: [
        Card.content(
          {
            className: 'overflow-x-auto',
            children: [
              h.div(
                [
                  h.Class('grid min-w-fit items-center gap-x-related'),
                  h.Style({ 'grid-template-columns': `8rem repeat(${columns.length}, minmax(7.5rem, 1fr))` }),
                ],
                [
                  h.span([], []),
                  ...columns.map((column) =>
                    h.span(
                      [h.Class('px-1 pt-group pb-related font-mono text-caption text-muted-foreground')],
                      [column],
                    ),
                  ),
                  ...rows.flatMap((matrixRow) => [
                    h.div(
                      [h.Class('flex flex-col border-t border-border-subtle py-related pl-group')],
                      [
                        h.span([h.Class('text-body font-medium')], [matrixRow.name]),
                        ...(matrixRow.meta === undefined
                          ? []
                          : [h.span([h.Class('text-caption text-muted-foreground')], [matrixRow.meta])]),
                      ],
                    ),
                    ...matrixRow.cells.map((cell) =>
                      h.div(
                        [
                          h.Class(
                            'flex min-w-0 items-center border-t border-border-subtle px-1 py-related last:pr-group',
                          ),
                        ],
                        [cell],
                      ),
                    ),
                  ]),
                ],
              ),
            ],
          },
          h,
        ),
      ],
    },
    h,
  );

export type SpecimenRowConfig = Readonly<{ name: string; meta: string; child: Html }>;

export const specimenRow = <Message>({ name, meta, child }: SpecimenRowConfig, h: HtmlBuilder<Message>): Html =>
  h.div(
    [
      h.Class(
        'grid gap-related border-t border-border p-group first:border-t-0 md:grid-cols-[11rem_1fr] md:items-center md:gap-group',
      ),
    ],
    [
      h.div(
        [h.Class('flex flex-col')],
        [
          h.span([h.Class('text-body font-medium')], [name]),
          h.span([h.Class('text-caption text-muted-foreground')], [meta]),
        ],
      ),
      h.div([h.Class('min-w-0')], [child]),
    ],
  );
