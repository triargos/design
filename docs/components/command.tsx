import { CommandDefault } from '../examples/command/default';
import { CommandGrouped } from '../examples/command/grouped';
import { CommandStandalone } from '../examples/command/standalone';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Command',
  description: 'A filterable list of commands; the palette.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Command'
      description='A filterable list of commands (cmdk): the palette in a dialog, or a list inline. For picking a value in a form, Search Select.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>CommandDialog title</Code>, opened from a button; an app also binds ⌘K.
          </>
        }>
        <CommandDefault />
      </ExampleSection>
      <ExampleSection
        title='Grouped'
        description={
          <>
            <Code>CommandGroup heading · CommandSeparator · CommandShortcut</Code>
          </>
        }>
        <CommandGrouped />
      </ExampleSection>
      <ExampleSection title='Standalone' description='Inline in a card: a filterable list without a popup.' bare>
        <CommandStandalone />
      </ExampleSection>
    </FoundationPage>
  ),
});
