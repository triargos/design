import { IconStar } from '@tabler/icons-react';

import { Toggle } from '~/components/ui/toggle';

import { ToggleDefault } from '../examples/toggle/default';
import { ToggleDisabled } from '../examples/toggle/disabled';
import { ToggleInAHeader } from '../examples/toggle/in-a-header';
import { ToggleSizes } from '../examples/toggle/sizes';
import { ToggleToolbar } from '../examples/toggle/toolbar';
import { Code, ExampleSection, FoundationPage, FoundationSection, Matrix, StateCell } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

const STATES = ['rest', 'hover', 'press', 'focus', 'disabled'] as const;
const ROWS = [
  { name: 'off', pressed: false },
  { name: 'pressed', pressed: true },
] as const;

export default defineDocs({
  title: 'Toggle',
  description: 'A button that stays pressed: a filter, a mark, a flag.',
  group: 'Components',
  playground: {
    component: Toggle,
    args: { children: 'Archived' },
    argTypes: {
      size: { control: 'select', options: ['xs', 'default', 'lg'] },
      disabled: { control: 'boolean' },
    },
  },
  Page: () => (
    <FoundationPage
      title='Toggle'
      description='A button that stays pressed: a filter, a mark, a flag. A neutral ghost at rest, a quiet fill while pressed. An action is a Button; a setting that applies at once is a Switch.'>
      <ExampleSection
        title='Default'
        description={
          <>
            <Code>pressed</Code> + <Code>onPressedChange</Code>, or <Code>defaultPressed</Code>.
          </>
        }>
        <ToggleDefault />
      </ExampleSection>
      <ExampleSection
        title='Sizes'
        description={
          <>
            As <Code>Button</Code>: <Code>xs 32 · default 36 · lg 40</Code>, and <Code>icon-*</Code>.
          </>
        }>
        <ToggleSizes />
      </ExampleSection>
      <ExampleSection
        title='Toolbar'
        description={
          <>
            Icon only, each with an <Code>aria-label</Code>; at rest it takes the toolbar's text color.
          </>
        }>
        <ToggleToolbar />
      </ExampleSection>
      <ExampleSection title='In a header' description='A filter beside the search.'>
        <ToggleInAHeader />
      </ExampleSection>
      <ExampleSection title='Disabled'>
        <ToggleDisabled />
      </ExampleSection>

      <FoundationSection
        title='Value × state'
        description='Forced here. Hover takes the quiet fill; pressed goes one step deeper; a press scales to 96%.'>
        <Matrix
          columnWidth='6rem'
          columns={STATES}
          rows={ROWS.map((row) => ({
            name: row.name,
            cells: STATES.map((state) => (
              <StateCell key={state} state={state}>
                <Toggle size='icon' aria-label='Starred' pressed={row.pressed} disabled={state === 'disabled'}>
                  <IconStar />
                </Toggle>
              </StateCell>
            )),
          }))}
        />
      </FoundationSection>
    </FoundationPage>
  ),
});
