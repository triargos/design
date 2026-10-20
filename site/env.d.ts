declare module 'virtual:docs-index' {
  /** One docs page per docs module (`docs/{foundations,components,patterns}/*.tsx`). */
  export interface DocsPage {
    readonly group: 'Foundations' | 'Components' | 'Patterns';
    readonly name: string;
    readonly slug: string;
    /** Docs module path, relative to `site/`. */
    readonly module: string;
  }
  const pages: ReadonlyArray<DocsPage>;
  export default pages;
}
