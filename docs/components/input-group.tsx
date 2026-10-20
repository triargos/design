import { InputGroupBlockAddon } from '../examples/input-group/block-addon';
import { InputGroupPending } from '../examples/input-group/pending';
import { InputGroupSideBySide } from '../examples/input-group/side-by-side';
import { InputGroupWithButton } from '../examples/input-group/with-button';
import { InputGroupWithIcon } from '../examples/input-group/with-icon';
import { InputGroupWithShortcut } from '../examples/input-group/with-shortcut';
import { InputGroupWithText } from '../examples/input-group/with-text';
import { InputGroupWithTextarea } from '../examples/input-group/with-textarea';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Input Group',
  description: 'A field with text, icons, keys or buttons inside it.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Input Group'
      description='A field with text, icons, keys or buttons inside it. The group owns the surface, focus and invalid; addons sit on the field’s 14px padding line.'>
      <ExampleSection title='With icon'>
        <InputGroupWithIcon />
      </ExampleSection>
      <ExampleSection
        title='With text'
        description={
          <>
            <Code>InputGroupText</Code>: a prefix or a unit.
          </>
        }>
        <InputGroupWithText />
      </ExampleSection>
      <ExampleSection
        title='With button'
        description={
          <>
            An icon for a field-local toggle, text for a field-local action, <Code>size='action'</Code> for a field that
            submits on its own.
          </>
        }>
        <InputGroupWithButton />
      </ExampleSection>
      <ExampleSection
        title='Side by side'
        description='Not a group: a field and a button, one related gap apart. For an action that is not about the field alone.'>
        <InputGroupSideBySide />
      </ExampleSection>
      <ExampleSection
        title='Block addon'
        description={
          <>
            <Code>align='block-end'</Code>: a toolbar under the text.
          </>
        }>
        <InputGroupBlockAddon />
      </ExampleSection>
      <ExampleSection title='With shortcut' description='A Kbd in the end addon.'>
        <InputGroupWithShortcut />
      </ExampleSection>
      <ExampleSection title='Pending' description='A Loader in the end addon while results load.'>
        <InputGroupPending />
      </ExampleSection>
      <ExampleSection
        title='With textarea'
        description={
          <>
            <Code>InputGroupTextarea</Code>, with a count below.
          </>
        }>
        <InputGroupWithTextarea />
      </ExampleSection>
    </FoundationPage>
  ),
});
