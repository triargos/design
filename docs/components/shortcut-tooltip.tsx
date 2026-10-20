import { ShortcutTooltipDefault } from '../examples/shortcut-tooltip/default';
import { ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Shortcut Tooltip',
  description: 'Names a control and its keyboard shortcut.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Shortcut Tooltip'
      description='A Tooltip that names a control and its shortcut. A chord reads “G then P” (chordSeparator); a combination uses the platform’s modifier.'>
      <ExampleSection title='Default' description='Hover the button.'>
        <ShortcutTooltipDefault />
      </ExampleSection>
    </FoundationPage>
  ),
});
