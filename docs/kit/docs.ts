import { createContext, use, type ComponentType, type ReactNode } from 'react';

import { DEFAULT_TOKEN_GLOBALS } from './tokens';

export type DocsGroup = 'Foundations' | 'Components' | 'Patterns';

/** How the Playground draws a prop's control: `select` (with `options`) or `boolean`; others follow the arg's type. */
export interface ArgType {
  readonly name?: string;
  readonly control?: string | { readonly type?: string };
  readonly options?: ReadonlyArray<string>;
  /** `table: { disable: true }` leaves the prop out of the Playground. */
  readonly table?: { readonly disable?: boolean };
}

/** A live component with a control per prop. */
export interface Playground<Props> {
  readonly component: ComponentType<Props>;
  /** The starting props; the Playground shows its code. */
  readonly args?: Partial<Props>;
  readonly argTypes?: Readonly<Record<string, ArgType>>;
  /** Draws something other than `<component {...args} />`. */
  readonly render?: (args: Props) => ReactNode;
}

/** What a docs module (`docs/{foundations,components,patterns}/<slug>.tsx`) default-exports. */
export interface DocsModule {
  readonly title: string;
  /** One short sentence. */
  readonly description: string;
  readonly group: DocsGroup;
  /** The page: its header, then the examples (`ExampleSection`) and, in the spec, the `FoundationSection`s. */
  readonly Page: ComponentType;
  readonly playground?: Playground<any>; // Any component: the site renders any Playground.
  /** Runs while the page is shown, e.g. to stub an API; returns its cleanup. */
  readonly setup?: () => void | (() => void);
}

export const defineDocs = <Props = never>(
  docs: Omit<DocsModule, 'playground'> & {
    readonly playground?: Omit<Playground<Props>, 'args'> & { readonly args?: NoInfer<Partial<Props>> };
  },
): DocsModule => docs as DocsModule;

/** The tuned token scales (`tokens.ts`) a foundation page prints; the docs site provides them. */
export const TokensContext = createContext<Readonly<Record<string, number>>>(DEFAULT_TOKEN_GLOBALS);

export const useTokens = () => use(TokensContext);
