import { PhoneAppClear } from '../examples/patterns/phone-app/clear';
import { PhoneAppFriendly } from '../examples/patterns/phone-app/friendly';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Phone App',
  description: 'One phone screen in two sizing styles: the screen sets no size, the style decides the look.',
  group: 'Patterns',
  Page: () => (
    <FoundationPage
      title='Phone App'
      description='One screen, built only from components and roles, in two sizing styles. Neither touches a color: shapes, sizes, weights and the display face come from the style and --font-display alone. The lead card is Card size lg; the bottom nav floats as a pill with labels.'>
      <ExampleSection
        title='Clear'
        description={
          <>
            <Code>SIZING_STYLES.clear</Code>: 40px pill controls, 16px cards and sheets, titles 30 / 650, 15px body and
            control text. The sans everywhere.
          </>
        }
        bare>
        <PhoneAppClear />
      </ExampleSection>
      <ExampleSection
        title='Friendly'
        description={
          <>
            <Code>SIZING_STYLES.friendly</Code> plus <Code>--font-display</Code>: 22px cards, the lead card at 24px
            through <Code>radius-card-lg</Code>, titles 32 / 720 and headings 19 / 700 in Bricolage Grotesque.
          </>
        }
        bare>
        <PhoneAppFriendly />
      </ExampleSection>
    </FoundationPage>
  ),
});
