import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, waitFor, within } from 'storybook/test';

import { SearchSelectCustomValue } from '../examples/search-select/custom-value';
import { SearchSelectDefault } from '../examples/search-select/default';
import { SearchSelectInADialog } from '../examples/search-select/in-a-dialog';
import { SearchSelectInAField } from '../examples/search-select/in-a-field';
import { SearchSelectManyOptions } from '../examples/search-select/many-options';
import { SearchSelectMultiple } from '../examples/search-select/multiple';
import { SearchSelectPlaceholder } from '../examples/search-select/placeholder';
import { SearchSelectStates } from '../examples/search-select/states';
import { SearchSelectWithDescription } from '../examples/search-select/with-description';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { open } from '../kit/play';

const meta = {
  title: 'Components/Search Select',
  parameters: { description: 'A select you can type into, for any list length; one value or many.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Search Select'
      description='A select you can type into, for any list length. Type to filter, Enter picks the first match. One value with a clear button, or many as chips; the list is always virtualized.'>
      <ExampleSection title='Default'>
        <SearchSelectDefault />
      </ExampleSection>
      <ExampleSection title='Placeholder'>
        <SearchSelectPlaceholder />
      </ExampleSection>
      <ExampleSection
        title='Multiple'
        description={
          <>
            <Code>multiple</Code>: chips in the field.
          </>
        }>
        <SearchSelectMultiple />
      </ExampleSection>
      <ExampleSection
        title='With description'
        description={
          <>
            An option's <Code>description</Code> shows muted beside its label.
          </>
        }>
        <SearchSelectWithDescription />
      </ExampleSection>
      <ExampleSection
        title='Custom value'
        description={
          <>
            <Code>allowCustom</Code>: the value is an option's value or the typed text. While the query names no option,
            the last row takes it; Enter picks it once nothing else matches.
          </>
        }>
        <SearchSelectCustomValue />
      </ExampleSection>
      <ExampleSection
        title='Many options'
        description='2,000 members, the same every time. The ManyOptions story is the perf check: its count control goes to 10,000.'>
        <SearchSelectManyOptions />
      </ExampleSection>
      <ExampleSection title='In a field' description='Field, label and error around it.'>
        <SearchSelectInAField />
      </ExampleSection>
      <ExampleSection title='In a dialog' description='The popup portals above the dialog and keeps focus in it.'>
        <SearchSelectInADialog />
      </ExampleSection>
      <ExampleSection
        title='States'
        description={
          <>
            Loading (<Code>emptyText</Code>), <Code>aria-invalid</Code>, <Code>disabled</Code>.
          </>
        }>
        <SearchSelectStates />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <SearchSelectDefault /> };
export const Placeholder: Story = {
  render: () => <SearchSelectPlaceholder />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox'));
    await screen.findByText('Comet');
  },
};
export const Multiple: Story = { render: () => <SearchSelectMultiple /> };
export const WithDescription: Story = {
  name: 'With description',
  render: () => <SearchSelectWithDescription />,
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole('combobox'));
    await screen.findByText('Finance');
  },
};

export const CustomValue: Story = {
  name: 'Custom value',
  render: () => <SearchSelectCustomValue />,
  play: async ({ canvas, userEvent }) => {
    const field = canvas.getByRole('combobox', { name: 'Role' });
    await userEvent.clear(field);
    await userEvent.type(field, 'Freelancer');
    await screen.findByText('Freelancer');
  },
};

/** The most rows the open list may render: proof that it virtualizes. */
const MAX_RENDERED_OPTIONS = 40;

const measure = (name: string, start: string) => performance.measure(`search-select:${name}`, start);

/**
 * The perf check for the virtualized list. Asserts only what cannot flake: the list virtualizes, filtering finds the
 * match, a pick lands in the field. Timing is measured, never asserted: `performance.getEntriesByType('measure')`
 * holds `search-select:open` and one `search-select:filter` per keystroke. Budget, with 4× CPU throttling: open
 * ≤ 100 ms, filter ≤ 50 ms per keystroke, no long task over 50 ms while scrolling.
 */
export const ManyOptions: StoryObj<typeof SearchSelectManyOptions> = {
  args: { count: 2000, multiple: false },
  argTypes: { count: { control: 'select', options: [100, 2000, 10000] } },
  render: (args) => <SearchSelectManyOptions {...args} />,
  play: async ({ args, canvas, userEvent }) => {
    performance.clearMeasures();
    const field = canvas.getByRole('combobox');

    performance.mark('open');
    await userEvent.click(field);
    const listbox = await screen.findByRole('listbox');
    await waitFor(() => expect(within(listbox).getAllByRole('option').length).toBeGreaterThan(0));
    measure('open', 'open');
    await expect(within(listbox).getAllByRole('option').length).toBeLessThanOrEqual(MAX_RENDERED_OPTIONS);

    for (const key of 'son') {
      performance.mark('filter');
      await userEvent.keyboard(key);
      measure('filter', 'filter');
    }
    await waitFor(() => expect(within(listbox).getAllByRole('option')[0]).toHaveTextContent(/son/i));

    if (args.multiple) {
      for (let pick = 0; pick < 3; pick++) {
        await userEvent.click(within(await screen.findByRole('listbox')).getAllByRole('option')[pick]);
      }
      await waitFor(() =>
        expect(canvas.getAllByText(/son/i, { selector: '[data-slot=combobox-chip]' })).toHaveLength(3),
      );
      return;
    }
    const first = within(listbox).getAllByRole('option')[0];
    const label = first.querySelector('span')?.textContent ?? '';
    await userEvent.click(first);
    await expect(field).toHaveValue(label);
  },
};

export const InAField: Story = {
  name: 'In a field',
  render: () => <SearchSelectInAField />,
};
export const InADialog: Story = {
  name: 'In a dialog',
  render: () => <SearchSelectInADialog />,
  play: open('click', 'Add members', 'Add members'),
};
export const States: Story = { render: () => <SearchSelectStates /> };
