import { OTPFieldDefault } from '../examples/otp-field/default';
import { OTPFieldFourDigits } from '../examples/otp-field/four-digits';
import { OTPFieldStates } from '../examples/otp-field/states';
import { OTPFieldVerify } from '../examples/otp-field/verify';
import { ExampleSection, FoundationPage } from '../kit/blocks';
import { defineDocs } from '../kit/docs';

export default defineDocs({
  title: 'OTP Field',
  description: 'A one-time code, one input per character.',
  group: 'Components',
  Page: () => (
    <FoundationPage
      title='OTP Field'
      description='A one-time code, one input per character. Typing, paste and autofill advance the focus.'>
      <ExampleSection
        title='Default'
        description='Six digits in two groups of three, as authenticator apps print them.'>
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
});
