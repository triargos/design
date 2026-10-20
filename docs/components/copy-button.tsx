import { KeyRoundIcon } from 'lucide-react';
import { type ReactNode, useEffect, useRef } from 'react';

import { CopyButton } from '~/components/ui/copy-button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Item, ItemActions, ItemContent, ItemDescription, ItemList, ItemMedia, ItemTitle } from '~/components/ui/item';

import { CopyButtonDefault } from '../examples/copy-button/default';
import { CopyButtonInAField } from '../examples/copy-button/in-a-field';
import { CopyButtonNextToAValue } from '../examples/copy-button/next-to-a-value';
import { CopyButtonWithText } from '../examples/copy-button/with-text';
import { CopyButtonWithToast } from '../examples/copy-button/with-toast';
import { Code, ExampleSection, FoundationPage, FoundationSection, Matrix } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

const INVITE_LINK = 'https://acme.example/invite/k3f9';
const SIZES = ['icon-xs', 'icon-sm', 'icon'] as const;

/** Keeps its button in the copied state: clicks it now and again before the 2s reset. */
function Copied({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const click = () => ref.current?.querySelector('button')?.click();
    click();
    const interval = window.setInterval(click, 1500);
    return () => window.clearInterval(interval);
  }, []);
  return (
    <span ref={ref} className='contents'>
      {children}
    </span>
  );
}

export default defineDocs({
  title: 'Copy Button',
  description: 'Copies a value to the clipboard; the icon springs into a check.',
  group: 'Components',
  setup: () => {
    const clipboard = navigator.clipboard;
    const writeText = (text: string) => clipboard.writeText(text).catch(() => undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    return () => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: clipboard });
  },
  playground: {
    component: CopyButton,
    args: { value: 'https://acme.example/invite/k3f9' },
  },
  Page: () => (
    <FoundationPage
      title='Copy Button'
      description='Copies a value to the clipboard; the icon springs into a check that draws itself, then springs back after two seconds. Reduced motion cross-fades. Icon-only and ghost by default, so it sits quietly next to what it copies. label names the icon-only button (default “Copy”); copiedLabel is announced after a copy (default “Copied”).'>
      <ExampleSection
        title='Default'
        description='Icon-only and ghost, so it sits quietly next to what it copies. Click it to see the check.'>
        <CopyButtonDefault />
      </ExampleSection>
      <ExampleSection
        title='With text'
        description={
          <>
            <Code>children: (copied) =&gt; …</Code>
          </>
        }>
        <CopyButtonWithText />
      </ExampleSection>
      <ExampleSection
        title='In a field'
        description={
          <>
            <Code>inputGroupButtonVariants</Code> sizes it as a field action.
          </>
        }>
        <CopyButtonInAField />
      </ExampleSection>
      <ExampleSection
        title='Next to a value'
        description={
          <>
            <Code>size='icon-xs'</Code>
          </>
        }>
        <CopyButtonNextToAValue />
      </ExampleSection>
      <ExampleSection
        title='With toast'
        description={
          <>
            <Code>onCopied</Code>, for a copy whose result is not next to the button.
          </>
        }>
        <CopyButtonWithToast />
      </ExampleSection>

      <FoundationSection
        title='Size × emphasis'
        description='Any Button size and emphasis. The copied column is the real button, kept copied.'>
        <Matrix
          columns={['ghost', 'raised', 'copied']}
          rows={SIZES.map((size) => ({
            name: size,
            cells: [
              <CopyButton key='g' value={INVITE_LINK} size={size} />,
              <CopyButton key='r' value={INVITE_LINK} size={size} emphasis='raised' />,
              <Copied key='c'>
                <CopyButton value={INVITE_LINK} size={size} />
              </Copied>,
            ],
          }))}
        />
      </FoundationSection>

      <FoundationSection title='Usages'>
        <Card>
          <CardHeader>
            <CardTitle>In a row</CardTitle>
          </CardHeader>
          <CardContent className='overflow-hidden'>
            <ItemList>
              <Item>
                <ItemMedia variant='icon'>
                  <KeyRoundIcon />
                </ItemMedia>
                <ItemContent>
                  <ItemTitle>API key</ItemTitle>
                  <ItemDescription className='font-mono'>sk_live_4f9a…c21e</ItemDescription>
                </ItemContent>
                <ItemActions>
                  <CopyButton value='sk_live_4f9a2b7dc21e' label='Copy API key' />
                </ItemActions>
              </Item>
            </ItemList>
          </CardContent>
        </Card>
      </FoundationSection>
    </FoundationPage>
  ),
});
