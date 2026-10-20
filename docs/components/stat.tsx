import { StatDefault } from '../examples/stat/default';
import { StatInCard } from '../examples/stat/in-card';
import { StatWithStatusDot } from '../examples/stat/with-status-dot';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Stat',
  description: 'A big number and what it counts.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Stat'
      description='A big number and what it counts: the value in the title role with tabular figures, the label in caption. Children in reading order, the label above or below.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>Stat</Code> › <Code>StatLabel</Code> + <Code>StatValue</Code>
          </>
        }>
        <StatDefault />
      </ExampleSection>
      <ExampleSection title='With status dot' description='The dot ties the number to a series.'>
        <StatWithStatusDot />
      </ExampleSection>
      <ExampleSection title='In card' bare>
        <StatInCard />
      </ExampleSection>
    </FoundationPage>
  ),
});
