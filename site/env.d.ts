declare module 'virtual:docs-index' {
  /** One docs page per story file (`storybook/{foundations,components,patterns}/*.stories.tsx`). */
  export interface DocsPage {
    readonly group: 'Foundations' | 'Components' | 'Patterns';
    readonly name: string;
    readonly slug: string;
    /** Story module path, relative to `site/`. */
    readonly module: string;
  }
  const pages: ReadonlyArray<DocsPage>;
  export default pages;
}
