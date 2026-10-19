import type { Meta, StoryObj } from '@storybook/react-vite';

import { InputOTPDefault } from '../examples/input-otp/default';
import { InputOTPDisabled } from '../examples/input-otp/disabled';
import { InputOTPFourDigits } from '../examples/input-otp/four-digits';
import { InputOTPWithSeparator } from '../examples/input-otp/with-separator';
import { ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/Input OTP',
  parameters: { description: 'A one-time code, one slot per digit.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: { frame: 'page' },
  render: () => (
    <FoundationPage
      title='Input OTP'
      description='A one-time code, one slot per digit, on the field surface. The login’s two-factor step.'>
      <ExampleSection title='Default' description='Six slots.'>
        <InputOTPDefault />
      </ExampleSection>
      <ExampleSection title='Four digits'>
        <InputOTPFourDigits />
      </ExampleSection>
      <ExampleSection title='With separator'>
        <InputOTPWithSeparator />
      </ExampleSection>
      <ExampleSection title='Disabled'>
        <InputOTPDisabled />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <InputOTPDefault /> };
export const FourDigits: Story = {
  name: 'Four digits',
  render: () => <InputOTPFourDigits />,
};
export const WithSeparator: Story = {
  name: 'With separator',
  render: () => <InputOTPWithSeparator />,
};
export const Disabled: Story = { render: () => <InputOTPDisabled /> };
