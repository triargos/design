import { Predicate } from 'effect';
import type { Html, HtmlBuilder } from 'foldkit/html';

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
