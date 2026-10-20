import { ShortcutTooltipChord } from '../examples/shortcut-tooltip/chord';
import { ShortcutTooltipCombination } from '../examples/shortcut-tooltip/combination';
import { ShortcutTooltipDefault } from '../examples/shortcut-tooltip/default';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Shortcut Tooltip',
  description: 'A control’s name and its keyboard shortcut in a tooltip.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Shortcut Tooltip'
      description='A control’s name and its keyboard shortcut in a tooltip, the keys as Kbds. $mod prints ⌘ on a Mac and Ctrl elsewhere; the prerender prints Ctrl and a Mac switches after hydration. The keys are hidden from screen readers.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>label</Code> + <Code>shortcut</Code>, the control as the child
          </>
        }>
        <ShortcutTooltipDefault />
      </ExampleSection>
      <ExampleSection
        title='Combination'
        description={
          <>
            <Code>['$mod+Enter']</Code>: keys pressed together
          </>
        }>
        <ShortcutTooltipCombination />
      </ExampleSection>
      <ExampleSection
        title='Chord'
        description={
          <>
            <Code>['G', 'P']</Code>: one step after the other; <Code>labels.shortcutThen</Code> joins them
          </>
        }>
        <ShortcutTooltipChord />
      </ExampleSection>
    </FoundationPage>
  ),
});
