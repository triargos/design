import { ColorPickerCustom } from '../examples/color-picker/custom';
import { ColorPickerDefault } from '../examples/color-picker/default';
import { ColorPickerInAField } from '../examples/color-picker/in-a-field';
import { ColorPickerInline } from '../examples/color-picker/inline';
import { ColorPickerPresets } from '../examples/color-picker/presets';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Color Picker',
  description: 'A color chosen from swatches, or any color.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Color Picker'
      description='A color chosen from swatches, or any color: for data colors such as a project or label color, not theme tokens. The UI around them stays on the intents. Default swatches: twelve Tailwind 500s, which read as a dot and as an icon stroke.'>
      <ExampleSection title='Default' description='A preset.'>
        <ColorPickerDefault />
      </ExampleSection>
      <ExampleSection title='Custom' description='Any other hex shows as the custom swatch.'>
        <ColorPickerCustom />
      </ExampleSection>
      <ExampleSection
        title='Presets'
        description={
          <>
            <Code>presets</Code>: your own swatches; <Code>custom=&#123;false&#125;</Code> keeps the choice to them.
          </>
        }>
        <ColorPickerPresets />
      </ExampleSection>
      <ExampleSection
        title='Inline'
        description={
          <>
            <Code>custom='inline'</Code>: the custom picker in place, inside a popup.
          </>
        }>
        <ColorPickerInline />
      </ExampleSection>
      <ExampleSection
        title='In a field'
        description={
          <>
            <Code>FieldTitle</Code> + <Code>aria-labelledby</Code>
          </>
        }>
        <ColorPickerInAField />
      </ExampleSection>
    </FoundationPage>
  ),
});
