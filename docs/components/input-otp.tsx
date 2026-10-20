import { InputOTPDefault } from '../examples/input-otp/default';
import { InputOTPFourDigits } from '../examples/input-otp/four-digits';
import { InputOTPStates } from '../examples/input-otp/states';
import { InputOTPVerify } from '../examples/input-otp/verify';
import { ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'Input OTP',
  description: 'A one-time code, one input per character.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='Input OTP'
      description='A one-time code, one input per character. Typing, paste and autofill advance the focus.'>
      <ExampleSection
        title='Default'
        description='Six digits in two groups of three, as authenticator apps print them.'>
        <InputOTPDefault />
      </ExampleSection>
      <ExampleSection title='Four digits' description='`mask` hides the digits, for a PIN.'>
        <InputOTPFourDigits />
      </ExampleSection>
      <ExampleSection
        title='Verify'
        description='The sixth digit submits. A wrong code shakes the row, clears it and focuses the first slot; a letter shakes its slot.'>
        <InputOTPVerify />
      </ExampleSection>
      <ExampleSection
        title='States'
        description='Incomplete turns only the empty slots; a wrong code turns all of them.'>
        <InputOTPStates />
      </ExampleSection>
    </FoundationPage>
  ),
});
