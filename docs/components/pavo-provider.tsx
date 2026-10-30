import { PavoProviderDefault } from '../examples/pavo-provider/default';
import { PavoProviderRouterLinks } from '../examples/pavo-provider/router-links';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Pavo Provider',
  description: 'The locale, the router link, the tooltip delay group and the toast stack, once at the app’s root.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Pavo Provider'
      description='One PavoProvider at the app’s root; LocaleProvider, LinkProvider, TooltipProvider and ToastProvider also work alone.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>locale</Code> · <Code>timeZone</Code> · <Code>labels</Code> (Locale) · <Code>link</Code>
          </>
        }>
        <PavoProviderDefault />
      </ExampleSection>
      <ExampleSection
        title='Router links'
        description={
          <>
            <Code>BreadcrumbLink</Code>, <Code>TabsLink</Code>, <Code>TableRowLink</Code>,{' '}
            <Code>SidebarMenuSubButton</Code>, <Code>BottomNavLink</Code> and <Code>BottomNavMoreItem</Code> render the
            provider’s link for <Code>href</Code>
          </>
        }>
        <PavoProviderRouterLinks />
      </ExampleSection>
    </FoundationPage>
  ),
});
