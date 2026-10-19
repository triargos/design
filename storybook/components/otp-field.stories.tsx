import type { Meta, StoryObj } from '@storybook/react-vite';

import type { ShotSpec } from '../../.storybook/shot';
import { OTPFieldDefault } from '../examples/otp-field/default';
import { OTPFieldFourDigits } from '../examples/otp-field/four-digits';
import { OTPFieldStates } from '../examples/otp-field/states';
import { OTPFieldVerify } from '../examples/otp-field/verify';
import { ExampleSection, FoundationPage } from '../kit/blocks';

const meta = {
  title: 'Components/OTP Field',
  parameters: { description: 'A one-time code, one input per character.' },
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Board: Story = {
  parameters: {
    frame: 'page',
    shots: [
      {
        name: 'typing',
        target: { section: 'Verify' },
        scene: [
          { click: 'section[data-title=Verify] input[data-slot=otp-field-input] >> nth=0' },
          { key: '1' },
          { key: '2' },
          { key: 'a' },
        ],
        output: { frames: 6, every: 50, slow: 0.25 },
      },
      {
        name: 'wrong code',
        target: { section: 'Verify' },
        scene: [{ fill: 'section[data-title=Verify] input[data-slot=otp-field-input] >> nth=0', text: '654321' }],
        output: { frames: 8, every: 120 },
      },
      { name: 'mobile', target: { section: 'Default' }, variant: { device: 'iPhone SE' } },
    ] satisfies ReadonlyArray<ShotSpec>,
  },
  render: () => (
    <FoundationPage
      title='OTP Field'
      description='A one-time code, one input per character, on the field surface. Typing, paste and autofill advance the focus; the login’s two-factor step.'>
      <ExampleSection
        title='Default'
        description='Six digits in two groups of three, as the authenticator app prints them.'>
        <OTPFieldDefault />
      </ExampleSection>
      <ExampleSection title='Four digits' description='`mask` hides the digits, for a PIN.'>
        <OTPFieldFourDigits />
      </ExampleSection>
      <ExampleSection
        title='Verify'
        description='The sixth digit submits. A wrong code shakes the row, clears it and focuses the first slot; a letter shakes its slot.'>
        <OTPFieldVerify />
      </ExampleSection>
      <ExampleSection
        title='States'
        description='Incomplete turns only the empty slots; a wrong code turns all of them.'>
        <OTPFieldStates />
      </ExampleSection>
    </FoundationPage>
  ),
};

export const Default: Story = { render: () => <OTPFieldDefault /> };
export const FourDigits: Story = {
  name: 'Four digits',
  render: () => <OTPFieldFourDigits />,
};
export const Verify: Story = { render: () => <OTPFieldVerify /> };
export const States: Story = { render: () => <OTPFieldStates /> };
