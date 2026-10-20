import type { Meta, StoryObj } from '@storybook/react-vite';

import { AccordionControlled } from '../examples/accordion/controlled';
import { AccordionDefault } from '../examples/accordion/default';
import { AccordionFullBleedRows } from '../examples/accordion/full-bleed-rows';
import { AccordionInACard } from '../examples/accordion/in-a-card';
import { AccordionMultiple } from '../examples/accordion/multiple';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Accordion',
  parameters: { description: 'Sections that open in place, for content people scan by title.', frame: 'column' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage title='Accordion' description='Sections that open in place, for content people scan by title.'>
      <ExampleSection title='Default' description='One open at a time.'>
        <AccordionDefault />
      </ExampleSection>
      <ExampleSection
        title='Multiple'
        description={
          <>
            <Code>multiple</Code>: several sections open side by side.
          </>
        }>
        <AccordionMultiple />
      </ExampleSection>
      <ExampleSection
        title='Controlled'
        description={
          <>
            <Code>value</Code> and <Code>onValueChange</Code>: open or close all from outside.
          </>
        }>
        <AccordionControlled />
      </ExampleSection>
      <ExampleSection title='In a card' bare>
        <AccordionInACard />
      </ExampleSection>
      <ExampleSection
        title='Full-bleed rows'
        description='Rows that paint to the card edge: the item drops its pb-1, the trigger and content set their own padding.'
        bare>
        <AccordionFullBleedRows />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <AccordionDefault /> };
export const Multiple: Story = { render: () => <AccordionMultiple /> };
export const Controlled: Story = { render: () => <AccordionControlled /> };
export const InACard: Story = {
  name: 'In a card',
  render: () => <AccordionInACard />,
};
export const FullBleedRows: Story = {
  name: 'Full-bleed rows',
  render: () => <AccordionFullBleedRows />,
};
