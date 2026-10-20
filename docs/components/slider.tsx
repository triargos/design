import { SliderDefault } from '../examples/slider/default';
import { SliderDisabled } from '../examples/slider/disabled';
import { SliderRange } from '../examples/slider/range';
import { SliderWithLabelAndValue } from '../examples/slider/with-label-and-value';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Slider',
  description: 'A value on a continuous range.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Slider'
      description='A value on a continuous range, where the feel matters more than the exact number: zoom, volume. Name it with aria-label or a FieldLabel id; each thumb takes the name.'>
      <ExampleSection title='Default'>
        <SliderDefault />
      </ExampleSection>
      <ExampleSection
        title='Range'
        description={
          <>
            <Code>defaultValue={'{[20, 70]}'}</Code>
          </>
        }>
        <SliderRange />
      </ExampleSection>
      <ExampleSection title='With label and value' description='The field shows the controlled value beside the label.'>
        <SliderWithLabelAndValue />
      </ExampleSection>
      <ExampleSection title='Disabled' description='Dims the whole control: the one place opacity stays.'>
        <SliderDisabled />
      </ExampleSection>
    </FoundationPage>
  ),
});
