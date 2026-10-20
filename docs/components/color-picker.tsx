import { ColorPickerCustom } from '../examples/color-picker/custom';
import { ColorPickerDefault } from '../examples/color-picker/default';
import { ColorPickerInAField } from '../examples/color-picker/in-a-field';
import { ColorPickerInline } from '../examples/color-picker/inline';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Color Picker',
  description: 'A user-chosen data color: twelve presets and a custom color.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Color Picker'
      description='A user-chosen data color, such as a project or label color: twelve presets that read as a dot and as an icon stroke, and a custom color. Data colors, not theme tokens; the UI around them stays on the intents.'>
      <ExampleSection title='Default' description='A preset.'>
        <ColorPickerDefault />
      </ExampleSection>
      <ExampleSection title='Custom' description='Any other hex shows as the custom swatch.'>
        <ColorPickerCustom />
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
