import type { Meta, StoryObj } from '@storybook/react-vite';

import { FieldColumns } from '../examples/field/columns';
import { FieldDefault } from '../examples/field/default';
import { FieldDisabled } from '../examples/field/disabled';
import { FieldHorizontal } from '../examples/field/horizontal';
import { FieldInACard } from '../examples/field/in-a-card';
import { FieldInAForm } from '../examples/field/in-a-form';
import { FieldPills } from '../examples/field/pills';
import { FieldSeveralErrors } from '../examples/field/several-errors';
import { FieldWithDescription } from '../examples/field/with-description';
import { FieldWithError } from '../examples/field/with-error';
import { FieldWithTitle } from '../examples/field/with-title';
import { Code, ExampleSection, FoundationPage } from '../kit/blocks';
import { open } from '../kit/play';

const meta = {
  title: 'Components/Field',
  parameters: { description: 'A label, a control, a description and an error, in that order.', frame: 'column' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Field'
      description='A label, a control, a description and an error, in that order. Forms are fields in a card.'>
      <ExampleSection title='Default' description='Label to control: related.'>
        <FieldDefault />
      </ExampleSection>
      <ExampleSection title='With description' description='Tight under the control.'>
        <FieldWithDescription />
      </ExampleSection>
      <ExampleSection
        title='With error'
        description={
          <>
            <Code>invalid</Code> on the field, <Code>aria-invalid</Code> on the control, <Code>FieldError</Code> last.
          </>
        }>
        <FieldWithError />
      </ExampleSection>
      <ExampleSection
        title='Several errors'
        description={
          <>
            <Code>FieldError errors</Code> lists them.
          </>
        }>
        <FieldSeveralErrors />
      </ExampleSection>
      <ExampleSection
        title='With title'
        description={
          <>
            A control that is not an input is named by <Code>FieldTitle</Code> through aria-labelledby.
          </>
        }>
        <FieldWithTitle />
      </ExampleSection>
      <ExampleSection
        title='Pills'
        description={
          <>
            Pills sit under their label: <Code>TabsRadioGroup</Code>.
          </>
        }>
        <FieldPills />
      </ExampleSection>
      <ExampleSection
        title='Columns'
        description={
          <>
            <Code>FieldGroup columns={2}</Code> for short peers.
          </>
        }>
        <FieldColumns />
      </ExampleSection>
      <ExampleSection
        title='Horizontal'
        description={
          <>
            Settings: <Code>orientation='horizontal'</Code> puts the label and description beside the control.
          </>
        }
        bare>
        <FieldHorizontal />
      </ExampleSection>
      <ExampleSection
        title='In a card'
        description='A form is fields in a card; the footer shows while there are changes.'
        bare>
        <FieldInACard />
      </ExampleSection>
      <ExampleSection
        title='In a form'
        description='With react-hook-form, Controller renders the Field. Submit to see the error.'>
        <FieldInAForm />
      </ExampleSection>
      <ExampleSection
        title='Disabled'
        description={
          <>
            <Code>disabled</Code> on the field mutes the label; the control takes its own.
          </>
        }>
        <FieldDisabled />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <FieldDefault /> };
export const WithDescription: Story = {
  name: 'With description',
  render: () => <FieldWithDescription />,
};
export const WithError: Story = {
  name: 'With error',
  render: () => <FieldWithError />,
};
export const SeveralErrors: Story = {
  name: 'Several errors',
  render: () => <FieldSeveralErrors />,
};
export const WithTitle: Story = {
  name: 'With title',
  render: () => <FieldWithTitle />,
};
export const Pills: Story = { render: () => <FieldPills /> };
export const Columns: Story = { render: () => <FieldColumns /> };
export const Horizontal: Story = { render: () => <FieldHorizontal /> };
export const InACard: Story = {
  name: 'In a card',
  render: () => <FieldInACard />,
};
export const InAForm: Story = {
  name: 'In a form',
  render: () => <FieldInAForm />,
  play: open('click', 'Invite', 'Enter a valid email address.'),
};
export const Disabled: Story = { render: () => <FieldDisabled /> };
