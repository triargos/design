import { BottomNavDefault } from '../examples/bottom-nav/default';
import { BottomNavLabels } from '../examples/bottom-nav/labels';
import { BottomNavWithSelection } from '../examples/bottom-nav/with-selection';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Bottom Nav',
  description:
    'The app navigation on a phone: a floating bar of icon tabs and the main action, on the inverted surface.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Bottom Nav'
      description='The app navigation on a phone: a floating bar of 3–5 icon tabs and the main action beside it, dark on a light page and light on a dark one. Hidden from md up, where the Sidebar takes over.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>BottomNavList</Code> holds a <Code>BottomNavLink current</Code> per page and{' '}
            <Code>BottomNavMore</Code>, which morphs the bar into a list of the rest, one <Code>BottomNavMoreItem</Code>{' '}
            per link. <Code>BottomNavAction</Code> is the main action. Labels are for screen readers; a count is a{' '}
            <Code>Badge</Code> in the tab. A tapped tab looks current at once (<Code>data-optimistic-current</Code>),
            before the router's next page sets <Code>aria-current</Code>. Open "More".
          </>
        }
        bare>
        <BottomNavDefault />
      </ExampleSection>
      <ExampleSection
        title='Labels'
        description={
          <>
            <Code>BottomNavList labels</Code>: the label under each icon (<Code>--bottom-nav-tab-width</Code> ×{' '}
            <Code>--bottom-nav-tab-height</Code>) and a fill that springs to the tab (
            <Code>duration-indicator ease-spring-bounce</Code>). Tabs shrink to fit four or five on a phone. The page
            keeps <Code>pb-36</Code>.
          </>
        }
        bare>
        <BottomNavLabels />
      </ExampleSection>
      <ExampleSection
        title='With selection'
        description={
          <>
            Under a <Code>BottomNavProvider</Code>, a page's open <Code>ActionBar</Code> docks in the nav: the bar
            squeezes, springs to the toolbar's size and its actions cascade in; clearing morphs it back. Select a task.
          </>
        }
        bare>
        <BottomNavWithSelection />
      </ExampleSection>
    </FoundationPage>
  ),
});
